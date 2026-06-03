import { SqliteDurableObject } from "rwsdk/db"
import { sql, type Migrations } from "rwsdk/db"

/**
 * Minimal schema for the repro. A single table is enough — all we need is for
 * the Kysely Migrator to have *something* to migrate, so that `initialize()`
 * runs its `migrateToLatest()` -> `ensureMigrationTableExists()` ->
 * SqliteIntrospector.getTables() path.
 */
export const reproMigrations = {
  "001_initial": {
    async up(db) {
      return [
        await db.schema
          .createTable("items")
          .addColumn("id", "text", (col) => col.primaryKey())
          .addColumn("createdAt", "text", (col) =>
            col.notNull().defaultTo(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
          )
          .execute(),
      ]
    },
    async down(db) {
      await db.schema.dropTable("items").ifExists().execute()
    },
  },
} satisfies Migrations

/**
 * Reproduction of an rwsdk `SqliteDurableObject` bug.
 *
 * SUMMARY
 * -------
 * Once a Durable Object that extends `SqliteDurableObject` uses the Durable
 * Object *storage* API (`ctx.storage.put` / `ctx.storage.setAlarm`), Cloudflare
 * creates internal, reserved `_cf_*`-prefixed tables inside the SAME SQLite
 * database that Kysely migrates.
 *
 * On the NEXT cold start of that DO (after eviction), `initialize()` runs
 * `migrator.migrateToLatest()`. The very first thing the Kysely Migrator does
 * is `ensureMigrationTableExists()`, which calls `SqliteIntrospector.getTables()`.
 * The introspector enumerates `sqlite_master` and runs `PRAGMA table_info(<name>)`
 * for EVERY table it finds — including the `_cf_*` tables. Cloudflare's SQLite
 * authorizer rejects any access to a `_cf_`-prefixed identifier, so that PRAGMA
 * throws `SQLITE_AUTH` and the whole `initialize()` fails.
 *
 * WHY IT'S INTERMITTENT IN REAL APPS
 * ----------------------------------
 * The migrations would actually no-op (they're already recorded in
 * `__migrations`); the failure happens during the *existence check* that runs
 * before the comparison. It only manifests on a COLD init (fresh instance,
 * `initialized === false`) against a DB that ALREADY contains `_cf_*` tables.
 * A warm instance short-circuits at `if (this.initialized) return`, and a cold
 * init on a DB that has never used the storage API has no `_cf_*` tables to trip
 * over — so the bug hides until a DO that used storage gets evicted and touched
 * again.
 *
 * This DO reproduces the sequence deterministically using `ctx.abort()` to force
 * the eviction that would otherwise happen on idle / between test runs.
 */
export class ReproDurableObject extends SqliteDurableObject {
  migrations = reproMigrations

  /**
   * Step 1 — normal usage.
   * Run a query (forces `initialize()` -> migrations to run on a clean DB), then
   * use the DO storage API, which creates Cloudflare's internal `_cf_*` tables
   * in the same SQLite database.
   */
  async seedAndUseStorage(): Promise<void> {
    await this.initialize()
    await this.kysely
      .insertInto("items")
      .values({ id: crypto.randomUUID() })
      .execute()

    // These two calls are what create the reserved _cf_* tables:
    await this.ctx.storage.put("repro-key", "repro-value")
    await this.ctx.storage.setAlarm(Date.now() + 60 * 60 * 1000)
  }

  /** Inspect raw sqlite_master so the test can SEE the _cf_* tables exist. */
  listTables() {
    const cursor = this.ctx.storage.sql.exec<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name",
    )
    return cursor.toArray().map((row) => row.name)
  }

  /**
   * Step 2 — force a cold restart.
   * `ctx.abort()` discards the in-memory instance; the next request constructs a
   * fresh one with `initialized === false`. This is the deterministic equivalent
   * of the eviction that happens naturally when a DO goes idle.
   */
  forceColdRestart(): void {
    this.ctx.abort("repro: forcing cold restart to re-trigger initialize()")
  }

  /**
   * Step 3 — query after the cold restart.
   * On the fresh instance, `initialize()` runs `migrateToLatest()` again. The
   * introspector's `PRAGMA table_info('_cf_*')` throws SQLITE_AUTH here.
   *
   * EXPECTED: returns the row count (migrations no-op, query succeeds).
   * ACTUAL (bug): throws `not authorized: SQLITE_AUTH`.
   *
   * Returns a primitive (number) rather than the rows because RPC return types
   * must be serializable — `Promise<unknown[]>` collapses to `never` on the stub.
   */
  async queryAfterColdRestart(): Promise<number> {
    await this.initialize()
    const rows = await this.kysely.selectFrom("items").selectAll().execute()
    return rows.length
  }

  // Required because we set an alarm. Scheduled an hour out so it never fires
  // during the test; it's only set to create the _cf_* tables.
  async alarm(): Promise<void> {}
}

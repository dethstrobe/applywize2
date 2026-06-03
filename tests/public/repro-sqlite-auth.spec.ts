import { test, expect } from "@playwright/test"

/**
 * Reproduces an rwsdk `SqliteDurableObject` bug.
 *
 * Once a DO uses the Durable Object storage API (`ctx.storage.put` /
 * `setAlarm`), Cloudflare creates reserved `_cf_*` tables in the same SQLite
 * database. On the next COLD start, `SqliteDurableObject.initialize()` runs the
 * Kysely Migrator, whose `ensureMigrationTableExists()` calls
 * `SqliteIntrospector.getTables()`. The introspector runs
 * `PRAGMA table_info(<name>)` for every table — including the `_cf_*` ones —
 * and Cloudflare's SQLite authorizer rejects that with `SQLITE_AUTH`, failing
 * `initialize()`.
 *
 * The `/repro` route drives the full sequence against a fresh DO. This test
 * asserts the EXPECTED (correct) behavior: a query after a cold restart should
 * succeed. While the bug is present, it FAILS with the SQLITE_AUTH stack trace
 * surfaced in `body.error`.
 */
test("cold re-init of a storage-using SqliteDurableObject should not throw SQLITE_AUTH", async ({
  request,
}) => {
  const res = await request.get("/repro")
  const body = (await res.json()) as {
    tablesBefore?: string[]
    bug: boolean
    error?: string
    message?: string
  }

  // Sanity check: the storage API really did create reserved _cf_* tables in
  // the DO's SQLite database. (If this fails, the repro setup is wrong, not the
  // bug.)
  const hasCfTables = body.tablesBefore?.some((t: string) =>
    t.toLowerCase().startsWith("_cf_"),
  )
  expect(
    hasCfTables,
    `expected internal _cf_* tables in sqlite_master, got: ${JSON.stringify(
      body.tablesBefore,
    )}`,
  ).toBe(true)

  // The actual assertion: querying after a cold restart should succeed.
  // Fails today with SQLITE_AUTH — see body.error for the introspector stack.
  expect(body.bug, body.error ?? body.message).toBe(false)
})

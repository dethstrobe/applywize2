import { env } from "cloudflare:workers"
import { route } from "rwsdk/router"

/**
 * Orchestrates the SQLITE_AUTH reproduction (see reproDurableObject.ts).
 *
 * Uses a fresh, unique DO id per request so every run starts from a clean
 * SQLite database — mirroring the real-world sequence:
 *   clean DB -> migrate -> use storage (creates _cf_* tables) -> cold restart ->
 *   query -> SQLITE_AUTH.
 *
 * Returns JSON describing whether the bug reproduced. HTTP 500 when it did.
 */
export const reproRoute = route("/repro", async () => {
  const ns = env.REPRO_DURABLE_OBJECT
  const name = crypto.randomUUID()

  // Step 1: clean DB -> migrate + query, then use the storage API.
  const stub = ns.get(ns.idFromName(name))
  await stub.seedAndUseStorage()

  // Capture sqlite_master so the response shows the reserved _cf_* tables.
  const tablesBefore = await stub.listTables()

  // Step 2: force a cold restart. abort() rejects the in-flight RPC, which is
  // expected — swallow it.
  try {
    await stub.forceColdRestart()
  } catch {
    // expected: the RPC is aborted as the instance is torn down
  }

  // Step 3: touch the now-cold DO. A new stub routes to a freshly constructed
  // instance (initialized === false) -> initialize() -> introspector.
  const coldStub = ns.get(ns.idFromName(name))
  try {
    const rowCount = await coldStub.queryAfterColdRestart()
    return Response.json({
      bug: false,
      message: "Query succeeded after cold restart — bug NOT reproduced.",
      tablesBefore,
      rowCount,
    })
  } catch (error) {
    return Response.json(
      {
        bug: true,
        message:
          "Cold re-init threw — bug reproduced. SQLITE_AUTH from the Kysely "
          + "introspector running PRAGMA table_info on Cloudflare's _cf_* tables.",
        tablesBefore,
        error: error instanceof Error ? error.stack : String(error),
      },
      { status: 500 },
    )
  }
})

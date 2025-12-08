import { test, expect } from "@playwright/test"
import { TESTPASSKEY } from "../../src/scripts/test-passkey.js"
import { selectors } from "../util.js"
import Database from "better-sqlite3"
import {
  enableVirtualAuthenticator,
  addPasskeyCredential,
  simulateSuccessfulPasskeyInput,
} from "@test2doc/playwright-passkey"
import path from "path"
import fs from "node:fs"

function getTestDbPath(): string {
  const doDir = path.join(
    ".wrangler",
    "state",
    "v3",
    "do",
    "__change_me__-AppDurableObject",
  )
  const files = fs.readdirSync(doDir)
  const sqliteFile = files.find((f) => f.endsWith(".sqlite"))

  if (!sqliteFile) {
    throw new Error(`No SQLite file found in ${doDir}`)
  }

  return path.join(doDir, sqliteFile)
}

test("Login setup", async ({ page }) => {
  const db = new Database(getTestDbPath())

  // Reset the test passkey counter
  db.prepare(
    `
      UPDATE credentials
      SET counter = 0
      WHERE userId = ?
    `,
  ).run(TESTPASSKEY.userId)

  db.close()

  const authenticator = await enableVirtualAuthenticator(page)

  await addPasskeyCredential(authenticator, TESTPASSKEY)

  await page.goto("/auth/login")

  const input = page.getByRole(...selectors.inputUsername)
  await input.fill(TESTPASSKEY.username)

  await simulateSuccessfulPasskeyInput(
    authenticator,
    async () => await page.getByRole(...selectors.buttonLogin).click(),
  )

  await expect(
    page.getByRole("heading", { name: "Applications" }),
  ).toBeVisible()

  await page.context().storageState({ path: "playwright/.auth/user.json" })
})

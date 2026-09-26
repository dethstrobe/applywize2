import { test, expect } from "@playwright/test"
import { TESTPASSKEY } from "../../src/scripts/test-passkey.js"
import { getTestDbPath, selectors } from "../util.js"
import Database from "better-sqlite3"

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

  await page.context().credentials.create(TESTPASSKEY.rpId, TESTPASSKEY)
  await page.context().credentials.install()

  await page.goto("/auth/login")
  // Wait for the page's JavaScript to finish loading, or the login click can
  // land before React is ready to handle it
  await page.waitForLoadState("networkidle")

  const input = page.getByRole(...selectors.inputUsername)
  await input.fill(TESTPASSKEY.username)

  await page.getByRole(...selectors.buttonLogin).click()

  await expect(
    page.getByRole("heading", { name: "Applications" }),
  ).toBeVisible()

  await page.context().storageState({ path: "playwright/.auth/user.json" })
})

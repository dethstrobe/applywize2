import { test, expect } from "@playwright/test"
import { withDocCategory, withDocMeta } from "@test2doc/playwright/DocMeta"
import { screenshot } from "@test2doc/playwright/screenshots"
import { selectors } from "./util"

test.describe(
  withDocCategory("Applications Page", {
    label: "Applications Page",
    position: 2,
    link: {
      type: "generated-index",
      description: "The full documentation for the Applications Page.",
    },
  }),
  () => {
    test.describe(
      withDocMeta("How to logout", {
        description: "Steps to logout from the application",
      }),
      () => {
        test("Logout link", async ({ page }, testInfo) => {
          await test.step("On a logged in page ", async () => {
            await page.goto("/applications")
          })

          const logoutLink = page.getByRole(...selectors.headerLogout)

          await test.step("the Logout link is visible in the header.", async () => {
            await screenshot(testInfo, logoutLink, {
              annotation: { text: "The Logout Link" },
            })
            await expect(logoutLink).toBeVisible()
          })

          await test.step("Clicking the Logout link logs the user out and takes them to the login page. ", async () => {
            await logoutLink.click()
            await expect(
              page.getByRole(...selectors.headingLogin),
            ).toBeVisible()
          })

          await test.step("The user is now logged out ending their current session.", async () => {
            await page.goto("/applications")
            await expect(
              page.getByRole(...selectors.headingLogin),
            ).toBeVisible()
          })
        })
      },
    )
  },
)

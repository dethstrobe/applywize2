import { test, expect } from "@playwright/test"
import { withDocCategory, withDocMeta } from "@test2doc/playwright/DocMeta"
import { screenshot } from "@test2doc/playwright/screenshots"
import { selectors } from "../util"

enum ColumnHeaders {
  Status,
  DateApplied,
  JobTitle,
  Company,
  Contact,
  Salary,
  ViewButton,
}

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
      withDocMeta("Applications Table", {
        title: "Applications Table",
        description:
          "The Applications Table displays a list of job applications with relevant details.",
      }),
      () => {
        test("Data displayed", async ({ page }, testInfo) => {
          await test.step("On the Applications page", async () => {
            await page.goto("/applications")
          })

          const table = page.getByRole("table", { name: "All Applications" })

          await test.step(`**Applications Table** displays the following data:

        - Status
        - Date Applied
        - Job Title
        - Company
        - Contact
        - Salary
        `, async () => {
            const tableHeaders = table.getByRole("columnheader")

            await expect(tableHeaders.nth(ColumnHeaders.Status)).toHaveText(
              "Status",
            )
            await expect(
              tableHeaders.nth(ColumnHeaders.DateApplied),
            ).toHaveText("Date Applied")
            await expect(tableHeaders.nth(ColumnHeaders.JobTitle)).toHaveText(
              "Job Title",
            )
            await expect(tableHeaders.nth(ColumnHeaders.Company)).toHaveText(
              "Company",
            )
            await expect(tableHeaders.nth(ColumnHeaders.Contact)).toHaveText(
              "Contact",
            )
            await expect(tableHeaders.nth(ColumnHeaders.Salary)).toHaveText(
              "Salary",
            )
          })

          await test.step("\nWhich will be displayed in the table", async () => {
            const row = table.getByRole(...selectors.applicationRowActive)
            await screenshot(testInfo, row)
            const tableCellsInTestRow = row.getByRole("cell")

            await expect(
              tableCellsInTestRow.nth(ColumnHeaders.Status),
            ).toHaveText("New")
            await expect(
              tableCellsInTestRow.nth(ColumnHeaders.DateApplied),
            ).toHaveText("November 29, 2025")
            await expect(
              tableCellsInTestRow.nth(ColumnHeaders.JobTitle),
            ).toHaveText("Software Engineer")
            await expect(
              tableCellsInTestRow.nth(ColumnHeaders.Company),
            ).toHaveText("Tech Corp Inc.")
            await expect(
              tableCellsInTestRow.nth(ColumnHeaders.Contact),
            ).toContainText("John Doe")
            await expect(
              tableCellsInTestRow.nth(ColumnHeaders.Salary),
            ).toHaveText("80000-120000")
            await expect(
              tableCellsInTestRow
                .nth(ColumnHeaders.ViewButton)
                .getByRole("link"),
            ).toHaveAttribute("href", /\/applications\/.+/)
          })
        })
      },
    )

    test.describe(
      withDocMeta("The Internal Page Header", {
        description: "The Header that appears on logged in pages",
      }),
      () => {
        test("The Logo", async ({ page }, testInfo) => {
          await test.step("On a logged in page ", async () => {
            await page.goto("/applications")
          })

          const logo = page.getByRole(...selectors.headerApplyWizeLogo)

          await test.step("the logo is visible in the header.", async () => {
            await screenshot(testInfo, logo, {
              annotation: { text: "The ApplyWize Logo" },
            })
            await expect(logo).toBeVisible()
          })

          await test.step("Clicking the logo takes you to the Home page.", async () => {
            await logo.click()
            await expect(page.getByRole(...selectors.headingHome)).toBeVisible()
          })
        })

        test("Dashboard link", async ({ page }, testInfo) => {
          await test.step("On a logged in page ", async () => {
            // TODO: change to another logged in page when available
            await page.goto("/applications")
          })

          const dashboardLink = page.getByRole(...selectors.linkDashboard)

          await test.step("the Dashboard link is visible in the header.", async () => {
            await screenshot(testInfo, dashboardLink, {
              annotation: { text: "The Dashboard Link" },
            })
            await expect(dashboardLink).toBeVisible()
          })

          await test.step("Clicking the Dashboard link takes you to the Dashboard page.", async () => {
            await dashboardLink.click()
            await expect(
              page.getByRole(...selectors.headingApplications),
            ).toBeVisible()
          })
        })

        test("Settings link", async ({ page }, testInfo) => {
          await test.step("On a logged in page ", async () => {
            await page.goto("/applications")
          })

          const settingsLink = page.getByRole(...selectors.headerSettings)

          await test.step("the Settings link is visible in the header.", async () => {
            await screenshot(testInfo, settingsLink, {
              annotation: { text: "The Settings Link" },
            })
            await expect(settingsLink).toBeVisible()
          })

          await test.step("Clicking the Settings link takes you to the Settings page.", async () => {
            await settingsLink.click()
            await expect(
              page.getByRole(...selectors.headingSettings),
            ).toBeVisible()
          })
        })

        test("Account link", async ({ page }, testInfo) => {
          await test.step("On a logged in page ", async () => {
            await page.goto("/applications")
          })

          const accountLink = page.getByRole(...selectors.headerAccount)

          await test.step("the Account link is visible in the header.", async () => {
            await screenshot(testInfo, accountLink, {
              annotation: { text: "The Account Link" },
            })
            await expect(accountLink).toBeVisible()
          })

          await test.step("Clicking the Account link takes you to the Account page.", async () => {
            await accountLink.click()
            await expect(
              page.getByRole(...selectors.headingAccount),
            ).toBeVisible()
          })
        })
      },
    )

    test.describe("Filtering Applications", () => {
      test("Display Archived Applications", async ({ page }, testInfo) => {
        await test.step("On the Applications page ", async () => {
          await page.goto("/applications")
        })

        const archiveButton = page.getByRole(
          ...selectors.buttonArchiveApplication,
        )

        await test.step("the **Archive Application** button is visible. ", async () => {
          await screenshot(testInfo, archiveButton, {
            annotation: { text: "The Archive Application Button" },
          })
          await expect(archiveButton).toBeVisible()
        })

        await test.step("Clicking the button shows archived applications in the table.", async () => {
          const activeRow = page.getByRole(...selectors.applicationRowActive)
          const archivedRow = page.getByRole(
            ...selectors.applicationRowArchived,
          )

          await expect(activeRow).toBeVisible()
          await expect(archivedRow).not.toBeVisible()

          await archiveButton.click()

          await screenshot(testInfo, archivedRow, {
            annotation: { text: "An Archived Application Row" },
          })
          await expect(archivedRow).toBeVisible()
          await expect(activeRow).not.toBeVisible()
        })

        await test.step("To switch back to active applications, click the 'Active' button.", async () => {
          const activeButton = page.getByRole(
            ...selectors.buttonActiveApplication,
          )
          await screenshot(testInfo, activeButton, {
            annotation: { text: "Click to show active applications" },
          })
          await expect(activeButton).toBeVisible()
          await activeButton.click()

          await expect(
            page.getByRole(...selectors.applicationRowActive),
          ).toBeVisible()
        })
      })
    })
  },
)

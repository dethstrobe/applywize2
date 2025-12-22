import { test, expect, Locator } from "@playwright/test"
import { withDocCategory, withDocMeta } from "@test2doc/playwright/DocMeta"
import { screenshot } from "@test2doc/playwright/screenshots"
import { selectors, getTestDbPath } from "../util"
import Database from "better-sqlite3"

test.describe(
  withDocCategory("New Applications Page", {
    label: "New Applications Page",
    position: 2,
    link: {
      type: "generated-index",
      description: "The documentation for the New Applications Page.",
    },
  }),
  () => {
    test.describe(
      withDocMeta("New Application", {
        description:
          "Guide to add a new job application using the New Application form.",
      }),
      () => {
        test("How to add a new Job Application", async ({ page }, testInfo) => {
          await test.step("When on the Applications page, ", async () => {
            // clear test data if exists
            const db = new Database(getTestDbPath())

            const companyId = db
              .prepare("SELECT id FROM companies WHERE name = ?")
              .pluck()
              .get("Big Tech Co.") as string | undefined

            if (companyId) {
              db.prepare("DELETE FROM applications WHERE companyId = ?").run(
                companyId,
              )
              db.prepare("DELETE FROM contacts WHERE companyId = ?").run(
                companyId,
              )
              db.prepare("DELETE FROM companies WHERE id = ?").run(companyId)
            }

            db.close()

            await page.clock.setFixedTime(new Date("2025-12-14T10:00:00"))
            await page.goto("/applications")
          })

          await test.step("click one of the New Application buttons.", async () => {
            const newAppButton = await page
              .getByRole(...selectors.buttonNewApplication)
              .all()
            await screenshot(
              testInfo,
              newAppButton.map((btn) => ({ target: btn })),
              {
                annotation: {
                  text: "New Application button",
                  position: "left",
                },
              },
            )

            expect(newAppButton.length).toEqual(2)
            for (const btn of newAppButton) {
              await expect(btn).toHaveAttribute("href", "/applications/new")
            }
            await newAppButton.at(0)?.click()
          })

          await test.step(" This will navigate to the New Application page.", async () => {
            await expect(
              page.getByRole(...selectors.headerNewApplication),
            ).toBeVisible()
          })

          await test.step(`### Fill out the New Application form.

            On the left side we have:
            - **Company Name**: The company you want to track.
            - **Job Title**: The position you applied for.
            - **Job Description / Requirements**: Key details about the job.
            - **Salary Range**: The minimum and maximum salary for the position.
            - **Application URL**: Link to the job posting or application page.
            `, async () => {
            const leftFormGroup = page.getByRole(...selectors.groupCompanyInfo)
            await screenshot(testInfo, leftFormGroup)
            const companyName = page.getByRole(...selectors.inputCompanyName)
            const jobTitle = page.getByRole(...selectors.inputJobTitle)
            const jobDescription = page.getByRole(
              ...selectors.inputJobDescription,
            )
            const salaryMin = page.getByRole(...selectors.inputSalaryMin)
            const salaryMax = page.getByRole(...selectors.inputSalaryMax)
            const applicationUrl = page.getByRole(
              ...selectors.inputApplicationUrl,
            )

            await companyName.fill("Big Tech Co.")
            await jobTitle.fill("Software Engineer")
            await jobDescription.fill(
              "Develop and maintain web applications. Collaborate with cross-functional teams to define, design, and ship new features.",
            )
            await salaryMin.fill("80000")
            await salaryMax.fill("120000")
            await applicationUrl.fill("https://techcorp.com/careers/12345")
          })

          const dateButton = page.getByRole(...selectors.buttonDatePicker)
          await test.step(`
            Right side of the form includes:

            - **Date Applied**: When you submitted your application.
            - **Status**: Current status of your application (e.g., Applied, Interviewing).
            - **Contacts**: People you are in touch with regarding the application.

            #### Setting the Application submission date
            `, async () => {
            await screenshot(testInfo, dateButton)
          })

          await test.step("Click the date button to open the date picker.", async () => {
            await dateButton.click()
            const datePicker = page.getByRole(...selectors.dialog)
            await expect(datePicker).toBeVisible()
            await screenshot(testInfo, datePicker)
          })

          await test.step("Then click a date to select from the date picker.", async () => {
            const dateToSelect = page.getByRole(...selectors.buttonDate)
            await screenshot(testInfo, dateToSelect)
            await dateToSelect.click()
          })

          await test.step(`

            Then to dismiss the date picker:
            - Press **Escape** key.
            - Click outside the date picker.`, async () => {
            await page.keyboard.press("Escape")
            await expect(page.getByRole(...selectors.dialog)).toBeHidden()
          })

          await test.step("#### Select one of the Application Statuses", async () => {
            const statusSelect = page.getByRole(...selectors.comboboxStatus)
            await screenshot(testInfo, statusSelect)
            await statusSelect.click()
          })

          await test.step("Click the Application Statuses button to open the dropdown", async () => {
            const selectOptions = page.getByRole(
              ...selectors.listboxStatusOptions,
            )

            await screenshot(testInfo, selectOptions)
          })

          await test.step(`Select one of the application statuses from the dropdown:

            - New
            - Applied
            - Interview
            - Rejected
            - Offer
            `, async () => {
            enum StatusOption {
              New,
              Applied,
              Interview,
              Rejected,
              Offer,
            }

            const options = page.getByRole(...selectors.options)
            const newOption = options.nth(StatusOption.New)

            // Verify all options are present
            await expect(newOption).toHaveText("New")
            await expect(options.nth(StatusOption.Applied)).toHaveText(
              "Applied",
            )
            await expect(options.nth(StatusOption.Interview)).toHaveText(
              "Interview",
            )
            await expect(options.nth(StatusOption.Rejected)).toHaveText(
              "Rejected",
            )
            await expect(options.nth(StatusOption.Offer)).toHaveText("Offer")

            // Document selecting the "New" option
            await screenshot(testInfo, newOption)
            await newOption.click()
          })

          await test.step("Lastly, submit the New Application form by clicking the **Create** button.", async () => {
            const submitButton = page.getByRole(...selectors.buttonCreate)
            await screenshot(testInfo, submitButton, {
              annotation: {
                text: "Click here to submit the New Application form",
                position: "right",
              },
            })
            await submitButton.click()
          })

          await test.step("This will navigate back to the Applications Dashboard page where we should find our new application listed.", async () => {
            await expect(
              page.getByRole(...selectors.headingApplications),
            ).toBeVisible()

            const newApplicationRow = page.getByRole("row", {
              name: "December 15, 2025 Software Engineer Big Tech Co. 80000-120000",
            })
            await expect(newApplicationRow).toBeVisible()
            await screenshot(testInfo, newApplicationRow)
          })
        })

        test("Breadcrumb Navigation", async ({ page }, testInfo) => {
          await test.step("When on the New Application page, ", async () => {
            await page.goto("/applications/new")
          })

          await test.step("click the Breadcrumb link.", async () => {
            const breadcrumbs: Locator = page.getByRole(
              ...selectors.navBreadcrumb,
            )
            const backToApplicationsLink = breadcrumbs.getByRole(
              ...selectors.linkDashboard,
            )

            await screenshot(testInfo, [
              {
                target: breadcrumbs,
                options: {
                  annotation: {
                    text: "Breadcrumb Navigation",
                    position: "below",
                    highlightFillStyle: "rgba(0, 0, 0, 0.0)",
                  },
                },
              },
              {
                target: backToApplicationsLink,
                options: { annotation: { text: "Back to Applications link" } },
              },
            ])
            await backToApplicationsLink.click()
          })

          await test.step(" This will navigate back to the Applications Dashboard page.", async () => {
            await expect(
              page.getByRole(...selectors.headingApplications),
            ).toBeVisible()
          })
        })
      },
    )
  },
)

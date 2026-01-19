import { test, expect, Locator } from "@playwright/test"
import { withDocCategory, withDocMeta } from "@test2doc/playwright/DocMeta"
import { screenshot } from "@test2doc/playwright/screenshots"
import { selectors, getTestDbPath, StatusOption } from "../util"
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
          const newApplicationRow = page.getByRole("row", {
            name: "December 15, 2025 Software Engineer Big Tech Co. JD John Doe 80000-120000",
          })

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
            await expect(
              page.getByRole(...selectors.headingApplications),
            ).toBeVisible()
            await expect(newApplicationRow).not.toBeVisible()
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

          await test.step(`#### Add a Contact for the Application
            Open the Add a Contact sheet by clicking the "Add a contact" button.`, async () => {
            const addContactButton = page.getByRole(
              ...selectors.buttonAddContact,
            )
            await screenshot(testInfo, addContactButton, {
              annotation: {
                text: "Click here to add a contact for this application",
              },
            })
            await addContactButton.click()
          })

          await test.step(`Enter the contacts information:
            
            - First name
            - Last name
            - Role in the company
            - Email
            `, async () => {
            const firstNameInput = page.getByRole(...selectors.inputFirstName)
            const lastNameInput = page.getByRole(...selectors.inputLastName)
            const roleInput = page.getByRole(...selectors.inputRole)
            const emailInput = page.getByRole(...selectors.inputEmail)

            await screenshot(
              testInfo,
              page.getByRole(...selectors.formContactForm),
            )
            await firstNameInput.fill("John")
            await lastNameInput.fill("Doe")
            await roleInput.fill("HR Manager")
            await emailInput.fill("john.doe@example.com")
          })

          await test.step('Add the contact by clicking the "Create a Contact" button', async () => {
            const createButton = page.getByRole(
              ...selectors.buttonCreateContact,
            )
            await screenshot(testInfo, createButton, {
              annotation: {
                text: "Click here to create the contact",
                position: "left",
              },
            })
            await createButton.click()
          })

          await test.step("Your new contact appears in the Contacts section", async () => {
            const contactCards = page.getByRole(...selectors.listContacts)
            await expect(
              page.getByRole(...selectors.headingTestingContact),
            ).toBeVisible()
            await screenshot(testInfo, contactCards, {
              annotation: {
                text: "Your new contact appears here in the Contacts section",
                position: "left",
              },
            })
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

    test.describe(
      withDocMeta("Contact Card", {
        description: "Details of a contact associated with a job application.",
      }),
      () => {
        test("Contact Card Email button", async ({ page }, testInfo) => {
          await test.step("When on the New Application page, ", async () => {
            await page.goto("/applications/new")
          })

          await test.step("after you added a contact. The contact card displays.", async () => {
            await page.getByRole(...selectors.buttonAddContact).click()

            await page.getByRole(...selectors.inputFirstName).fill("John")
            await page.getByRole(...selectors.inputLastName).fill("Doe")
            await page.getByRole(...selectors.inputRole).fill("HR Manager")
            await page
              .getByRole(...selectors.inputEmail)
              .fill("john.doe@example.com")

            await page.getByRole(...selectors.buttonCreateContact).click()

            const contactCard = page.getByRole(
              ...selectors.headingTestingContact,
            )
            await expect(contactCard).toBeVisible()
          })

          await test.step("Click the Email button on the contact card should open your email client.", async () => {
            const contactEmailButton = page.getByRole(
              ...selectors.buttonContactEmail,
            )
            await screenshot(testInfo, contactEmailButton, {
              annotation: {
                text: "Click the Email button to contact this person",
                position: "left",
              },
            })
            await expect(contactEmailButton).toHaveAttribute(
              "href",
              "mailto:john.doe@example.com",
            )
          })
        })

        test("Remove a Contact", async ({ page }, testInfo) => {
          await test.step("When on the New Application page, ", async () => {
            await page.goto("/applications/new")
          })

          const contactCard1 = page.getByRole(
            ...selectors.headingTestingContact,
          )
          const contactCard2 = page.getByRole(
            ...selectors.headingTestingContact2,
          )
          const contactCard3 = page.getByRole(
            ...selectors.headingTestingContact3,
          )
          await test.step("after you added a contact. The contact card displays.", async () => {
            const addContactButton = page.getByRole(
              ...selectors.buttonAddContact,
            )
            const firstNameInput = page.getByRole(...selectors.inputFirstName)
            const lastNameInput = page.getByRole(...selectors.inputLastName)
            const roleInput = page.getByRole(...selectors.inputRole)
            const emailInput = page.getByRole(...selectors.inputEmail)
            const createContactButton = page.getByRole(
              ...selectors.buttonCreateContact,
            )

            await addContactButton.click()
            await firstNameInput.fill("John")
            await lastNameInput.fill("Doe")
            await roleInput.fill("HR Manager")
            await emailInput.fill("john.doe@example.com")
            await createContactButton.click()

            await addContactButton.click()
            await firstNameInput.fill("Jane")
            await lastNameInput.fill("Smith")
            await roleInput.fill("CTO")
            await emailInput.fill("jane.smith@example.com")
            await createContactButton.click()

            await addContactButton.click()
            await firstNameInput.fill("Joe")
            await lastNameInput.fill("Public")
            await roleInput.fill("Eng Manager")
            await emailInput.fill("joe.public@example.com")
            await createContactButton.click()

            await expect(contactCard1).toBeVisible()
            await expect(contactCard2).toBeVisible()
            await expect(contactCard3).toBeVisible()
            await screenshot(
              testInfo,
              page.getByRole(...selectors.listContacts),
              {
                annotation: {
                  text: "Contact Card displayed in the Contacts section",
                  position: "left",
                },
              },
            )
          })

          const removeButton = page.getByRole(...selectors.buttonRemoveContact)
          await test.step("Hover over the contact card to reveal the Remove button.", async () => {
            await expect(removeButton).toBeAttached()

            await expect(removeButton).toHaveScreenshot(
              "contact-remove-btn--initial.png",
            )
            await contactCard2.hover()
            await expect(removeButton).toHaveScreenshot(
              "contact-remove-btn--hover-focus.png",
            )
            await screenshot(testInfo, removeButton, {
              annotation: {
                text: "Remove Contact button on hover of the contact card",
                position: "left",
                highlightFillStyle: "rgba(0, 0, 0, 0)",
              },
            })
            // reset hover state of contact card by moving mouse somewhere else
            await page.getByRole(...selectors.headerNewApplication).hover()
            await expect(removeButton).toHaveScreenshot(
              "contact-remove-btn--initial.png",
            )
          })

          await test.step("Alternatively, focus on the Remove button to reveal it too.", async () => {
            await expect(removeButton).toHaveScreenshot(
              "contact-remove-btn--initial.png",
            )
            await removeButton.focus()
            await expect(removeButton).toHaveScreenshot(
              "contact-remove-btn--hover-focus.png",
            )
            await screenshot(testInfo, removeButton, {
              annotation: {
                text: "Remove Contact button on focus",
                position: "left",
                highlightFillStyle: "rgba(0, 0, 0, 0)",
              },
            })
            await removeButton.blur()
            await expect(removeButton).toHaveScreenshot(
              "contact-remove-btn--initial.png",
            )
          })

          await test.step("Click the Remove button to delete the contact from the application form.", async () => {
            await removeButton.click()
            await expect(removeButton).toBeHidden()
            await expect(contactCard2).toBeHidden()

            await expect(contactCard1).toBeVisible()
            await expect(contactCard3).toBeVisible()
          })
        })
      },
    )

    test.describe(
      withDocMeta("Form Error Validation", {
        description:
          "Error messaging for validating for the New Application form.",
      }),
      () => {
        test("New Application Form Validation Errors", async ({
          page,
        }, testInfo) => {
          await test.step("When on the New Application page ", async () => {
            await page.goto("/applications/new")
          })

          await test.step("and submit the New Application form with empty fields ", async () => {
            const createButton = page.getByRole(...selectors.buttonCreate)
            await createButton.click()
          })

          await test.step("it will display a notification with error messages for fields that don't pass validation.", async () => {
            const toaster = page.getByRole(...selectors.regionToast)

            await expect(toaster).toContainText(
              "No Application Status selected",
            )
            await expect(toaster).toContainText("Invalid date selected")
            await expect(toaster).toContainText("Job title is required")
            await expect(toaster).toContainText("Company name is required")

            const lastNotification = toaster.getByRole("listitem").nth(-1)
            await lastNotification.hover()
            await screenshot(testInfo, lastNotification, {
              annotation: {
                text: "Notification displaying validation errors",
              },
            })
          })
        })
      },
    )
  },
)

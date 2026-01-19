import { test, expect } from "@playwright/test"
import { withDocCategory, withDocMeta } from "@test2doc/playwright/DocMeta"
import { screenshot } from "@test2doc/playwright/screenshots"
import { selectors, StatusOption } from "../util"
import { createApplicationFixture, deleteApplicationFixture } from "../fixtures"

test.describe(
  withDocCategory("Application Detail Page", {
    label: "Application Detail Page",
    position: 4,
    link: {
      type: "generated-index",
      description: "The full documentation for the Application Detail Page.",
    },
  }),
  () => {
    test.describe(
      withDocMeta("Applications Information", {
        description:
          "The Applications Information displayed on the Application Details Page.",
      }),
      () => {
        test("Displays application details", async ({ page }, testInfo) => {
          await test.step("On the Application page, ", async () => {
            await page.goto("/applications")
          })

          await test.step("to view a specific application's details; clicking the View Detail button (button with the eye icon).", async () => {
            const detailButton = page.getByRole(...selectors.linkDetails)
            await screenshot(testInfo, detailButton, {
              annotation: { text: "View Details Button" },
            })
            await detailButton.click()
          })

          await test.step("This will navigate to the Application Detail page.", async () => {
            const headingDetails = page.getByRole(...selectors.headingDetails)
            await expect(headingDetails).toBeVisible()
            await screenshot(testInfo, page)
          })

          await test.step(`

            ### The Application Detail page

            This page shows the details for a single job application, including its status, metadata, and related actions.

            You can:
            - Navigate back using breadcrumbs
            `, async () => {
            await expect(
              page.getByRole(...selectors.navBreadcrumb),
            ).toContainText("Software Engineer at Tech Corp Inc.")
          })

          await test.step(`- See the job title, company, and application status
            `, async () => {
            await expect(
              page.getByRole(...selectors.headingDetails),
            ).toHaveText("Software Engineer at Tech Corp Inc. New")
          })

          await test.step(`- Button linking to the original job posting
            `, async () => {
            const jobLink = page.getByRole(...selectors.buttonViewApplication)
            await expect(jobLink).toHaveAttribute(
              "href",
              "https://example.com/jobs/123",
            )
          })
          await test.step(`- Main section describing the role
            `, async () => {
            await expect(
              page.getByRole(...selectors.mainDetails),
            ).toContainText("Develop and maintain web applications.")
          })
          await test.step(`- Compensation showing the salary range
            `, async () => {
            await expect(
              page.getByRole(...selectors.regionCompensation),
            ).toContainText("80000 - 120000")
          })
          await test.step(`- Contacts section for related contacts
            `, async () => {
            await expect(
              page.getByRole(...selectors.regionContacts),
            ).toContainText("John Doe")
            await expect(
              page.getByRole(...selectors.buttonDetailsContactEmail),
            ).toHaveAttribute("href", "mailto:john.doe@techcorp.com")
          })
          await test.step(`- Edit to update the application details
            `, async () => {
            const editButton = page.getByRole(...selectors.buttonDetailsEdit)
            await expect(editButton).toBeVisible()
          })
          await test.step(`- Delete to remove the application
            `, async () => {
            const deleteButton = page.getByRole(
              ...selectors.buttonDetailsDelete,
            )
            await expect(deleteButton).toBeVisible()
          })
        })
      },
    )

    test.describe("How to delete an application", () => {
      test("On the application detail page", async ({ page }, testInfo) => {
        await test.step("On the Application Detail page, ", async () => {
          await createApplicationFixture(page, {
            companyName: "Delete Details LLC.",
            jobTitle: "SWE",
            jobDescription: "Placeholder text",
            salaryMin: "$0",
            salaryMax: "$0",
            applicationUrl: "https://example.com/career/12345",
            contactFirstName: "Delete",
            contactLastName: "McDetailson",
            contactEmail: "umacdetailson@deletedetailsllc.com",
            contactRole: "Mild mannered manager",
          })

          await expect(
            page.getByRole(...selectors.applicationRowToDelete),
          ).toBeVisible()
          await page
            .getByRole(...selectors.buttonViewDetailsForDeleteApplication)
            .click()
        })

        await test.step("click the Delete button to open a confirmation dialog.", async () => {
          const deleteButton = page.getByRole(...selectors.buttonDetailsDelete)
          await screenshot(testInfo, deleteButton, {
            annotation: { text: "Delete Application Button" },
          })

          await deleteButton.click()

          await expect(
            page.getByRole(...selectors.headingDetailsDeleteDialog),
          ).toBeVisible()
        })

        await test.step("In the dialog, you can either cancel or confirm the deletion.", async () => {
          const cancelButton = page.getByRole(...selectors.buttonDetailsCancel)
          const confirmButton = page.getByRole(
            ...selectors.buttonDetailsConfirm,
          )

          await expect(cancelButton).toBeVisible()
          await expect(confirmButton).toBeVisible()
          await confirmButton.hover()

          await screenshot(testInfo, page)
        })

        await test.step("Clicking 'Nevermind' will close the dialog without deleting the application.", async () => {
          const cancelButton = page.getByRole(...selectors.buttonDetailsCancel)
          await cancelButton.click()

          await expect(
            page.getByRole(...selectors.headingDetailsDeleteDialog),
          ).toBeHidden()

          // Open the dialog again for the next step
          await page.getByRole(...selectors.buttonDetailsDelete).click()
        })

        await test.step("Clicking 'Yes, Delete It' will remove the application and redirect you to the dashboard.", async () => {
          const confirmButton = page.getByRole(
            ...selectors.buttonDetailsConfirm,
          )
          await confirmButton.click()

          // Verify that we are redirected back to the applications list
          await expect(
            page.getByRole(...selectors.headingApplications),
          ).toBeVisible()
          await expect(
            page.getByRole(...selectors.applicationRowToDelete),
          ).toBeHidden()
        })
      })
    })

    test.describe("How to edit an application", () => {
      test("On the application detail page", async ({ page }, testInfo) => {
        await page.clock.setFixedTime(new Date("2025-12-14T10:00:00"))
        const initialApplication = {
          companyName: "Edit Details Co.",
          jobTitle: "DevOps Engineer",
          jobDescription: "Placeholder text",
          salaryMin: "$0",
          salaryMax: "$0",
          applicationUrl: "https://example.com/career/12345",
          contactFirstName: "Edit",
          contactLastName: "McEditson",
          contactEmail: "umceditson@editdetailsco.com",
          contactRole: "Editorial Manager",
        }
        const expectedApplication = {
          companyName: "Edited Details Company",
          jobTitle: "Edited Developer Operations Engineer",
          jobDescription:
            "Edited description for the developer operations engineer role.",
          salaryMin: "120000",
          salaryMax: "160000",
          applicationUrl: "https://example.com/careers/edited-12345",
          contactFirstName: "Eddy",
          contactLastName: "Editsberg",
          contactEmail: "e.editsberg@example.com",
          contactRole: "Editor",
        }
        await test.step("On the Application Detail page, ", async () => {
          await deleteApplicationFixture(page, expectedApplication)
          await createApplicationFixture(page, initialApplication)

          await expect(
            page.getByRole(...selectors.applicationRowToEdit),
          ).toBeVisible()
          await page
            .getByRole(...selectors.buttonViewDetailsForEditApplication)
            .click()
        })

        await test.step("click the Edit link to navigate to the edit application page.", async () => {
          const editButton = page.getByRole(...selectors.buttonDetailsEdit)
          await screenshot(testInfo, editButton, {
            annotation: { text: "Edit Application Button" },
          })

          await editButton.click()

          await expect(
            page.getByRole(...selectors.headingEditApplication),
          ).toBeVisible()
        })

        await test.step("\n\nOn the top of the Edit Application page, is a breadcrumb navigation to navigate back to previous pages.", async () => {
          const breadcrumb = page.getByRole(...selectors.navBreadcrumb)
          await expect(
            breadcrumb.getByRole(...selectors.linkDashboard),
          ).toHaveAttribute("href", "/applications")
          await expect(
            breadcrumb.getByRole(...selectors.linkEditApplicationDetails),
          ).toHaveAttribute("href", /^\/applications\/([^/]{36})$/)
          await expect(breadcrumb).toContainText("Edit Application")
        })

        await test.step(`### Fields you can edit on the application

          You can modify the following fields:
          - Company Name
          `, async () => {
          const companyNameInput = page.getByRole(...selectors.inputCompanyName)

          await expect(companyNameInput).toHaveValue(
            initialApplication.companyName,
          )

          await companyNameInput.clear()
          await companyNameInput.fill(expectedApplication.companyName)
        })

        await test.step(`- Job Title
          `, async () => {
          const jobTitleInput = page.getByRole(...selectors.inputJobTitle)

          await expect(jobTitleInput).toHaveValue(initialApplication.jobTitle)

          await jobTitleInput.clear()
          await jobTitleInput.fill(expectedApplication.jobTitle)
        })

        await test.step(`- Job Description / Requirements
          `, async () => {
          const jobDescriptionInput = page.getByRole(
            ...selectors.inputJobDescription,
          )

          await expect(jobDescriptionInput).toHaveValue(
            initialApplication.jobDescription,
          )

          await jobDescriptionInput.clear()
          await jobDescriptionInput.fill(expectedApplication.jobDescription)
        })

        await test.step(`- Salary Range
          `, async () => {
          const salaryMinInput = page.getByRole(...selectors.inputSalaryMin)
          const salaryMaxInput = page.getByRole(...selectors.inputSalaryMax)

          await expect(salaryMinInput).toHaveValue(initialApplication.salaryMin)
          await expect(salaryMaxInput).toHaveValue(initialApplication.salaryMax)

          await salaryMinInput.fill(expectedApplication.salaryMin)
          await salaryMaxInput.fill(expectedApplication.salaryMax)
        })

        await test.step(`- Application URL
          `, async () => {
          const applicationUrlInput = page.getByRole(
            ...selectors.inputApplicationUrl,
          )

          await expect(applicationUrlInput).toHaveValue(
            initialApplication.applicationUrl,
          )

          await applicationUrlInput.fill(expectedApplication.applicationUrl)
        })

        await test.step(`- Application submission date
          `, async () => {
          const datePickerButton = page.getByRole(...selectors.buttonDatePicker)
          await expect(datePickerButton).toHaveText("December 15th, 2025")

          await datePickerButton.click()
          const datePickerDialog = page.getByRole(...selectors.dialog)
          await expect(datePickerDialog).toBeVisible()
          await page.getByRole(...selectors.buttonDate).click()
          await page.keyboard.press("Escape")
          await expect(datePickerDialog).toBeHidden()
        })

        await test.step(`- Application Status
          `, async () => {
          const statusCombobox = page.getByRole(...selectors.comboboxStatus)
          await expect(statusCombobox).toHaveText("Applied")

          await statusCombobox.click()
          await page
            .getByRole(...selectors.options)
            .nth(StatusOption.Interview)
            .click()
        })

        await test.step(`- Contacts
          `, async () => {
          const initialContact = page.getByRole("heading", {
            name:
              initialApplication.contactFirstName
              + " "
              + initialApplication.contactLastName,
          })
          await expect(initialContact).toBeVisible()

          // Add contact
          await page.getByRole(...selectors.buttonAddContact).click()
          await page
            .getByRole(...selectors.inputFirstName)
            .fill(expectedApplication.contactFirstName)
          await page
            .getByRole(...selectors.inputLastName)
            .fill(expectedApplication.contactLastName)
          await page
            .getByRole(...selectors.inputRole)
            .fill(expectedApplication.contactRole)
          await page
            .getByRole(...selectors.inputEmail)
            .fill(expectedApplication.contactEmail)
          await page.getByRole(...selectors.buttonCreateContact).click()

          await expect(
            page.getByRole("heading", {
              name:
                expectedApplication.contactFirstName
                + " "
                + expectedApplication.contactLastName,
            }),
          ).toBeVisible()

          // Remove initial contact
          await page.getByRole(...selectors.buttonRemoveEditContact).click()
          await expect(initialContact).toBeHidden()
        })

        await test.step(`### Edit Application page actions

          In the footer of the Edit Application form, there are two main actions you can take:
          - **Cancel**: Clicking this will discard any changes you've made and return you to the Application Detail page.
          `, async () => {
          await expect(
            page.getByRole(...selectors.buttonCancelEdit),
          ).toHaveAttribute("href", /^\/applications\/([^/]{36})$/)
        })

        await test.step(`- **Update**: Clicking this will save all the modifications you've made to the application and redirect you back to the Application Detail page, where you can see the updated information.
          `, async () => {
          const saveChangesButton = page.getByRole(
            ...selectors.buttonUpdateEdit,
          )

          await saveChangesButton.click()

          await expect(
            page.getByRole(...selectors.headingEditedDetails),
          ).toHaveText(
            `${expectedApplication.jobTitle} at ${expectedApplication.companyName} Interview`,
          )
          await expect(
            page.getByRole(...selectors.buttonViewApplication),
          ).toHaveAttribute("href", expectedApplication.applicationUrl)
          await expect(page.getByRole(...selectors.mainDetails)).toContainText(
            expectedApplication.jobDescription,
          )
          await expect(
            page.getByRole(...selectors.regionCompensation),
          ).toContainText(
            `${expectedApplication.salaryMin} - ${expectedApplication.salaryMax}`,
          )
          await expect(
            page.getByRole(...selectors.regionContacts),
          ).toContainText(
            `${expectedApplication.contactFirstName} ${expectedApplication.contactLastName}`,
          )
        })
      })
    })
  },
)

import { expect, Page } from "@playwright/test"
import { selectors } from "./util"

interface ApplicationFixture {
  companyName: string
  jobTitle: string
  jobDescription: string
  salaryMin: string
  salaryMax: string
  applicationUrl: string
  contactFirstName: string
  contactLastName: string
  contactEmail: string
  contactRole: string
}

export const createApplicationFixture = async (
  page: Page,
  application: ApplicationFixture,
) => {
  await page.goto("/applications")
  const testDateRow = page.getByRole("row", {
    name: `Applied December 15, 2025 ${application.jobTitle} ${application.companyName} ${application.contactFirstName.charAt(0)}${application.contactLastName.charAt(0)} ${application.contactFirstName} ${application.contactLastName} ${application.salaryMin}-${application.salaryMax}`,
  })
  if ((await testDateRow.all()).length > 0) {
    return
  }

  await page.clock.setFixedTime(new Date("2025-12-14T10:00:00"))
  await page.goto("/applications/new")

  // Fill out the application form
  await page
    .getByRole(...selectors.inputCompanyName)
    .fill(application.companyName)
  await page.getByRole(...selectors.inputJobTitle).fill(application.jobTitle)
  await page
    .getByRole(...selectors.inputJobDescription)
    .fill(application.jobDescription)
  await page.getByRole(...selectors.inputSalaryMin).fill(application.salaryMin)
  await page.getByRole(...selectors.inputSalaryMax).fill(application.salaryMax)
  await page
    .getByRole(...selectors.inputApplicationUrl)
    .fill(application.applicationUrl)

  // Set the date applied to today
  await page.getByRole(...selectors.buttonDatePicker).click()
  await page.getByRole(...selectors.buttonDate).click()
  await page.keyboard.press("Escape")

  // Set application status to "Applied"
  await page.getByRole(...selectors.comboboxStatus).click()
  await page
    .getByRole(...selectors.options)
    .nth(1)
    .click()

  // Add contact
  await page.getByRole(...selectors.buttonAddContact).click()
  await page
    .getByRole(...selectors.inputFirstName)
    .fill(application.contactFirstName)
  await page
    .getByRole(...selectors.inputLastName)
    .fill(application.contactLastName)
  await page.getByRole(...selectors.inputRole).fill(application.contactRole)
  await page.getByRole(...selectors.inputEmail).fill(application.contactEmail)
  await page.getByRole(...selectors.buttonCreateContact).click()
  await expect(
    page.getByRole("heading", {
      name: application.contactFirstName + " " + application.contactLastName,
    }),
  ).toBeVisible()

  await page.getByRole(...selectors.buttonCreate).click()
  await expect(testDateRow).toBeVisible()
}

export const deleteApplicationFixture = async (
  page: Page,
  application: ApplicationFixture,
) => {
  await page.goto("/applications")
  const testDateRow = page.getByRole("row", {
    name: `${application.jobTitle} ${application.companyName} ${application.contactFirstName.charAt(0)}${application.contactLastName.charAt(0)} ${application.contactFirstName} ${application.contactLastName} ${application.salaryMin}-${application.salaryMax}`,
  })
  if ((await testDateRow.all()).length === 0) {
    return
  }

  await testDateRow
    .getByRole("link", {
      name: `View details for ${application.companyName} ${application.jobTitle}`,
    })
    .click()

  await page.getByRole(...selectors.buttonDetailsDelete).click()
  await page.getByRole(...selectors.buttonDetailsConfirm).click()
  await expect(page.getByRole(...selectors.headingApplications)).toBeVisible()
  await expect(testDateRow).toBeHidden()
}

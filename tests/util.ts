import type { Page } from "@playwright/test"
import path from "path"
import fs from "node:fs"

export function getTestDbPath(): string {
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

export const selectors = {
  headingSignup: ["heading", { name: "Create an Account" }],
  headingLogin: ["heading", { name: "Login" }],
  headingApplications: ["heading", { name: "All Applications" }],
  headingPrivacyPolicy: ["heading", { name: "Privacy Policy" }],
  headingTermsOfService: ["heading", { name: "Terms of Service" }],
  inputUsername: ["textbox", { name: "Username" }],
  buttonRegister: ["button", { name: "Register with passkey" }],
  buttonLogin: ["button", { name: "Login with passkey" }],
  linkRegister: ["link", { name: "Register" }],
  linkLogin: ["link", { name: "Login" }],
  linkPrivacyPolicy: ["link", { name: "Privacy Policy" }],
  linkTermsOfService: ["link", { name: "Terms of Service" }],
  headingHome: ["heading", { name: "Welcome to" }],
  headerApplyWizeLogo: ["link", { name: "ApplyWize Logo" }],
  linkDashboard: ["link", { name: "Dashboard" }],
  headerSettings: ["link", { name: "Settings" }],
  headingSettings: ["heading", { name: "Settings" }],
  headerAccount: ["link", { name: "Account" }],
  headingAccount: ["heading", { name: "Account" }],
  headerLogout: ["link", { name: "Logout" }],
  buttonArchiveApplication: ["link", { name: "Archive" }],
  buttonActiveApplication: ["link", { name: "Active" }],
  applicationRowActive: [
    "row",
    { name: "Software Engineer Tech Corp Inc. JD John Doe 80000-120000" },
  ],
  applicationRowArchived: [
    "row",
    { name: "Frontend Developer Tech Corp Inc. JD John Doe 70000-110000" },
  ],
  buttonNewApplication: ["link", { name: "New Application" }],
  headerNewApplication: ["heading", { name: "Add an Application" }],
  navBreadcrumb: ["navigation", { name: "Breadcrumb" }],
  groupCompanyInfo: ["group", { name: "Company Information" }],
  inputCompanyName: ["textbox", { name: "Company Name" }],
  inputJobTitle: ["textbox", { name: "Job Title" }],
  inputJobDescription: ["textbox", { name: "Job Description / Requirements" }],
  inputSalaryMin: ["textbox", { name: "Min Salary Range" }],
  inputSalaryMax: ["textbox", { name: "Max Salary Range" }],
  inputApplicationUrl: ["textbox", { name: "Application URL" }],
  buttonDatePicker: ["button", { name: "Pick a date" }],
  dialog: ["dialog"],
  buttonDate: ["button", { name: "Monday, December 15th," }],
  comboboxStatus: ["combobox", { name: "Application Status" }],
  listboxStatusOptions: ["listbox", { name: "Application Status" }],
  options: ["option"],
  buttonCreate: ["button", { name: "Create" }],
  buttonAddContact: ["button", { name: "Add a contact" }],
  formContactForm: ["form", { name: "Add a Contact" }],
  inputFirstName: ["textbox", { name: "First Name" }],
  inputLastName: ["textbox", { name: "Last Name" }],
  inputRole: ["textbox", { name: "Role" }],
  inputEmail: ["textbox", { name: "Email" }],
  buttonCreateContact: ["button", { name: "Create a Contact" }],
  listContacts: ["list", { name: "Contacts" }],
  headingTestingContact: ["heading", { name: "John Doe" }],
  headingTestingContact2: ["heading", { name: "Jane Smith" }],
  headingTestingContact3: ["heading", { name: "Joe Public" }],
  buttonContactEmail: ["link", { name: "Email to john.doe@example.com" }],
  buttonRemoveContact: ["button", { name: "Remove Jane Smith" }],
  regionToast: ["region", { name: "Notifications alt+T" }],
} satisfies Record<string, Parameters<Page["getByRole"]>>

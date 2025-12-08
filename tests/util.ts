import type { Page } from "@playwright/test"

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
} satisfies Record<string, Parameters<Page["getByRole"]>>

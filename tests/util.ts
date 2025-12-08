import type { CDPSession, Page } from "@playwright/test"

export async function simulateSuccessfulPasskeyInput(
  client: CDPSession,
  authenticatorId: string,
  operationTrigger: () => Promise<void>,
) {
  // initialize event listeners to wait for a successful passkey input event
  const operationCompleted = new Promise<void>((resolve) => {
    client.on("WebAuthn.credentialAdded", () => resolve())
    client.on("WebAuthn.credentialAsserted", () => resolve())
  })

  // set isUserVerified option to true
  // (so that subsequent passkey operations will be successful)
  await client.send("WebAuthn.setUserVerified", {
    authenticatorId: authenticatorId,
    isUserVerified: true,
  })

  // set automaticPresenceSimulation option to true
  // (so that the virtual authenticator will respond to the next passkey prompt)
  await client.send("WebAuthn.setAutomaticPresenceSimulation", {
    authenticatorId: authenticatorId,
    enabled: true,
  })

  // perform a user action that triggers passkey prompt
  await operationTrigger()

  // wait to receive the event that the passkey was successfully registered or verified
  await operationCompleted

  // set automaticPresenceSimulation option back to false
  await client.send("WebAuthn.setAutomaticPresenceSimulation", {
    authenticatorId,
    enabled: false,
  })
}

export const selectors = {
  headingSignup: ["heading", { name: "Create an Account" }],
  headingLogin: ["heading", { name: "Login" }],
  headingApplications: ["heading", { name: "Applications" }],
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
  headerDashboard: ["link", { name: "Dashboard" }],
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

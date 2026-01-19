import {
  test,
  expect,
  CDPSession,
  Page,
  BrowserContext,
} from "@playwright/test"
import { randomUUID } from "crypto"
import { selectors, simulateSuccessfulPasskeyInput } from "../util"
import { withDocCategory, withDocMeta } from "@test2doc/playwright/DocMeta"
import { screenshot } from "@test2doc/playwright/screenshots"

test.describe.serial(
  withDocMeta("Authentication Flow", { sidebar_position: 1 }),
  () => {
    const username = `testuser-${randomUUID()}`
    let client: CDPSession
    let authenticatorId: string
    let sharedContext: BrowserContext
    let sharedPage: Page

    test.beforeAll(async ({ browser }) => {
      // Create shared context for both tests
      sharedContext = await browser.newContext()
      sharedPage = await sharedContext.newPage()
    })

    test.afterAll(async () => {
      await client?.detach()
      await sharedContext?.close()
    })

    test("Register a new user", async ({}, testInfo) => {
      await test.step("We support [Passkeys](https://docs.github.com/en/authentication/authenticating-with-a-passkey/about-passkeys) by [WebAuthn](https://en.wikipedia.org/wiki/WebAuthn).\n\n", async () => {
        client = await sharedPage.context().newCDPSession(sharedPage)
        await client.send("WebAuthn.enable")

        const result = await client.send("WebAuthn.addVirtualAuthenticator", {
          options: {
            protocol: "ctap2",
            transport: "internal",
            hasResidentKey: true,
            hasUserVerification: true,
            isUserVerified: true,
            automaticPresenceSimulation: true,
          },
        })

        authenticatorId = result.authenticatorId
      })

      await test.step("To get started with registration, goto the sign up page at `/auth/signup`.", async () => {
        await sharedPage.goto("auth/signup")

        await expect(
          sharedPage.getByRole(...selectors.headingSignup),
        ).toBeVisible()

        await screenshot(testInfo, sharedPage)

        const result = await client.send("WebAuthn.getCredentials", {
          authenticatorId,
        })
        expect(result.credentials).toHaveLength(0)
      })

      await test.step("\n\nFilling out the registration form and ", async () => {
        const usernameInput = sharedPage.getByRole(...selectors.inputUsername)
        await usernameInput.fill(username)
      })

      await test.step("submitting the registration form. Then follow the passkey registration prompt by your browser.\n\n", async () => {
        await screenshot(testInfo, [
          {
            target: sharedPage.getByRole(...selectors.inputUsername),
            options: { annotation: { text: "Input username here" } },
          },
          {
            target: sharedPage.getByRole(...selectors.buttonRegister),
            options: { annotation: { text: "Click to register" } },
          },
        ])
        await simulateSuccessfulPasskeyInput(
          client,
          authenticatorId,
          async () =>
            await sharedPage.getByRole(...selectors.buttonRegister).click(),
        )
      })

      await test.step("\n\nOn successful registration you will be redirect to login page.", async () => {
        await expect(
          sharedPage.getByRole(...selectors.headingLogin),
        ).toBeVisible()

        await screenshot(testInfo, sharedPage)

        const result = await client.send("WebAuthn.getCredentials", {
          authenticatorId,
        })
        expect(result.credentials).toHaveLength(1)
      })
    })

    test("Login with existing user", async ({}, testInfo) => {
      await test.step("While on the login page at `/auth/login`.\n\n", async () => {
        await sharedPage.goto("auth/login")

        await expect(
          sharedPage.getByRole(...selectors.headingLogin),
        ).toBeVisible()

        await screenshot(testInfo, sharedPage)
      })

      await test.step("\n\nClicking the login button and following the passkey prompt by your browser.\n\n", async () => {
        await screenshot(
          testInfo,
          sharedPage.getByRole(...selectors.buttonLogin),
          {
            annotation: { text: "Click to login" },
          },
        )
        await simulateSuccessfulPasskeyInput(
          client,
          authenticatorId,
          async () =>
            await sharedPage.getByRole(...selectors.buttonLogin).click(),
        )
      })

      await test.step("\n\nOn successful login you will be taken to the applications page.\n\n", async () => {
        await expect(
          sharedPage.getByRole(...selectors.headingApplications),
        ).toBeVisible()

        await screenshot(testInfo, sharedPage)
      })
    })
  },
)

test.describe(
  withDocMeta("Auth Navigation", {
    sidebar_position: 2,
    description: "Links to and from the sign up and login pages",
  }),
  () => {
    test("Link to the sign up page", async ({ page }, testInfo) => {
      await test.step("On the Login page ", async () => {
        await page.goto("/auth/login")
      })

      await test.step("there is a link.", async () => {
        const signUpLink = page.getByRole(...selectors.linkRegister)

        await expect(signUpLink).toBeVisible()
        await screenshot(testInfo, signUpLink, {
          annotation: { text: "Click to go to the sign up page" },
        })

        await signUpLink.click()
      })

      await test.step("The link will take you to the Sign Up page.", async () => {
        await expect(page.getByRole(...selectors.headingSignup)).toBeVisible()
      })
    })

    test("Link to the login page", async ({ page }, testInfo) => {
      await test.step("On the Signup page ", async () => {
        await page.goto("/auth/signup")
      })

      await test.step("there is a link.", async () => {
        const signUpLink = page.getByRole(...selectors.linkLogin)

        await expect(signUpLink).toBeVisible()
        await screenshot(testInfo, signUpLink, {
          annotation: { text: "Click to go to the login page" },
        })

        await signUpLink.click()
      })

      await test.step("The link will take you to the Login page.", async () => {
        await expect(page.getByRole(...selectors.headingLogin)).toBeVisible()
      })
    })
  },
)

test.describe(
  withDocCategory("Links to legal documentation", {
    label: "Legal Documentation",
    position: 3,
  }),
  () => {
    test.describe(
      withDocMeta("Privacy Policy", {
        description: "Where to find the Privacy Policy",
      }),
      () => {
        test("Login page", async ({ page }, testInfo) => {
          await test.step("Contains a link to the Privacy Policy", async () => {
            await page.goto("/auth/login")
            const link = page.getByRole(...selectors.linkPrivacyPolicy)
            await screenshot(testInfo, link, {
              annotation: { text: "Link to Privacy Policy" },
            })

            await link.click()
            await expect(
              page.getByRole(...selectors.headingPrivacyPolicy),
            ).toBeVisible()
          })
        })

        test("Signup page", async ({ page }, testInfo) => {
          await test.step("Contains a link to the Privacy Policy", async () => {
            await page.goto("/auth/signup")
            const link = page.getByRole(...selectors.linkPrivacyPolicy)
            await screenshot(testInfo, link, {
              annotation: { text: "Link to Privacy Policy" },
            })

            await link.click()
            await expect(
              page.getByRole(...selectors.headingPrivacyPolicy),
            ).toBeVisible()
          })
        })
      },
    )

    test.describe(
      withDocMeta("Terms of Service", {
        description: "Where to find the Terms of Service",
      }),
      () => {
        test("Login page", async ({ page }, testInfo) => {
          await test.step("Contains a link to the Terms of Service", async () => {
            await page.goto("/auth/login")
            const link = page.getByRole(...selectors.linkTermsOfService)
            await screenshot(testInfo, link, {
              annotation: { text: "Link to Terms of Service" },
            })

            await link.click()
            await expect(
              page.getByRole(...selectors.headingTermsOfService),
            ).toBeVisible()
          })
        })

        test("Signup page", async ({ page }, testInfo) => {
          await test.step("Contains a link to the Terms of Service", async () => {
            await page.goto("/auth/signup")
            const link = page.getByRole(...selectors.linkTermsOfService)
            await screenshot(testInfo, link, {
              annotation: { text: "Link to Terms of Service" },
            })

            await link.click()
            await expect(
              page.getByRole(...selectors.headingTermsOfService),
            ).toBeVisible()
          })
        })
      },
    )
  },
)

test.describe(withDocMeta("Protected Routes", {}), () => {
  test("Unauthenticated users are redirected to login page when accessing protected routes", async ({
    page,
  }) => {
    await test.step("- `/applications`", async () => {
      await page.goto("/applications")
      await expect(page).toHaveURL("/auth/login")
    })

    await test.step("- `/applications/new`", async () => {
      await page.goto("/applications/new")
      await expect(page).toHaveURL("/auth/login")
    })

    await test.step("- `/applications/:id`", async () => {
      await page.goto("/applications/test-id")
      await expect(page).toHaveURL("/auth/login")
    })

    await test.step("- `/settings`", async () => {
      await page.goto("/settings")
      await expect(page).toHaveURL("/auth/login")
    })

    await test.step("- `/account`", async () => {
      await page.goto("/account")
      await expect(page).toHaveURL("/auth/login")
    })

    await test.step("- `/`", async () => {
      await page.goto("/")
      await expect(page).toHaveURL("/auth/login")
    })
  })
})

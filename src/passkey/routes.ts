import debug from "rwsdk/debug"
import { route } from "rwsdk/router"
import { Login } from "./components/Login.js"
import { Signup } from "./components/Signup.js"
import { logout } from "./functions.js"

const log = debug("passkey:routes")

export function authRoutes() {
  log("Setting up authentication routes")
  return [
    route("/login", [Login]),
    route("/signup", [Signup]),
    route("/logout", async () => {
      await logout()
      return new Response(null, {
        status: 302,
        headers: { Location: "/auth/login" },
      })
    }),
  ]
}

import debug from "rwsdk/debug"
import { route } from "rwsdk/router"
import { Login } from "./components/Login.js"
import { Signup } from "./components/Signup.js"

const log = debug("passkey:routes")

export function authRoutes() {
  log("Setting up authentication routes")
  return [route("/login", [Login]), route("/signup", [Signup])]
}

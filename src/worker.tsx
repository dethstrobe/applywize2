import { render, index, prefix, route, layout } from "rwsdk/router"
import { defineApp } from "rwsdk/worker"

import { Document } from "@/app/Document"
import { setCommonHeaders } from "@/app/headers"
import { Home } from "@/app/pages/Home"
import { authRoutes } from "@/passkey/routes"
import { setupPasskeyAuth } from "@/passkey/setup"
import { Session } from "@/session/durableObject"
import { AuthLayout } from "@/app/layouts/AuthLayout"
import { List } from "./app/pages/applications/List"
import { InteriorLayout } from "./app/layouts/InteriorLayout"
import { New } from "./app/pages/applications/New"
import { Details } from "./app/pages/applications/Details"
import { Edit } from "./app/pages/applications/Edit"

export { AppDurableObject } from "@/db/durableObject"
export { SessionDurableObject } from "@/session/durableObject"

export type AppContext = {
  session: Session | null
}

const isAuthenticated = ({ ctx }: { ctx: AppContext }) => {
  if (!ctx.session?.userId) {
    return new Response(null, {
      status: 302,
      headers: { Location: "/auth/login" },
    })
  }
}

export default defineApp([
  setCommonHeaders(),
  setupPasskeyAuth(),
  render(Document, [
    index([isAuthenticated, Home]),
    layout(AuthLayout, [prefix("/auth", authRoutes())]),
    layout(InteriorLayout, [
      prefix("/applications", [
        isAuthenticated,
        route("/", List),
        route("/new", New),
        route("/:id", Details),
        route("/:id/edit", Edit),
      ]),
      route("/settings", [isAuthenticated, () => <h1>Settings</h1>]),
      route("/account", [isAuthenticated, () => <h1>Account</h1>]),
    ]),
    prefix("/legal", [
      route("/privacy", () => <h1>Privacy Policy</h1>),
      route("/terms", () => <h1>Terms of Service</h1>),
    ]),
  ]),
])

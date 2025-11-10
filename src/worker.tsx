import { render, index, prefix, route, layout } from "rwsdk/router"
import { defineApp } from "rwsdk/worker"

import { Document } from "@/app/Document"
import { setCommonHeaders } from "@/app/headers"
import { Home } from "@/app/pages/Home"
import { authRoutes } from "@/passkey/routes"
import { setupPasskeyAuth } from "@/passkey/setup"
import { Session } from "@/session/durableObject"
import { AuthLayout } from "@/app/layouts/AuthLayout"

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
    prefix("/applications", [
      route("/", [isAuthenticated, () => <h1>Applications</h1>]),
    ]),
    prefix("/legal", [
      route("/privacy", () => <h1>Privacy Policy</h1>),
      route("/terms", () => <h1>Terms of Service</h1>),
    ]),
  ]),
])

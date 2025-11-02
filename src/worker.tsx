import { render, route, index, prefix } from "rwsdk/router"
import { defineApp } from "rwsdk/worker"

import { Document } from "@/app/Document"
import { setCommonHeaders } from "@/app/headers"
import { Home } from "@/app/pages/Home"
import { authRoutes } from "@/passkey/routes"
import { setupPasskeyAuth } from "@/passkey/setup"
import { Session } from "@/session/durableObject"

export { AppDurableObject } from "@/db/durableObject"
export { SessionDurableObject } from "@/session/durableObject"
export { PasskeyDurableObject } from "@/passkey/durableObject"

export type AppContext = {
  session: Session | null
}

export default defineApp([
  setCommonHeaders(),
  setupPasskeyAuth(),
  render(Document, [
    index([
      ({ ctx }) => {
        if (!ctx.session?.userId) {
          return new Response(null, {
            status: 302,
            headers: { Location: "/auth/login" },
          })
        }
      },
      Home,
    ]),
    prefix("/auth", authRoutes()),
  ]),
])

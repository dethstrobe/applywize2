import { defineLinks } from "rwsdk/router"

export const link = defineLinks([
  "/",
  "/auth/login",
  "/auth/signup",
  "/auth/logout",
  "/applications",
  "/applications/new",
  "/applications/:id",
  "/legal/privacy",
  "/legal/terms",
  "/settings",
  "/account",
])

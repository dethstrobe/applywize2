import { env } from "cloudflare:workers"
import { type Database, createDb } from "rwsdk/db"
import { type migrations } from "@/db/migrations"

export type AppDatabase = Database<typeof migrations>
export type Application = AppDatabase["applications"]
export type ApplicationStatus = AppDatabase["applicationStatuses"]
export type Company = AppDatabase["companies"]
export type Contact = AppDatabase["contacts"]
export type User = AppDatabase["users"]
export type Credential = AppDatabase["credentials"]

export const db = createDb<AppDatabase>(
  env.APP_DURABLE_OBJECT,
  "applywize-database",
)

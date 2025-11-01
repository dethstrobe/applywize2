import { type Migrations } from "rwsdk/db"

export const migrations = {
  // Use a clear name indicating this is the full initial setup
  "001_initial_schema_setup": {
    async up(db) {
      return [
        // 1. ApplicationStatuses
        await db.schema
          .createTable("applicationStatuses")
          .addColumn("id", "integer", (col) => col.primaryKey().autoIncrement())
          .addColumn("status", "text", (col) => col.notNull())
          .execute(),

        // 2. Company
        await db.schema
          .createTable("companies")
          .addColumn("id", "text", (col) => col.primaryKey())
          .addColumn("name", "text", (col) => col.notNull())
          .addColumn("createdAt", "text", (col) =>
            col.notNull().defaultTo("(datetime('now'))"),
          )
          .addColumn("updatedAt", "text")
          .execute(),

        // 3. Contact
        await db.schema
          .createTable("contacts")
          .addColumn("id", "text", (col) => col.primaryKey())
          .addColumn("firstName", "text", (col) => col.notNull())
          .addColumn("lastName", "text", (col) => col.notNull())
          .addColumn("email", "text")
          .addColumn("role", "text")
          .addColumn("companyId", "integer", (col) =>
            col.notNull().references("companies.id"),
          )
          .addColumn("createdAt", "text", (col) =>
            col.notNull().defaultTo("(datetime('now'))"),
          )
          .addColumn("updatedAt", "text")
          .execute(),

        // 4. Users (Credentials depends on this)
        await db.schema
          .createTable("users")
          .addColumn("id", "text", (col) => col.primaryKey())
          .addColumn("username", "text", (col) => col.notNull().unique())
          .addColumn("createdAt", "text", (col) =>
            col.notNull().defaultTo("(datetime('now'))"),
          )
          .addColumn("updatedAt", "text")
          .execute(),

        // 5. Credentials (Depends on Users)
        await db.schema
          .createTable("credentials")
          .addColumn("id", "text", (col) => col.primaryKey())
          .addColumn("userId", "text", (col) =>
            col.notNull().unique().references("users.id"),
          )
          .addColumn("createdAt", "text", (col) =>
            col.notNull().defaultTo("(datetime('now'))"),
          )
          .addColumn("credentialId", "text", (col) => col.notNull().unique())
          .addColumn("publicKey", "blob", (col) => col.notNull())
          .addColumn("counter", "integer", (col) => col.notNull().defaultTo(0))
          .execute(),

        // 6. Applications (Depends on Users, Companies, ApplicationStatuses)
        await db.schema
          .createTable("applications")
          .addColumn("id", "text", (col) => col.primaryKey())
          .addColumn("userId", "text", (col) =>
            col.notNull().references("users.id"),
          )
          .addColumn("statusId", "integer", (col) =>
            col.notNull().defaultTo("1").references("applicationStatuses.id"),
          )
          .addColumn("companyId", "integer", (col) =>
            col.notNull().references("companies.id"),
          )
          .addColumn("salaryMin", "text")
          .addColumn("salaryMax", "text")
          .addColumn("dateApplied", "integer")
          .addColumn("jobTitle", "text")
          .addColumn("jobDescription", "text")
          .addColumn("postingUrl", "text")
          .addColumn("createdAt", "text", (col) =>
            col.notNull().defaultTo("(datetime('now'))"),
          )
          .addColumn("updatedAt", "text")
          .addColumn("archived", "integer", (col) => col.notNull().defaultTo(0))
          .execute(),

        // Ensure indexes are created
        await db.schema
          .createIndex("credentials_credentialId_idx")
          .on("credentials")
          .column("credentialId")
          .execute(),
        await db.schema
          .createIndex("credentials_userId_idx")
          .on("credentials")
          .column("userId")
          .execute(),
      ]
    },

    async down(db) {
      // Drop tables in reverse order to respect foreign key constraints
      await db.schema.dropTable("applications").ifExists().execute()
      await db.schema.dropTable("credentials").ifExists().execute()
      await db.schema.dropTable("users").ifExists().execute()
      await db.schema.dropTable("contacts").ifExists().execute()
      await db.schema.dropTable("companies").ifExists().execute()
      await db.schema.dropTable("applicationStatuses").ifExists().execute()
    },
  },
} satisfies Migrations

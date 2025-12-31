import { sql, type Migrations } from "rwsdk/db"

export const migrations = {
  "001_initial_schema_setup": {
    async up(db) {
      const defaultTime = sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`
      return [
        await db.schema
          .createTable("applicationStatuses")
          .addColumn("id", "integer", (col) => col.primaryKey().autoIncrement())
          .addColumn("status", "text", (col) => col.notNull())
          .execute(),

        await db.schema
          .createTable("companies")
          .addColumn("id", "text", (col) => col.primaryKey())
          .addColumn("name", "text", (col) => col.notNull().unique())
          .addColumn("createdAt", "text", (col) =>
            col.notNull().defaultTo(defaultTime),
          )
          .addColumn("updatedAt", "text")
          .execute(),

        await db.schema
          .createTable("contacts")
          .addColumn("id", "text", (col) => col.primaryKey())
          .addColumn("firstName", "text", (col) => col.notNull())
          .addColumn("lastName", "text", (col) => col.notNull())
          .addColumn("email", "text", (col) => col.notNull().unique())
          .addColumn("role", "text")
          .addColumn("companyId", "text", (col) =>
            col.notNull().references("companies.id"),
          )
          .addColumn("createdAt", "text", (col) =>
            col.notNull().defaultTo(defaultTime),
          )
          .addColumn("updatedAt", "text")
          .execute(),

        // Users (Credentials depends on this)
        await db.schema
          .createTable("users")
          .addColumn("id", "text", (col) => col.primaryKey())
          .addColumn("username", "text", (col) => col.notNull().unique())
          .addColumn("createdAt", "text", (col) =>
            col.notNull().defaultTo(defaultTime),
          )
          .addColumn("updatedAt", "text")
          .execute(),

        // Credentials (Depends on Users)
        await db.schema
          .createTable("credentials")
          .addColumn("id", "text", (col) => col.primaryKey())
          .addColumn("userId", "text", (col) =>
            col.notNull().unique().references("users.id").onDelete("cascade"),
          )
          .addColumn("createdAt", "text", (col) =>
            col.notNull().defaultTo(defaultTime),
          )
          .addColumn("credentialId", "text", (col) => col.notNull().unique())
          .addColumn("publicKey", "blob", (col) => col.notNull())
          .addColumn("counter", "integer", (col) => col.notNull().defaultTo(0))
          .execute(),

        // Applications (Depends on Users, Companies, and ApplicationStatuses)
        await db.schema
          .createTable("applications")
          .addColumn("id", "text", (col) => col.primaryKey())
          .addColumn("userId", "text", (col) =>
            col.notNull().references("users.id"),
          )
          .addColumn("statusId", "integer", (col) =>
            col.notNull().defaultTo("1").references("applicationStatuses.id"),
          )
          .addColumn("companyId", "text", (col) =>
            col.notNull().references("companies.id"),
          )
          .addColumn("salaryMin", "text")
          .addColumn("salaryMax", "text")
          .addColumn("dateApplied", "text")
          .addColumn("jobTitle", "text")
          .addColumn("jobDescription", "text")
          .addColumn("postingUrl", "text")
          .addColumn("createdAt", "text", (col) =>
            col.notNull().defaultTo(defaultTime),
          )
          .addColumn("updatedAt", "text")
          .addColumn("archived", "integer", (col) => col.notNull().defaultTo(0))
          .execute(),

        // Create Indexes
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

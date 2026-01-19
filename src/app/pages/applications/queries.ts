import { db } from "@/db/db"
import { sql } from "rwsdk/db"

export const applicationStatusesQuery = db
  .selectFrom("applicationStatuses")
  .selectAll()

export const detailsQuery = db
  .selectFrom("applications")
  .innerJoin("companies", "applications.companyId", "companies.id")
  .innerJoin(
    "applicationStatuses",
    "applications.statusId",
    "applicationStatuses.id",
  )
  .leftJoin("contacts", "companies.id", "contacts.companyId")
  .select([
    "applications.id",
    "applications.dateApplied",
    "applications.jobTitle",
    "applications.salaryMin",
    "applications.salaryMax",
    "applications.postingUrl",
    "applications.jobDescription",
    "applications.statusId",
    "applications.companyId",
    "companies.name as companyName",
    "applicationStatuses.status as status",
    sql<
      {
        firstName: string
        lastName: string
        id: string
        role: string
        email: string
      }[]
    >`
          COALESCE(
            json_group_array(
              CASE
                WHEN ${sql.ref("contacts.id")} IS NOT NULL
                THEN json_object(
                  'firstName', ${sql.ref("contacts.firstName")},
                  'lastName', ${sql.ref("contacts.lastName")},
                  'id', ${sql.ref("contacts.id")},
                  'role', ${sql.ref("contacts.role")},
                  'email', ${sql.ref("contacts.email")}
                )
              END
            ) FILTER (WHERE ${sql.ref("contacts.id")} IS NOT NULL),
            '[]'
          )
        `.as("contacts"),
  ])
  .groupBy([
    "applications.id",
    "applications.dateApplied",
    "applications.jobTitle",
    "applications.salaryMin",
    "applications.salaryMax",
    "companies.name",
    "applicationStatuses.status",
  ])

import { ApplicationsTable } from "@/app/components/ApplicationsTable"
import { Icon } from "@/app/components/Icon"
import { Button } from "@/app/components/ui/button"
import { link } from "@/app/shared/links"
import { db } from "@/db/db"
import { sql } from "rwsdk/db"

const applicationsQuery = db
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
    "companies.name as companyName",
    "applicationStatuses.status as status",
    db.fn
      .agg<
        { firstName: string; lastName: string; id: string }[]
      >("json_group_array", [sql`json_object('firstName', ${sql.ref("contacts.firstName")},'lastName', ${sql.ref("contacts.lastName")}, 'id', ${sql.ref("contacts.id")})`])
      .as("contacts"),
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

export type ApplicationsWithRelations = Awaited<
  ReturnType<typeof applicationsQuery.execute>
>

interface ListProps {
  request: Request
}

export const List = async ({ request }: ListProps) => {
  const url = new URL(request.url)
  const status = url.searchParams.get("status")

  const applications = await applicationsQuery
    .where("applications.archived", "=", status === "archived" ? 1 : 0)
    .execute()

  return (
    <div className="px-page-side">
      <div className="flex justify-between items-center mb-5">
        <h1 className="page-title" id="all-applications">
          All Applications
        </h1>
        <div>
          <Button asChild>
            <a href="#">
              <Icon id="plus" />
              New Application
            </a>
          </Button>
        </div>
      </div>
      <div className="mb-8">
        <ApplicationsTable applications={applications} />
      </div>
      <div className="flex justify-between items-center mb-10">
        <Button asChild variant="secondary">
          {status === "archived" ?
            <a href={link("/applications")}>
              <Icon id="archive" />
              Active
            </a>
          : <a href={`${link("/applications")}?status=archived`}>
              <Icon id="archive" />
              Archive
            </a>
          }
        </Button>
        <Button asChild>
          <a href="#">
            <Icon id="plus" />
            New Application
          </a>
        </Button>
      </div>
    </div>
  )
}

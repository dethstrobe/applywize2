import { ApplicationForm } from "@/app/components/ApplicationForm"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/app/components/ui/breadcrumb"
import { link } from "@/app/shared/links"
import { RequestInfo } from "rwsdk/worker"
import { applicationStatusesQuery, detailsQuery } from "./queries"
import { Button } from "@/app/components/ui/button"
import { updateApplication } from "./functions"

export const Edit = async ({ params }: RequestInfo<{ id: string }>) => {
  const details = await detailsQuery
    .where("applications.id", "=", params.id)
    .executeTakeFirst()

  if (!details) {
    return <div>Application not found</div>
  }

  const applicationStatuses = await applicationStatusesQuery.execute()

  return (
    <>
      <div className="mb-12 -mt-7 pl-20">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={link("/applications")}>
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                href={link("/applications/:id", { id: params.id })}
              >
                {details.jobTitle} at {details.companyName}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Edit Application</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="pb-6 mb-8 border-b-1 border-border">
        <h1 className="page-title">Edit {details.jobTitle}</h1>
        <p className="page-description">
          Edit the details of this job application.
        </p>
      </div>
      <ApplicationForm
        applicationStatusesQuery={applicationStatuses}
        defaultValues={details}
        footerActions={
          <>
            <input type="hidden" name="applicationId" value={params.id} />
            <input type="hidden" name="companyId" value={details.companyId} />
            <Button role="submit">Update</Button>
            <Button asChild>
              <a href={link("/applications/:id", { id: params.id })}>Cancel</a>
            </Button>
          </>
        }
        formAction={updateApplication}
      />
    </>
  )
}

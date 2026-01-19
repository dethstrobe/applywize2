import { ApplicationForm } from "@/app/components/ApplicationForm"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/app/components/ui/breadcrumb"
import { link } from "@/app/shared/links"
import { applicationStatusesQuery } from "./queries"
import { Button } from "@/app/components/ui/button"
import { createApplication } from "./functions"

export const New = async () => {
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
              <BreadcrumbPage>Add an Application</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="pb-6 mb-8 border-b-1 border-border">
        <h1 className="page-title">Add an Application</h1>
        <p className="page-description">
          Manage your account settings and set e-mail preferences.
        </p>
      </div>
      <ApplicationForm
        applicationStatusesQuery={applicationStatuses}
        footerActions={<Button type="submit">Create</Button>}
        formAction={createApplication}
      />
    </>
  )
}

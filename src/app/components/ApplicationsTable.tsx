import { ApplicationsWithRelations } from "@/app/pages/applications/List"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table"
import { Badge, badgeVariants } from "./ui/badge"
import { VariantProps } from "class-variance-authority"
import { Avatar, AvatarFallback } from "./ui/avatar"
import { Fragment } from "react/jsx-runtime"
import { link } from "../shared/links"
import { Icon } from "./Icon"

interface Props {
  applications: ApplicationsWithRelations
}

export const ApplicationsTable = ({ applications }: Props) => {
  return (
    <Table aria-labelledby="all-applications">
      <TableHeader>
        <TableRow>
          <TableHead scope="col" className="w-[100px]">
            Status
          </TableHead>
          <TableHead scope="col">Date Applied</TableHead>
          <TableHead scope="col">Job Title</TableHead>
          <TableHead scope="col">Company</TableHead>
          <TableHead scope="col">Contact</TableHead>
          <TableHead scope="col">Salary</TableHead>
          <TableHead scope="col"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {applications.map((application) => (
          <TableRow key={application.id}>
            <TableCell>
              <Badge
                variant={
                  application.status.toLowerCase() as VariantProps<
                    typeof badgeVariants
                  >["variant"]
                }
              >
                {application.status}
              </Badge>
            </TableCell>
            <TableCell>
              {new Date(application.dateApplied ?? 0).toLocaleDateString(
                "en-US",
                {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                },
              )}
            </TableCell>
            <TableCell>{application.jobTitle}</TableCell>
            <TableCell>{application.companyName}</TableCell>
            <TableCell className="flex items-center gap-2">
              {application.contacts.map((contact) => (
                <Fragment key={contact.id}>
                  <Avatar>
                    <AvatarFallback>
                      {contact.firstName.charAt(0)}
                      {contact.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {contact.firstName} {contact.lastName}
                </Fragment>
              ))}
            </TableCell>
            <TableCell>
              {application.salaryMin}-{application.salaryMax}
            </TableCell>
            <TableCell>
              <a
                href={link("/applications/:id", { id: application.id })}
                aria-label={`View details for ${application.companyName} ${application.jobTitle}`}
              >
                <Icon id="view" />
              </a>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

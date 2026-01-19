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
import { Badge, badgeVariants } from "@/app/components/ui/badge"
import { VariantProps } from "class-variance-authority"
import { Button } from "@/app/components/ui/button"
import { Icon } from "@/app/components/Icon"
import { Avatar, AvatarFallback } from "@/app/components/ui/avatar"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog"
import { DeleteApplicationButton } from "@/app/components/DeleteApplicationButton"
import { detailsQuery } from "./queries"

export const Details = async ({ params }: RequestInfo<{ id: string }>) => {
  const details = await detailsQuery
    .where("applications.id", "=", params.id)
    .executeTakeFirst()

  if (!details) {
    return <div>Application not found</div>
  }

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
              <BreadcrumbPage>
                {details.jobTitle} at {details.companyName}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <header className="flex justify-between border-b-1 border-border pb-6 mb-12">
        <h1 className="grid grid-cols-[auto_1fr] grid-rows-2 gap-x-3 gap-y-1">
          <span className="page-title">{details.jobTitle}</span>{" "}
          <span className="row-start-2 col-start-1">
            <span className="text-zinc-500">at</span>{" "}
            <span className="underline underline-offset-2 decoration-1">
              {details.companyName}
            </span>
          </span>{" "}
          <Badge
            className="col-start-2 row-start-1 self-center"
            variant={
              details.status.toLowerCase() as VariantProps<
                typeof badgeVariants
              >["variant"]
            }
          >
            {details.status}
          </Badge>
        </h1>
        <Button asChild>
          <a href={details.postingUrl ?? "#"} target="_blank" rel="noreferrer">
            View Application
          </a>
        </Button>
      </header>
      <div className="two-column-grid">
        <main aria-labelledby="about-this-role">
          <h2 id="about-this-role" className="text-2xl mb-4">
            About this Role
          </h2>
          <p className="whitespace-pre-wrap">{details.jobDescription}</p>
        </main>
        <aside>
          <section aria-labelledby="compensation-label" className="box">
            <h3 id="compensation-label" className="mb-4">
              Compensation
            </h3>
            <div className="flex items-center gap-6">
              <Icon id="salary" size={32} />
              <div className="text-sm">
                <h4 className="text-zinc-500">Salary</h4>
                <p className="font-bold">
                  {details.salaryMin} - {details.salaryMax}
                </p>
              </div>
            </div>
          </section>

          <section className="box" aria-labelledby="contact-label">
            <h3 id="contact-label">Contacts</h3>
            <p className="input-description">Who do you know there.</p>
            <ul aria-labelledby="contact-label">
              {details.contacts.map((contact) => (
                <li
                  key={contact.id}
                  className="relative group/card flex items-center gap-4 mb-6"
                >
                  <Avatar className="size-10">
                    <AvatarFallback>
                      {contact.firstName.charAt(0)}
                      {contact.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4>
                      {contact.firstName} {contact.lastName}
                    </h4>
                    <p className="text-sm text-zinc-500">{contact.role}</p>
                  </div>
                  <a
                    aria-label={`Email to ${contact.email}`}
                    href={`mailto:${contact.email}`}
                  >
                    <Icon id="mail" size={24} />
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </aside>
        <footer className="flex items-center gap-5 col-span-full">
          <Button asChild variant="secondary">
            <a href={link("/applications/:id/edit", { id: details.id })}>
              <Icon id="edit" size={16} /> Edit
            </a>
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="link" className="text-destructive">
                <Icon id="trash" size={16} /> Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you absolutely sure?</DialogTitle>
                <DialogDescription>
                  This will permanently delete the application and any related
                  companies and contacts. This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="secondary">Nevermind</Button>
                </DialogClose>
                <DeleteApplicationButton applicationId={details.id} />
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </footer>
      </div>
    </>
  )
}

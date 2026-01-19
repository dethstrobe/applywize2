"use client"

import { ContactFormData } from "../pages/applications/functions"
import { DatePicker } from "./ui/datepicker"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet"
import { Icon } from "./Icon"
import { ContactForm } from "./ContactForm"
import { useState } from "react"
import { Avatar, AvatarFallback } from "./ui/avatar"
import { toast } from "sonner"
import { detailsQuery } from "@/app/pages/applications/queries"

interface ApplicationFormProps {
  applicationStatusesQuery: {
    id: number
    status: string
  }[]
  defaultValues?: Awaited<ReturnType<typeof detailsQuery.execute>>[number]
  footerActions: React.ReactNode
  formAction: (
    formData: FormData,
    contacts: ContactFormData[],
  ) => Promise<Response | { error: { message: string }[] }>
}

export const ApplicationForm = ({
  applicationStatusesQuery,
  defaultValues,
  footerActions,
  formAction,
}: ApplicationFormProps) => {
  const [contacts, setContacts] = useState<ContactFormData[]>(
    defaultValues?.contacts ?? [],
  )

  const [isContactSheetOpen, setIsContactSheetOpen] = useState(false)

  const submitContactForm = (formData: FormData) => {
    setContacts((prevContacts) => [
      ...prevContacts,
      {
        id: crypto.randomUUID(),
        firstName: formData.get("firstName") as string,
        lastName: formData.get("lastName") as string,
        role: formData.get("role") as string,
        email: formData.get("email") as string,
      },
    ])
    setIsContactSheetOpen(false)
  }

  const submitApplicationForm = async (formData: FormData) => {
    const res = await formAction(formData, contacts)

    if ("error" in res) {
      res.error.forEach(({ message }) => toast.error(message))
    }
  }

  return (
    <form action={submitApplicationForm} className="two-column-grid">
      {/* left side */}
      <fieldset>
        <legend className="text-2xl font-bold" id="company-info-heading">
          Company Information
        </legend>
        <div className="field">
          <label htmlFor="company">Company Name</label>
          <input
            type="text"
            id="company"
            name="company"
            aria-describedby="company-hint"
            defaultValue={defaultValues?.companyName}
          />
          <p className="input-description" id="company-hint">
            What company caught your eye?
          </p>
        </div>

        <div className="field">
          <label htmlFor="jobTitle">Job Title</label>
          <input
            type="text"
            id="jobTitle"
            name="jobTitle"
            aria-describedby="jobTitle-hint"
            defaultValue={defaultValues?.jobTitle ?? ""}
          />
          <p className="input-description" id="jobTitle-hint">
            What&apos;s the job you&apos;re after?
          </p>
        </div>

        <div className="field">
          <label htmlFor="jobDescription">Job Description / Requirements</label>
          <textarea
            id="jobDescription"
            name="jobDescription"
            aria-describedby="jobDescription-hint"
            defaultValue={defaultValues?.jobDescription ?? ""}
          />
          <p className="input-description" id="jobDescription-hint">
            What are they looking for?
          </p>
        </div>

        <div className="field">
          <div id="salary-range" className="label">
            Salary Range
          </div>
          <div className="flex gap-4">
            <div className="flex-1 label-inside">
              <label id="salary-min" htmlFor="salaryMin">
                Min
              </label>
              <input
                type="text"
                id="salaryMin"
                name="salaryMin"
                aria-labelledby="salary-min salary-range"
                aria-describedby="salary-hint"
                defaultValue={defaultValues?.salaryMin ?? ""}
              />
            </div>
            <div className="flex-1 label-inside">
              <label id="salary-max" htmlFor="salaryMax">
                Max
              </label>
              <input
                type="text"
                id="salaryMax"
                name="salaryMax"
                aria-labelledby="salary-max salary-range"
                aria-describedby="salary-hint"
                defaultValue={defaultValues?.salaryMax ?? ""}
              />
            </div>
          </div>
          <p className="input-description" id="salary-hint">
            What does the pay look like?
          </p>
        </div>

        <div className="field">
          <label htmlFor="url">Application URL</label>
          <input
            type="url"
            id="url"
            name="url"
            aria-describedby="url-hint"
            defaultValue={defaultValues?.postingUrl ?? ""}
          />
          <p className="input-description" id="url-hint">
            Where can we apply?
          </p>
        </div>
      </fieldset>

      {/* right side */}
      <div>
        <div className="box">
          <DatePicker
            label="Application submission date"
            defaultValue={defaultValues?.dateApplied ?? undefined}
          />
        </div>

        <div className="box">
          <label id="application-status-label" htmlFor="application-status">
            Application Status
          </label>
          <Select
            name="status"
            defaultValue={defaultValues?.statusId.toString()}
          >
            <SelectTrigger id="application-status">
              <SelectValue placeholder="Select a Status" />
            </SelectTrigger>
            <SelectContent aria-labelledby="application-status-label">
              {applicationStatusesQuery.map((status) => (
                <SelectItem key={status.id} value={status.id.toString()}>
                  {status.status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="box">
          <h3 id="contact-label">Contacts</h3>
          <p className="input-description">
            Invite your team members to collaborate.
          </p>
          <ul aria-labelledby="contact-label">
            {contacts.map((contact) => (
              <li
                key={contact.id}
                className="relative group/card flex items-center gap-4 mb-6"
              >
                <div className="pr-5 absolute top-2 -left-[37px]">
                  <button
                    role="button"
                    className="opacity-0 group-hover/card:opacity-100 focus:opacity-100 rounded-full bg-destructive p-1"
                    aria-label={`Remove ${contact.firstName} ${contact.lastName}`}
                    onClick={() =>
                      setContacts((contacts) =>
                        contacts.filter(({ id }) => id !== contact.id),
                      )
                    }
                  >
                    <Icon id="close" size={16} />
                  </button>
                </div>
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
          <Sheet open={isContactSheetOpen} onOpenChange={setIsContactSheetOpen}>
            <SheetTrigger className="flex items-center gap-2 font-poppins text-sm font-bold bg-secondary py-3 px-6 rounded-md cursor-pointer">
              <Icon id="plus" size={16} />
              Add a Contact
            </SheetTrigger>
            <SheetContent className="pt-[100px] px-12">
              <SheetHeader>
                <SheetTitle id="add-contact-title">Add a Contact</SheetTitle>
                <SheetDescription id="add-contact-description">
                  Add a Contact to this application.
                </SheetDescription>
              </SheetHeader>
              <ContactForm submitContactForm={submitContactForm} />
            </SheetContent>
          </Sheet>
        </div>
      </div>
      {/* footer with submission button */}
      <div className="col-span-2 field flex items-center gap-4">
        {footerActions}
      </div>
    </form>
  )
}

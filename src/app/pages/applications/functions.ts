"use server"

import { link } from "@/app/shared/links"
import { requestInfo } from "rwsdk/worker"
import { Contact, db } from "@/db/db"
import { z } from "zod"

export type ContactFormData = Omit<
  Contact,
  "createdAt" | "updatedAt" | "companyId"
> & {
  createdAt?: string
  updatedAt?: string
  companyId?: string
}

const applicationFormSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  jobDescription: z.string().optional().default(""),
  applicationStatusId: z.coerce
    .number()
    .min(1, "No Application Status selected")
    .max(5, "Invalid Application Status selected"),
  applicationDate: z.iso.datetime("Invalid date selected"),
  minSalary: z.string().optional().default(""),
  maxSalary: z.string().optional().default(""),
  applicationUrl: z.string().optional().default(""),
})

const contactSchema = z.object({
  id: z.uuid(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.email({ message: "Invalid email address" }),
  role: z.string().min(1, "Role is required"),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  companyId: z.string().optional(),
})

export const createApplication = async (
  formData: FormData,
  contactsData: ContactFormData[],
) => {
  const { request, ctx } = requestInfo

  try {
    const data = applicationFormSchema.parse({
      companyName: formData.get("company"),
      jobTitle: formData.get("jobTitle"),
      jobDescription: formData.get("jobDescription"),
      applicationStatusId: formData.get("status"),
      applicationDate: formData.get("applicationDate"),
      minSalary: formData.get("salaryMin"),
      maxSalary: formData.get("salaryMax"),
      applicationUrl: formData.get("url"),
    })

    const validatedContacts = z.array(contactSchema).parse(contactsData)

    const now = new Date().toISOString()

    if (!ctx.session?.userId) {
      throw new Error("User not found")
    }

    await db
      .insertInto("companies")
      .values({
        id: crypto.randomUUID(),
        name: data.companyName,
        createdAt: now,
        updatedAt: now,
      })
      .onConflict((oc) => oc.column("name").doNothing())
      .execute()

    const { id: companyId } = await db
      .selectFrom("companies")
      .select("id")
      .where("name", "=", data.companyName)
      .executeTakeFirstOrThrow()

    await db
      .insertInto("applications")
      .values({
        id: crypto.randomUUID(),
        companyId,
        jobTitle: data.jobTitle,
        jobDescription: data.jobDescription,
        statusId: data.applicationStatusId,
        dateApplied: data.applicationDate,
        salaryMin: data.minSalary,
        salaryMax: data.maxSalary,
        postingUrl: data.applicationUrl,
        userId: ctx.session.userId,
        createdAt: now,
        updatedAt: now,
        archived: 0,
      })
      .execute()

    if (validatedContacts.length > 0) {
      await db
        .insertInto("contacts")
        .values(
          validatedContacts.map((contact) => ({
            ...contact,
            companyId,
            createdAt: contact.createdAt ?? now,
            updatedAt: now,
          })),
        )
        .onConflict((oc) => oc.column("email").doNothing())
        .execute()
    }

    const url = new URL(link("/applications"), request.url)
    return Response.redirect(url.href, 302)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues }
    }
    return { error: [{ message: String(error) }] }
  }
}

export const deleteApplication = async (applicationId: string) => {
  const { request } = requestInfo

  await db.deleteFrom("applications").where("id", "=", applicationId).execute()

  const url = new URL(link("/applications"), request.url)
  return Response.redirect(url.href, 302)
}

export const updateApplication = async (
  formData: FormData,
  contactsData: ContactFormData[],
) => {
  const { request, ctx } = requestInfo

  try {
    const data = applicationFormSchema.parse({
      companyName: formData.get("company"),
      jobTitle: formData.get("jobTitle"),
      jobDescription: formData.get("jobDescription"),
      applicationStatusId: formData.get("status"),
      applicationDate: formData.get("applicationDate"),
      minSalary: formData.get("salaryMin"),
      maxSalary: formData.get("salaryMax"),
      applicationUrl: formData.get("url"),
    })

    const validatedContacts = z.array(contactSchema).parse(contactsData)

    if (!ctx.session?.userId) {
      throw new Error("User not found")
    }

    const { applicationId, companyId } = z
      .object({
        applicationId: z.uuid(),
        companyId: z.uuid(),
      })
      .parse({
        applicationId: formData.get("applicationId"),
        companyId: formData.get("companyId"),
      })

    const now = new Date().toISOString()

    // Find or use existing company by name
    const targetCompany = await db
      .selectFrom("companies")
      .select("id")
      .where("name", "=", data.companyName)
      .executeTakeFirst()

    const finalCompanyId =
      targetCompany ?
        targetCompany.id
      : (
          await db
            .updateTable("companies")
            .set({ name: data.companyName, updatedAt: now })
            .where("id", "=", companyId)
            .returning("id")
            .executeTakeFirstOrThrow()
        ).id

    // Update application
    await db
      .updateTable("applications")
      .set({
        companyId: finalCompanyId,
        jobTitle: data.jobTitle,
        jobDescription: data.jobDescription,
        statusId: data.applicationStatusId,
        dateApplied: data.applicationDate,
        salaryMin: data.minSalary,
        salaryMax: data.maxSalary,
        postingUrl: data.applicationUrl,
        updatedAt: now,
      })
      .where("id", "=", applicationId)
      .execute()

    // Update contacts, to preserve createdAt timestamps
    const existingContacts = await db
      .selectFrom("contacts")
      .select(["id", "createdAt"])
      .where("companyId", "=", companyId)
      .execute()
    const contactTimestamps = new Map(
      existingContacts.map((c) => [c.id, c.createdAt]),
    )
    // remove all existing contacts for the company
    await db.deleteFrom("contacts").where("companyId", "=", companyId).execute()

    // add or re-add contacts
    if (validatedContacts.length > 0) {
      await db
        .insertInto("contacts")
        .values(
          validatedContacts.map((contact) => ({
            ...contact,
            companyId: finalCompanyId,
            createdAt: contactTimestamps.get(contact.id) ?? now,
            updatedAt: now,
          })),
        )
        .onConflict((oc) => oc.column("email").doNothing())
        .execute()
    }

    const url = new URL(
      link("/applications/:id", { id: applicationId }),
      request.url,
    )
    return Response.redirect(url.href, 302)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues }
    }
    return { error: [{ message: String(error) }] }
  }
}

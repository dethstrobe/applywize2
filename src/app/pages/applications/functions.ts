"use server"

import { link } from "@/app/shared/links"
import { requestInfo } from "rwsdk/worker"
import { db } from "@/db/db"
import { z } from "zod"

const applicationFormSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  jobDescription: z.string().optional().default(""),
  applicationStatusId: z.string().transform((val) => {
    const num = parseInt(val)
    if (isNaN(num)) throw new Error("Invalid status ID")
    return num
  }),
  applicationDate: z.string().min(1, "Application date is required"),
  minSalary: z.string().optional().default(""),
  maxSalary: z.string().optional().default(""),
  applicationUrl: z.string().optional().default(""),
})

export const createApplication = async (formData: FormData) => {
  const { request, ctx } = requestInfo

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
      companyId: companyId,
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

  const url = new URL(link("/applications"), request.url)
  return Response.redirect(url.href, 302)
}

import { db } from "@/db/db"
import { TESTPASSKEY } from "./test-passkey"

export default async () => {
  console.log("… Seeding Applywize DB")
  await db.deleteFrom("applications").execute()
  await db.deleteFrom("contacts").execute()
  await db.deleteFrom("companies").execute()
  await db.deleteFrom("credentials").execute()
  await db.deleteFrom("users").execute()
  await db.deleteFrom("applicationStatuses").execute()

  await db
    .insertInto("applicationStatuses")
    .values([
      { id: 1, status: "New" },
      { id: 2, status: "Applied" },
      { id: 3, status: "Interview" },
      { id: 4, status: "Rejected" },
      { id: 5, status: "Offer" },
    ])
    .execute()

  const timeAdded = "2025-11-29T18:47:11.742Z"
  const companyId = crypto.randomUUID()

  await db
    .insertInto("users")
    .values({
      id: TESTPASSKEY.userId,
      username: TESTPASSKEY.username,
      createdAt: timeAdded,
      updatedAt: timeAdded,
    })
    .execute()

  await db
    .insertInto("credentials")
    .values({
      id: crypto.randomUUID(),
      userId: TESTPASSKEY.userId,
      credentialId: TESTPASSKEY.credentialDbId,
      publicKey: Uint8Array.from(TESTPASSKEY.publicKey),
      counter: 0,
      createdAt: timeAdded,
    })
    .execute()

  await db
    .insertInto("companies")
    .values([
      {
        id: companyId,
        name: "Tech Corp Inc.",
        createdAt: timeAdded,
        updatedAt: timeAdded,
      },
    ])
    .execute()

  await db
    .insertInto("contacts")
    .values({
      id: crypto.randomUUID(),
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      role: "Hiring Manager",
      companyId: companyId,
      createdAt: timeAdded,
      updatedAt: timeAdded,
    })
    .execute()

  await db
    .insertInto("applications")
    .values([
      {
        id: crypto.randomUUID(),
        userId: TESTPASSKEY.userId,
        statusId: 1,
        companyId,
        jobTitle: "Software Engineer",
        salaryMin: "80000",
        salaryMax: "120000",
        jobDescription: "Develop and maintain web applications.",
        postingUrl: "https://example.com/jobs/123",
        dateApplied: timeAdded,
        createdAt: timeAdded,
        updatedAt: timeAdded,
        archived: 0,
      },
      {
        id: crypto.randomUUID(),
        userId: TESTPASSKEY.userId,
        statusId: 3,
        companyId,
        jobTitle: "Frontend Developer",
        salaryMin: "70000",
        salaryMax: "110000",
        jobDescription: "Create stunning user interfaces.",
        postingUrl: "https://example.com/jobs/456",
        dateApplied: timeAdded,
        createdAt: timeAdded,
        updatedAt: timeAdded,
        archived: 1,
      },
    ])
    .execute()

  console.log("✔ Finished seeding applywize DB 🌱")
}

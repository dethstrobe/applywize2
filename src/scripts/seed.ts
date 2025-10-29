import { db } from "@/db/db"

export default async () => {
  console.log("… Seeding Applywize DB")
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

  console.log("✔ Finished seeding applywize DB 🌱")
}

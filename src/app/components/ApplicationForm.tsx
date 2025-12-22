"use server"

import { createApplication } from "../pages/applications/functions"
import { Button } from "./ui/button"
import { DatePicker } from "./ui/datepicker"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import { db } from "@/db/db"

export const ApplicationForm = async () => {
  const applicationStatusesQuery = await db
    .selectFrom("applicationStatuses")
    .selectAll()
    .execute()

  return (
    <form
      action={createApplication}
      className="grid grid-cols-2 gap-x-50 mb-20"
    >
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
              />
            </div>
          </div>
          <p className="input-description" id="salary-hint">
            What does the pay look like?
          </p>
        </div>

        <div className="field">
          <label htmlFor="url">Application URL</label>
          <input type="url" id="url" name="url" aria-describedby="url-hint" />
          <p className="input-description" id="url-hint">
            Where can we apply?
          </p>
        </div>
      </fieldset>

      {/* right side */}
      <div>
        <div className="box">
          <DatePicker label="Application submission date" />
        </div>

        <div className="box">
          <label id="application-status-label" htmlFor="application-status">
            Application Status
          </label>
          <Select name="status">
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
          <h3>Contacts</h3>
          <p className="input-description">
            Invite your team members to collaborate.
          </p>
          <div>Contact Card</div>
        </div>
      </div>
      {/* footer with submission button */}
      <div className="col-span-2">
        <Button type="submit">Create</Button>
      </div>
    </form>
  )
}

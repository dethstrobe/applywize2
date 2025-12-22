"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { Button } from "@/app/components/ui/button"
import { Calendar } from "@/app/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/components/ui/popover"

interface DatePickerProps {
  label: string
}

export function DatePicker({ label }: DatePickerProps) {
  const [date, setDate] = React.useState<Date>()

  return (
    <>
      <label id="date-picker-label" htmlFor="date-picker">
        {label}
      </label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date-picker"
            aria-labelledby="date-picker-label date-picker-value"
            variant="outline"
            data-empty={!date}
            className="data-[empty=true]:text-muted-foreground w-[280px] justify-start text-left font-normal"
          >
            <CalendarIcon />
            <span id="date-picker-value">
              {date ? format(date, "PPP") : "Pick a date"}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar mode="single" selected={date} onSelect={setDate} />
        </PopoverContent>
      </Popover>
      <input type="hidden" name="applicationDate" value={date?.toISOString()} />
    </>
  )
}

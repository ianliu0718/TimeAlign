"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, X } from "lucide-react"
import { format } from "date-fns"
import { useLanguage } from "@/lib/i18n/language-context"

interface DateRange {
  start: Date
  end: Date
}

interface DateRangePickerProps {
  value: DateRange[]
  onChange: (ranges: DateRange[]) => void
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const { t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [currentRange, setCurrentRange] = useState<{ start?: Date; end?: Date }>({})

  const addRange = () => {
    if (currentRange.start && currentRange.end) {
      onChange([...value, { start: currentRange.start, end: currentRange.end }])
      setCurrentRange({})
      setIsOpen(false)
    }
  }

  const removeRange = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {value.map((range, index) => (
          <div
            key={index}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm"
          >
            <span>
              {format(range.start, "MMM d")} - {format(range.end, "MMM d")}
            </span>
            <button
              type="button"
              onClick={() => removeRange(index)}
              className="hover:bg-primary/20 rounded p-0.5 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full sm:w-auto justify-start text-left font-normal bg-transparent">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {t("create.addDateRange")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-4 space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">{t("create.startDate")}</p>
              <Calendar
                mode="single"
                selected={currentRange.start}
                onSelect={(date) => setCurrentRange({ ...currentRange, start: date })}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              />
            </div>
            {currentRange.start && (
              <div>
                <p className="text-sm font-medium mb-2">{t("create.endDate")}</p>
                <Calendar
                  mode="single"
                  selected={currentRange.end}
                  onSelect={(date) => setCurrentRange({ ...currentRange, end: date })}
                  disabled={(date) => !currentRange.start || date < currentRange.start}
                />
              </div>
            )}
            {currentRange.start && currentRange.end && (
              <Button onClick={addRange} className="w-full">
                {t("create.addRange")}
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

"use client"

import { useState, useRef, useEffect } from "react"
import type { TimeSlot } from "@/lib/types"
import { useLanguage } from "@/lib/i18n/language-context"
import { cn } from "@/lib/utils"

interface AvailabilityCalendarProps {
  startDate: Date
  endDate: Date
  startHour: number
  endHour: number
  selectedSlots: TimeSlot[]
  onSlotsChange?: (slots: TimeSlot[]) => void
  heatmapData?: Map<string, number>
  maxParticipants?: number
  readOnly?: boolean
}

export function AvailabilityCalendar({
  startDate,
  endDate,
  startHour,
  endHour,
  selectedSlots,
  onSlotsChange,
  heatmapData,
  maxParticipants = 1,
  readOnly = false,
}: AvailabilityCalendarProps) {
  const { t } = useLanguage()
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<{ date: Date; hour: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const dates: Date[] = []
  const currentDate = new Date(startDate)
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate))
    currentDate.setDate(currentDate.getDate() + 1)
  }

  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i)

  const isSlotSelected = (date: Date, hour: number) => {
    return selectedSlots.some((slot) => slot.date.toDateString() === date.toDateString() && slot.hour === hour)
  }

  const getSlotKey = (date: Date, hour: number) => {
    return `${date.toISOString().split("T")[0]}-${hour}`
  }

  const getHeatmapIntensity = (date: Date, hour: number) => {
    if (!heatmapData) return 0
    const key = getSlotKey(date, hour)
    const count = heatmapData.get(key) || 0
    return count / maxParticipants
  }

  const toggleSlot = (date: Date, hour: number) => {
    if (readOnly || !onSlotsChange) return

    const newSlots = isSlotSelected(date, hour)
      ? selectedSlots.filter((slot) => !(slot.date.toDateString() === date.toDateString() && slot.hour === hour))
      : [...selectedSlots, { date: new Date(date), hour }]

    onSlotsChange(newSlots)
  }

  const handleMouseDown = (date: Date, hour: number) => {
    if (readOnly) return
    setIsDragging(true)
    setDragStart({ date, hour })
    toggleSlot(date, hour)
  }

  const handleMouseEnter = (date: Date, hour: number) => {
    if (!isDragging || !dragStart) return
    toggleSlot(date, hour)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setDragStart(null)
  }

  useEffect(() => {
    const handleGlobalMouseUp = () => handleMouseUp()
    document.addEventListener("mouseup", handleGlobalMouseUp)
    return () => document.removeEventListener("mouseup", handleGlobalMouseUp)
  }, [])

  const dayNames = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"]

  return (
    <div className="w-full max-w-full lg:max-w-5xl mx-auto">
      {heatmapData && (
        <div className="mb-4 flex items-center gap-4 text-sm flex-wrap">
          <span className="font-medium">{t("calendar.availability")}:</span>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500/20 border border-green-500/30 rounded" />
            <span className="text-muted-foreground">{t("calendar.low")}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500/50 border border-green-500/60 rounded" />
            <span className="text-muted-foreground">{t("calendar.medium")}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 border border-green-600 rounded" />
            <span className="text-muted-foreground">{t("calendar.high")}</span>
          </div>
        </div>
      )}

      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <div
          ref={containerRef}
          className="inline-block min-w-full border rounded-lg overflow-hidden [--time-col:56px] md:[--time-col:56px] lg:[--time-col:48px]"
          style={{ minWidth: dates.length > 3 ? "720px" : "auto" }}
        >
          <div className="grid" style={{ gridTemplateColumns: `var(--time-col) repeat(${dates.length}, 1fr)` }}>
            <div className="bg-muted border-b border-r p-2 text-xs font-medium sticky left-0 z-10" />
            {dates.map((date, i) => (
              <div key={i} className="bg-muted border-b p-2 text-center text-xs font-medium">
                <div className="hidden sm:block">{t(`calendar.${dayNames[date.getDay()]}`)}</div>
                <div className="sm:hidden">{t(`calendar.${dayNames[date.getDay()]}`).slice(0, 1)}</div>
                <div className="text-muted-foreground mt-1">
                  {date.getMonth() + 1}/{date.getDate()}
                </div>
              </div>
            ))}

            {hours.map((hour) => (
              <div key={hour} className="contents">
                <div className="bg-muted border-r p-1.5 lg:p-1 text-[10px] sm:text-xs font-medium text-center sticky left-0 z-10">
                  {hour.toString().padStart(2, "0")}:00
                </div>
                {dates.map((date, i) => {
                  const selected = isSlotSelected(date, hour)
                  const intensity = getHeatmapIntensity(date, hour)
                  const showHeatmap = heatmapData && intensity > 0

                  return (
                    <div
                      key={`${i}-${hour}`}
                      className={cn(
                        "border-b border-r p-1 sm:p-1.5 lg:p-1 cursor-pointer transition-colors min-h-[28px] sm:min-h-[34px] lg:min-h-[28px]",
                        readOnly && "cursor-default",
                        !readOnly && "hover:bg-accent",
                        selected && !showHeatmap && "bg-primary/20 hover:bg-primary/30",
                        showHeatmap && "bg-green-500 hover:bg-green-600",
                      )}
                      style={showHeatmap ? { opacity: 0.2 + intensity * 0.8 } : undefined}
                      onMouseDown={() => handleMouseDown(date, hour)}
                      onMouseEnter={() => handleMouseEnter(date, hour)}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

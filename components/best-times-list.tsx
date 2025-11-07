"use client"

import type { TimeSlot, Participant } from "@/lib/types"
import { useLanguage } from "@/lib/i18n/language-context"
import { Card } from "@/components/ui/card"
import { Clock } from "lucide-react"

interface BestTimesListProps {
  participants: Participant[]
  startHour: number
  endHour: number
}

export function BestTimesList({ participants, startHour, endHour }: BestTimesListProps) {
  const { t } = useLanguage()

  const calculateBestTimes = () => {
    if (participants.length === 0) return []

    const slotCounts = new Map<string, { slot: TimeSlot; count: number }>()

    participants.forEach((participant) => {
      participant.availability.forEach((slot) => {
        const key = `${slot.date.toISOString().split("T")[0]}-${slot.hour}`
        const existing = slotCounts.get(key)
        if (existing) {
          existing.count++
        } else {
          slotCounts.set(key, { slot, count: 1 })
        }
      })
    })

    return Array.from(slotCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }

  const bestTimes = calculateBestTimes()

  if (bestTimes.length === 0) {
    return (
      <Card className="p-6 sm:p-8">
        <div className="flex flex-col items-center justify-center text-center py-8">
          <Clock className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">{t("event.noBestTimes")}</p>
        </div>
      </Card>
    )
  }

  const dayNames = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"]

  return (
    <Card className="p-4 sm:p-6">
      <h3 className="font-semibold text-lg mb-4">{t("event.bestTimes")}</h3>
      <div className="space-y-2">
        {bestTimes.map(({ slot, count }, index) => (
          <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex-1">
              <p className="font-medium">
                {t(`calendar.${dayNames[slot.date.getDay()]}`)}
                {", "}
                {slot.date.getMonth() + 1}/{slot.date.getDate()}
                {" - "}
                {slot.hour.toString().padStart(2, "0")}:00
              </p>
            </div>
            <div className="text-sm text-muted-foreground ml-4 flex-shrink-0">
              {count} {t("event.availableOf")} {participants.length} {t("event.available")}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

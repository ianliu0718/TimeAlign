"use client"

import type { Participant } from "@/lib/types"
import { useLanguage } from "@/lib/i18n/language-context"
import { Card } from "@/components/ui/card"
import { Users } from "lucide-react"

interface ParticipantListProps {
  participants: Participant[]
}

export function ParticipantList({ participants }: ParticipantListProps) {
  const { t } = useLanguage()

  if (participants.length === 0) {
    return (
      <Card className="p-6 sm:p-8">
        <div className="flex flex-col items-center justify-center text-center py-8">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">{t("event.noParticipants")}</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-4 sm:p-6">
      <h3 className="font-semibold text-lg mb-4">
        {t("event.participants")} ({participants.length})
      </h3>
      <div className="space-y-2">
        {participants.map((participant) => (
          <div
            key={participant.id}
            className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{participant.name}</p>
              {participant.email && <p className="text-sm text-muted-foreground truncate">{participant.email}</p>}
            </div>
            <div className="text-sm text-muted-foreground ml-4 flex-shrink-0">
              {participant.availability.length} {t("event.slots")}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

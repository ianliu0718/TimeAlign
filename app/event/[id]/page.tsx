"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { useLanguage } from "@/lib/i18n/language-context"
import type { Event, Participant, TimeSlot } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { AvailabilityCalendar } from "@/components/availability-calendar"
import { ParticipantList } from "@/components/participant-list"
import { BestTimesList } from "@/components/best-times-list"
import { Copy, Check } from "lucide-react"

export default function EventPage() {
  const { t } = useLanguage()
  const params = useParams()
  const searchParams = useSearchParams()
  const eventId = params.id as string

  const [event, setEvent] = useState<Event | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // try localStorage first
    let parsed: any | null = null
    const eventData = typeof window !== 'undefined' ? localStorage.getItem(`event_${eventId}`) : null
    if (eventData) {
      parsed = JSON.parse(eventData)
    } else {
      // fallback to decode from URL param `d`
      const d = searchParams.get('d')
      if (d) {
        try {
          const json = decodeURIComponent(atob(d))
          const compact = JSON.parse(json)
          parsed = {
            id: eventId,
            title: compact.t,
            description: compact.d,
            start_date: compact.sd,
            end_date: compact.ed,
            start_hour: compact.sh,
            end_hour: compact.eh,
            timezone: compact.tz,
            created_at: new Date().toISOString(),
          }
          localStorage.setItem(`event_${eventId}`, JSON.stringify(parsed))
        } catch (e) {
          console.warn('[v0] failed to parse shared payload', e)
        }
      }
    }

    if (parsed) {
      // if start/end not present but selected_dates present, derive
      const startISO = parsed.start_date || (parsed.selected_dates?.length ? parsed.selected_dates[0] : undefined)
      const endISO = parsed.end_date || (parsed.selected_dates?.length ? parsed.selected_dates[parsed.selected_dates.length - 1] : undefined)
      setEvent({
        ...parsed,
        start_date: startISO ? new Date(startISO) : new Date(),
        end_date: endISO ? new Date(endISO) : new Date(),
        created_at: parsed.created_at ? new Date(parsed.created_at) : new Date(),
      })
    }

    const participantsData = localStorage.getItem(`participants_${eventId}`)
    if (participantsData) {
      const parsed = JSON.parse(participantsData)
      setParticipants(
        parsed.map((p: any) => ({
          ...p,
          availability: p.availability.map((slot: any) => ({
            date: new Date(slot.date),
            hour: slot.hour,
          })),
          created_at: new Date(p.created_at),
        })),
      )
    }
  }, [eventId, searchParams])

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || selectedSlots.length === 0) return

    setLoading(true)

    try {
      const participant: Participant = {
        id: Math.random().toString(36).substring(2, 15),
        name: name.trim(),
        email: email.trim() || undefined,
        availability: selectedSlots,
        created_at: new Date(),
      }

      const newParticipants = [...participants, participant]
      setParticipants(newParticipants)
      localStorage.setItem(`participants_${eventId}`, JSON.stringify(newParticipants))

      setName("")
      setEmail("")
      setSelectedSlots([])
      alert(t("common.success"))
    } catch (error) {
      console.error("[v0] Error submitting availability:", error)
      alert(t("common.error"))
    } finally {
      setLoading(false)
    }
  }

  const getHeatmapData = () => {
    const heatmap = new Map<string, number>()
    participants.forEach((participant) => {
      participant.availability.forEach((slot) => {
        const key = `${slot.date.toISOString().split("T")[0]}-${slot.hour}`
        heatmap.set(key, (heatmap.get(key) || 0) + 1)
      })
    })
    return heatmap
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground">{t("common.loading")}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-balance">{event.title}</h1>
          {event.description && (
            <p className="text-sm sm:text-base text-muted-foreground mb-4 text-pretty">{event.description}</p>
          )}
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <p className="text-xs sm:text-sm text-muted-foreground">{t("event.shareLink")}</p>
            <Button variant="outline" size="sm" onClick={handleCopyLink} className="w-full sm:w-auto bg-transparent">
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  {t("event.linkCopied")}
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  {t("event.copyLink")}
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-4">{t("event.markAvailability")}</h2>
              <p className="text-xs sm:text-sm text-muted-foreground mb-4">{t("event.clickDrag")}</p>
              <AvailabilityCalendar
                startDate={event.start_date}
                endDate={event.end_date}
                startHour={event.start_hour}
                endHour={event.end_hour}
                selectedSlots={selectedSlots}
                onSlotsChange={setSelectedSlots}
                heatmapData={participants.length > 0 ? getHeatmapData() : undefined}
                maxParticipants={participants.length}
              />
            </Card>

            <Card className="p-4 sm:p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t("event.yourName")}</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t("event.yourNamePlaceholder")}
                      required
                      className="text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("event.yourEmail")}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t("event.yourEmailPlaceholder")}
                      className="text-base"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{t("event.emailNotice")}</p>
                <Button
                  type="submit"
                  className="w-full text-base py-6"
                  disabled={loading || !name.trim() || selectedSlots.length === 0}
                >
                  {loading ? t("event.submitting") : t("event.submit")}
                </Button>
              </form>
            </Card>
          </div>

          <div className="space-y-6">
            <ParticipantList participants={participants} />
            <BestTimesList participants={participants} startHour={event.start_hour} endHour={event.end_hour} />
          </div>
        </div>
      </div>
    </div>
  )
}

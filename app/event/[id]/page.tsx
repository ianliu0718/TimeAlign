"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { useLanguage } from "@/lib/i18n/language-context"
import { getEvent, getParticipants, upsertParticipant } from "@/lib/db"
import { createClient } from "@/lib/supabase/client"
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
  const [subscribed, setSubscribed] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([])
  const [lockName, setLockName] = useState(false)
  const [focusSlot, setFocusSlot] = useState<{ date: Date; hour: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const refreshTimer = useRef<NodeJS.Timeout | null>(null)

  // Supabase Realtime 訂閱 participants 表
  useEffect(() => {
    let isMounted = true
    async function fetchAll() {
      const evt = await getEvent(eventId)
      if (isMounted) setEvent(evt)
      const parts = await getParticipants(eventId)
      if (isMounted) setParticipants(parts)
    }
    fetchAll()
    if (!subscribed) {
      const supabase = createClient()
      const channel = supabase.channel(`participants-${eventId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'participants',
          filter: `event_id=eq.${eventId}`,
        }, (payload) => {
          fetchAll()
        })
        .subscribe()
      setSubscribed(true)
      return () => {
        channel.unsubscribe()
        isMounted = false
      }
    }
    return () => { isMounted = false }
  }, [eventId, subscribed])

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
      let token: string | undefined
      const key = `lockToken:${eventId}:${name.trim()}`
      if (lockName) {
        token = localStorage.getItem(key) || crypto.randomUUID()
        localStorage.setItem(key, token)
      }
      await upsertParticipant(eventId, {
        name: name.trim(),
        email: email.trim() || undefined,
        availability: selectedSlots,
        lock: lockName,
        token,
      })
      setName("")
      setEmail("")
      setSelectedSlots([])
      // 送出後立即刷新
      const parts = await getParticipants(eventId)
      setParticipants(parts)
      alert(t("common.success"))
    } catch (error) {
      console.error("[v0] Error submitting availability:", error)
      if ((error as Error).message === 'NAME_LOCKED') {
        alert(t('event.nameLocked'))
      } else {
        alert(t("common.error"))
      }
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
                onSlotFocus={(date, hour) => setFocusSlot({ date, hour })}
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

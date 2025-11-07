import { createClient } from "./supabase/client"
import type { Event, Participant, TimeSlot } from "./types"

export async function createEvent(event: Omit<Event, "created_at">) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("events")
    .insert({
      id: event.id,
      title: event.title,
      description: event.description,
      start_date: event.start_date.toISOString(),
      end_date: event.end_date.toISOString(),
      start_hour: event.start_hour,
      end_hour: event.end_hour,
      timezone: event.timezone,
      duration: event.duration,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getEvent(eventId: string): Promise<Event | null> {
  const supabase = createClient()

  const { data, error } = await supabase.from("events").select("*").eq("id", eventId).single()

  if (error) {
    console.error("[v0] Error fetching event:", error)
    return null
  }

  return {
    ...data,
    start_date: new Date(data.start_date),
    end_date: new Date(data.end_date),
    created_at: new Date(data.created_at),
  }
}

export async function createParticipant(eventId: string, participant: Omit<Participant, "id" | "created_at">) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("participants")
    .insert({
      event_id: eventId,
      name: participant.name,
      email: participant.email,
      availability: participant.availability.map((slot) => ({
        date: slot.date.toISOString(),
        hour: slot.hour,
      })),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getParticipants(eventId: string): Promise<Participant[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("participants")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching participants:", error)
    return []
  }

  return data.map((p: any) => ({
    id: p.id,
    name: p.name,
    email: p.email,
    locked: p.locked ?? false,
    availability: (Array.isArray(p.availability) ? p.availability : (typeof p.availability === 'string' ? JSON.parse(p.availability) : [])).map(
      (slot: any) => ({
        date: new Date(slot.date),
        hour: slot.hour,
      }),
    ),
    created_at: new Date(p.created_at),
  }))
}

export async function upsertParticipant(
  eventId: string,
  participant: { name: string; email?: string; availability: TimeSlot[]; lock?: boolean; token?: string },
) {
  const supabase = createClient()
  const { data: existing, error: findErr } = await supabase
    .from('participants')
    .select('id, locked, auth_token')
    .eq('event_id', eventId)
    .eq('name', participant.name)
    .maybeSingle()
  if (findErr) throw findErr

  const availability = participant.availability.map((s) => ({ date: s.date.toISOString(), hour: s.hour }))

  if (!existing) {
    const body: any = {
      event_id: eventId,
      name: participant.name,
      email: participant.email,
      availability,
    }
    if (participant.lock) {
      body.locked = true
      body.auth_token = participant.token || crypto.randomUUID()
    }
    const { data, error } = await supabase.from('participants').insert(body).select().single()
    if (error) throw error
    return data
  }

  if (existing.locked && existing.auth_token && existing.auth_token !== participant.token) {
    throw new Error('NAME_LOCKED')
  }

  const updateBody: any = {
    email: participant.email,
    availability,
  }
  if (participant.lock) {
    updateBody.locked = true
    updateBody.auth_token = existing.auth_token || participant.token || crypto.randomUUID()
  }
  const { data, error } = await supabase.from('participants').update(updateBody).eq('id', existing.id).select().single()
  if (error) throw error
  return data
}

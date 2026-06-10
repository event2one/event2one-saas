export type TrackedEventInfo = {
    first_at: string
    last_at: string
    count: number
}

const E2O_EVENTS_API_URL = 'https://www.mlg-consulting.com/smart_territory/form/e2o_events_api.php'

export async function trackEvent(
    eventId: string,
    eventType: string,
    idContact?: string | null,
    meta?: Record<string, unknown>
): Promise<void> {
    await fetch(`${E2O_EVENTS_API_URL}?action=createE2oEvent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_event: eventId, event_type: eventType, id_contact: idContact ?? null, meta }),
    })
}

export async function getEventMap(
    eventId: string,
    eventType: string
): Promise<Record<string, TrackedEventInfo>> {
    const res = await fetch(`${E2O_EVENTS_API_URL}?action=getE2oEvents&id_event=${eventId}&event_type=${encodeURIComponent(eventType)}`)
    const data = await res.json()
    if (!data || typeof data !== 'object' || Array.isArray(data)) return {}
    return data as Record<string, TrackedEventInfo>
}

export async function getEventCounts(eventId: string): Promise<Record<string, number>> {
    const res = await fetch(`${E2O_EVENTS_API_URL}?action=getE2oEvents&id_event=${eventId}`)
    const data = await res.json()
    if (!data || typeof data !== 'object' || Array.isArray(data)) return {}
    return data as Record<string, number>
}

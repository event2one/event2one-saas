export type BadgeTrackingSource = 'badge_page' | 'print_token'

export type BadgeTrackingInfo = {
    first_displayed_at: string
    last_displayed_at: string
    count: number
}

const E2O_BADGE_TRACKING_API_URL = 'https://www.mlg-consulting.com/smart_territory/form/e2o_badge_tracking_api.php'

export async function recordBadgeDisplay(
    eventId: string,
    idContact: string,
    source: BadgeTrackingSource
): Promise<void> {
    await fetch(`${E2O_BADGE_TRACKING_API_URL}?action=createE2oBadgeTracking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_event: eventId, id_contact: idContact, source }),
    })
}

export async function getBadgeTrackingMap(
    eventId: string
): Promise<Record<string, BadgeTrackingInfo>> {
    const res = await fetch(`${E2O_BADGE_TRACKING_API_URL}?action=getE2oBadgeTracking&id_event=${eventId}`)
    const data = await res.json()
    if (!data || typeof data !== 'object' || Array.isArray(data)) return {}
    return data as Record<string, BadgeTrackingInfo>
}

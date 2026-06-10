import { NextRequest, NextResponse } from 'next/server'
import { recordBadgeDisplay, getBadgeTrackingMap, type BadgeTrackingSource } from '@/lib/badge-tracking-db'

const VALID_SOURCES: BadgeTrackingSource[] = ['badge_page', 'print_token']

export async function GET(req: NextRequest) {
    const eventId = req.nextUrl.searchParams.get('id_event')
    if (!eventId) {
        return NextResponse.json({ error: 'id_event is required' }, { status: 400 })
    }
    try {
        const data = await getBadgeTrackingMap(eventId)
        return NextResponse.json(data)
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    const body = await req.json()
    const { id_event, id_contact, source } = body as { id_event?: string; id_contact?: string; source?: string }

    if (!id_event || !id_contact) {
        return NextResponse.json({ error: 'id_event and id_contact are required' }, { status: 400 })
    }
    if (!VALID_SOURCES.includes(source as BadgeTrackingSource)) {
        return NextResponse.json({ error: 'Invalid source' }, { status: 400 })
    }

    try {
        await recordBadgeDisplay(id_event, id_contact, source as BadgeTrackingSource)
        return NextResponse.json({ ok: true })
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 })
    }
}

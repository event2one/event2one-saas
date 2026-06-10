import { NextRequest, NextResponse } from 'next/server'
import { trackEvent, getEventMap, getEventCounts } from '@/lib/events-db'

export async function GET(req: NextRequest) {
    const eventId = req.nextUrl.searchParams.get('id_event')
    const eventType = req.nextUrl.searchParams.get('event_type')
    if (!eventId) {
        return NextResponse.json({ error: 'id_event is required' }, { status: 400 })
    }
    try {
        if (eventType) {
            const data = await getEventMap(eventId, eventType)
            return NextResponse.json(data)
        }
        const data = await getEventCounts(eventId)
        return NextResponse.json(data)
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    const body = await req.json()
    const { id_event, event_type, id_contact, meta } = body as {
        id_event?: string
        event_type?: string
        id_contact?: string
        meta?: Record<string, unknown>
    }

    if (!id_event || !event_type) {
        return NextResponse.json({ error: 'id_event and event_type are required' }, { status: 400 })
    }

    try {
        await trackEvent(id_event, event_type, id_contact ?? null, meta)
        return NextResponse.json({ ok: true })
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 })
    }
}

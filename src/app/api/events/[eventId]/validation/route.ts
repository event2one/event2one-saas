import { NextRequest, NextResponse } from 'next/server'
import { getValidations, setValidation, type ValidationStatus } from '@/lib/validation-db'

const VALID_STATUSES: ValidationStatus[] = ['en_attente', 'retenu', 'liste_attente', 'non_retenu']

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ eventId: string }> }
) {
    const { eventId } = await params
    try {
        const data = await getValidations(eventId)
        return NextResponse.json(data)
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 })
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ eventId: string }> }
) {
    const { eventId } = await params
    const body = await req.json()
    const { id_contact, status } = body as { id_contact?: string; status?: string }

    if (!id_contact || !status) {
        return NextResponse.json({ error: 'id_contact and status are required' }, { status: 400 })
    }
    if (!VALID_STATUSES.includes(status as ValidationStatus)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    try {
        await setValidation(eventId, id_contact, status as ValidationStatus)
        return NextResponse.json({ ok: true })
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 })
    }
}

/**
 * POST /api/badge/token  → génère un token chiffré
 * GET  /api/badge/token?t=<token> → déchiffre et retourne le payload
 */

import { NextResponse } from 'next/server'
import { encryptBadgeToken, decryptBadgeToken, type BadgeTokenPayload } from '@/lib/badge-token'

export async function POST(req: Request) {
    let body: Partial<BadgeTokenPayload>
    try {
        body = await req.json()
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    // Validation des champs obligatoires
    if (!body.id_event || !body.id_contact) {
        return NextResponse.json({ error: 'id_event and id_contact are required' }, { status: 400 })
    }

    // Validation format numérique — protection contre l'injection
    if (!/^\d+$/.test(body.id_event) || !/^\d+$/.test(body.id_contact)) {
        return NextResponse.json({ error: 'id_event and id_contact must be numeric' }, { status: 400 })
    }

    try {
        const token = encryptBadgeToken({
            id_event: body.id_event,
            id_contact: body.id_contact,
            autoprint: body.autoprint,
        })
        // qrData : format compact id_event:id_contact — QR numérique, taille minimale, scan rapide
        const qrData = `${body.id_event}:${body.id_contact}`
        return NextResponse.json({ token, qrData })
    } catch {
        return NextResponse.json({ error: 'Token generation failed' }, { status: 500 })
    }
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const t = searchParams.get('t')

    if (!t) {
        return NextResponse.json({ error: 'Missing token parameter' }, { status: 400 })
    }

    try {
        const payload = decryptBadgeToken(t)
        const qrData = `${payload.id_event}:${payload.id_contact}`
        return NextResponse.json({ ...payload, qrData })
    } catch {
        return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }
}

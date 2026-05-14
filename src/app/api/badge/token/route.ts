/**
 * POST /api/badge/token  → génère un token chiffré
 * GET  /api/badge/token?t=<token> → déchiffre et retourne le payload
 */

import { NextResponse } from 'next/server'
import { encryptBadgeToken, decryptBadgeToken, signQrData, type BadgeTokenPayload, TOKEN_TTL_DAYS_DEFAULT } from '@/lib/badge-token'

export async function POST(req: Request) {
    let body: Partial<BadgeTokenPayload> & { ttl_days?: number }
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

    // TTL en jours — défaut 90j, max 365j
    const ttlDays = Math.min(Math.max(Number(body.ttl_days) || TOKEN_TTL_DAYS_DEFAULT, 1), 365)

    try {
        const token = encryptBadgeToken({
            id_event: body.id_event,
            id_contact: body.id_contact,
            autoprint: body.autoprint,
        }, ttlDays)
        // qrData signé : id_event:id_contact:HMAC8 — infalsifiable, scan < 1ms
        const qrData = signQrData(body.id_event, body.id_contact)
        return NextResponse.json({ token, qrData, ttl_days: ttlDays })
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
        const qrData = signQrData(payload.id_event, payload.id_contact)
        return NextResponse.json({ ...payload, qrData })
    } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        if (msg === 'BADGE_TOKEN_SECRET is not configured') {
            console.error('[badge/token] BADGE_TOKEN_SECRET is not configured on this server')
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
        }
        return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }
}

/**
 * GET /api/badge/verify-qr?q=id_event:id_contact:HMAC8
 * Vérifie la signature HMAC d'un QR code scanné.
 * Répond en < 1ms — aucune base de données consultée.
 */

import { NextResponse } from 'next/server'
import { verifyQrData } from '@/lib/badge-token'

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q')

    if (!q) {
        return NextResponse.json({ valid: false, error: 'Missing q parameter' }, { status: 400 })
    }

    const result = verifyQrData(q)
    if (!result) {
        return NextResponse.json({ valid: false, error: 'Invalid or unsigned QR code' }, { status: 401 })
    }

    return NextResponse.json({ valid: true, ...result })
}

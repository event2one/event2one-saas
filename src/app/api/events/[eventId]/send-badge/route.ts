/**
 * POST /api/events/[eventId]/send-badge
 * Envoie (ou réenvoie) l'e-badge par email à un contact déjà existant,
 * sans recréer de contact ni d'inscription.
 */

import { NextRequest, NextResponse } from 'next/server'
import { API_URL } from '@/utils/api'
import { EVENT_CONFIG } from '@/config/events'
import { encryptBadgeToken } from '@/lib/badge-token'
import { buildTicketEmailHtml } from '@/lib/ticket-email'

export async function POST(req: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
    const { eventId } = await params
    let body: { id_contact?: string; prenom?: string; nom?: string; mail?: string; siteUrl?: string }
    try {
        body = await req.json()
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { id_contact, prenom, nom, mail } = body
    if (!id_contact || !prenom || !nom || !mail) {
        return NextResponse.json({ error: 'id_contact, prenom, nom et mail sont obligatoires' }, { status: 400 })
    }

    const eventCfg = EVENT_CONFIG[eventId] ?? {}
    const origin = (body.siteUrl ?? process.env.BETTER_AUTH_URL ?? new URL(req.url).origin).replace(/\/saas\/?$/, '')

    try {
        const token = encryptBadgeToken({ id_event: eventId, id_contact })
        const badgeUrl = `${origin}/saas/print/badge/${eventId}?t=${encodeURIComponent(token)}`
        const eventName = eventCfg.email?.eventName ?? 'l\'événement'

        await fetch(`${API_URL}?action=sendEmailNotification`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                dest: mail,
                subject: `Votre billet d'entrée — ${eventName}`,
                from_name: eventCfg.email?.fromName ?? eventCfg.email?.eventName,
                reply_to: eventCfg.email?.replyTo,
                AddBCC: eventCfg.email?.contactEmail,
                body: buildTicketEmailHtml(eventCfg, { prenom, nom }, badgeUrl, [
                    `Vous êtes inscrit(e) au <strong>${eventName}</strong> — nous vous donnons rendez-vous prochainement.`,
                    `Voici votre billet d'entrée nominatif avec QR Code : imprimez-le ou présentez-le directement depuis votre téléphone à l'accueil le jour J.`,
                ]),
            }),
        })

        return NextResponse.json({ success: true, badgeUrl })
    } catch (err) {
        return NextResponse.json({ error: err instanceof Error ? err.message : 'Erreur inconnue' }, { status: 500 })
    }
}

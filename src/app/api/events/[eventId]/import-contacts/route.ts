/**
 * POST /api/events/[eventId]/import-contacts
 * Importe une liste de contacts (issus d'un fichier CSV/XLS), les inscrit à
 * l'événement avec le statut fourni, les marque comme "retenu" dans le
 * workflow de validation, et leur envoie immédiatement leur e-badge par email.
 */

import { NextRequest, NextResponse } from 'next/server'
import { API_URL } from '@/utils/api'
import { EVENT_CONFIG } from '@/config/events'
import { encryptBadgeToken } from '@/lib/badge-token'
import { buildTicketEmailHtml } from '@/lib/ticket-email'
import { setValidation } from '@/lib/validation-db'

type ImportContact = {
    nom: string
    prenom: string
    mail: string
    societe?: string
    fonction?: string
}

type ImportResult = {
    row: number
    nom: string
    prenom: string
    mail: string
    success: boolean
    id_contact?: string
    error?: string
}

const DEFAULT_STATUT = 480

async function callApi(action: string, body: Record<string, unknown>) {
    const res = await fetch(`${API_URL}?action=${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
    const text = await res.text()
    try {
        return JSON.parse(text)
    } catch {
        return text
    }
}

function extractId(raw: unknown, key: string): string | null {
    if (typeof raw === 'string' || typeof raw === 'number') {
        const n = parseInt(String(raw), 10)
        return Number.isFinite(n) && n > 0 ? String(n) : null
    }
    if (raw && typeof raw === 'object' && key in raw) {
        const v = (raw as Record<string, unknown>)[key]
        const n = parseInt(String(v), 10)
        return Number.isFinite(n) && n > 0 ? String(n) : null
    }
    return null
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
    const { eventId } = await params
    let body: { contacts?: ImportContact[]; statut?: number; sendBadge?: boolean; siteUrl?: string }
    try {
        body = await req.json()
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const contacts = Array.isArray(body.contacts) ? body.contacts : []
    if (contacts.length === 0) {
        return NextResponse.json({ error: 'contacts array is required' }, { status: 400 })
    }

    const statut = body.statut ?? DEFAULT_STATUT
    const sendBadge = body.sendBadge ?? true
    const eventCfg = EVENT_CONFIG[eventId] ?? {}
    const origin = (body.siteUrl ?? process.env.BETTER_AUTH_URL ?? new URL(req.url).origin).replace(/\/saas\/?$/, '')

    const results: ImportResult[] = []

    for (let i = 0; i < contacts.length; i++) {
        const c = contacts[i]
        const result: ImportResult = { row: i, nom: c.nom, prenom: c.prenom, mail: c.mail, success: false }

        try {
            if (!c.nom || !c.prenom || !c.mail) {
                throw new Error('nom, prenom et mail sont obligatoires')
            }

            // 1. Créer (ou retrouver) le contact
            const contactRaw = await callApi('createContact', {
                nom: c.nom,
                prenom: c.prenom,
                mail: c.mail,
                societe: c.societe ?? '',
                fonction: c.fonction ?? '',
            })
            const id_contact = extractId(contactRaw, 'id_contact')
            if (!id_contact) throw new Error('La création du contact a échoué.')
            result.id_contact = id_contact

            // 2. Inscrire le contact à l'event (sans conf_event)
            const confRaw = await callApi('createConferencier', {
                id_contact,
                id_conf_event: '',
                statut,
                id_event: eventId,
                is_speaker: 0,
            })
            const id_conferencier = extractId(confRaw, 'id_conferencier')
            if (!id_conferencier) throw new Error("L'association contact/créneau a échoué.")

            // 3. Créer la presta associée
            await callApi('createPresta', { id_contact })

            // 4. Marquer comme "retenu" dans le workflow de validation
            await setValidation(eventId, id_contact, 'retenu')

            // 5. Générer le lien du badge et envoyer l'email
            if (sendBadge) {
                const token = encryptBadgeToken({ id_event: eventId, id_contact })
                const badgeUrl = `${origin}/saas/print/badge/${eventId}?t=${encodeURIComponent(token)}`
                const eventName = eventCfg.email?.eventName ?? 'l\'événement'

                await callApi('sendEmailNotification', {
                    dest: c.mail,
                    subject: `Votre billet d'entrée — ${eventName}`,
                    from_name: eventCfg.email?.fromName ?? eventCfg.email?.eventName,
                    reply_to: eventCfg.email?.replyTo,
                    AddBCC: eventCfg.email?.contactEmail,
                    body: buildTicketEmailHtml(eventCfg, { prenom: c.prenom, nom: c.nom }, badgeUrl, [
                        `Vous êtes inscrit(e) au <strong>${eventName}</strong> — nous vous donnons rendez-vous prochainement.`,
                        `Voici votre billet d'entrée nominatif avec QR Code : imprimez-le ou présentez-le directement depuis votre téléphone à l'accueil le jour J.`,
                    ]),
                })
            }

            result.success = true
        } catch (err) {
            result.error = err instanceof Error ? err.message : 'Erreur inconnue'
        }

        results.push(result)
    }

    return NextResponse.json({ results })
}

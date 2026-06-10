'use client'

import { useState, useEffect, Suspense } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, AlertTriangle, Loader2, ArrowLeft, Ticket } from 'lucide-react'
import { API_URL } from '@/utils/api'
import { EVENT_CONFIG, type EventConfig } from '@/config/events'
import { buildTicketEmailHtml } from '@/lib/ticket-email'

/** Statut attribué par le visiteur lui-même via le lien de confirmation (distinct des décisions admin confirme/confirme_admin) */
const VISITOR_CONFIRMED_STATE = 'inscription_validee_par_le_visiteur'
const CONFIRMED_STATES = new Set(['confirme', 'confirme_admin', VISITOR_CONFIRMED_STATE])

type Contact = {
    id_contact: string
    id_conferencier: string
    prenom: string
    nom: string
    mail: string
    cf_etat: string
}

type ViewState = 'loading' | 'invalid' | 'ready' | 'submitting' | 'done' | 'already' | 'error'

// ─── Card layout ─────────────────────────────────────────────────────────────

function EventCard({ cfg, children }: { cfg: EventConfig; children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-background px-4 py-12">
            <div className="max-w-xl w-full mx-auto bg-card border rounded-2xl overflow-hidden text-center">
                {cfg.headerImageUrl && <img src={cfg.headerImageUrl} alt="" className="w-full block" />}
                <div className="px-8 py-8 space-y-4" style={cfg.fontSizeZoom ? { zoom: cfg.fontSizeZoom } : undefined}>
                    {children}
                </div>
                {cfg.footerImageUrl && <img src={cfg.footerImageUrl} alt="" className="w-full block" />}
            </div>
        </div>
    )
}

// ─── Page ────────────────────────────────────────────────────────────────────

function ConfirmPresenceContent() {
    const params = useParams()
    const searchParams = useSearchParams()
    const eventId = params?.eventId as string
    const token = searchParams?.get('t')
    const eventCfg = EVENT_CONFIG[eventId] ?? {}
    const eventName = eventCfg.email?.eventName ?? 'l\'événement'
    const primaryColor = eventCfg.primaryColor
    const primaryForeground = eventCfg.primaryForeground

    const [state, setState] = useState<ViewState>('loading')
    const [contact, setContact] = useState<Contact | null>(null)
    const [badgeUrl, setBadgeUrl] = useState<string | null>(null)
    const [errorMsg, setErrorMsg] = useState('')

    useEffect(() => {
        let cancelled = false

        async function load() {
            if (!token) { setState('invalid'); return }
            try {
                const tokenRes = await fetch(`/saas/api/badge/token?t=${encodeURIComponent(token)}`)
                const tokenData = await tokenRes.json()
                if (cancelled) return
                if (tokenData.error || !tokenData.id_contact || !tokenData.id_event) { setState('invalid'); return }
                if (String(tokenData.id_event) !== String(eventId)) { setState('invalid'); return }

                const filter = `AND cf.id_event=${eventId} AND c.id_contact=${tokenData.id_contact}`
                const res = await fetch(`${API_URL}?action=getPartenairesLight&params=${encodeURIComponent(filter)}`)
                const rows = await res.json()
                if (cancelled) return
                const row = Array.isArray(rows) ? rows[0] : null
                if (!row || !row.contact || !row.id_conferencier) { setState('invalid'); return }

                const c: Contact = {
                    id_contact: String(row.contact.id_contact),
                    id_conferencier: String(row.id_conferencier),
                    prenom: row.contact.prenom || '',
                    nom: row.contact.nom || '',
                    mail: row.contact.mail || '',
                    cf_etat: row.cf_etat || '',
                }
                setContact(c)

                if (CONFIRMED_STATES.has(c.cf_etat)) {
                    setState('already')
                    // Récupère le lien vers le billet déjà émis pour l'afficher à nouveau
                    fetch('/saas/api/badge/token', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id_event: eventId, id_contact: c.id_contact }),
                    }).then(r => r.json()).then(d => {
                        if (!cancelled && d.token) setBadgeUrl(`${window.location.origin}/saas/print/badge/${eventId}?t=${encodeURIComponent(d.token)}`)
                    }).catch(() => {})
                } else {
                    setState('ready')
                }
            } catch {
                if (!cancelled) setState('invalid')
            }
        }

        load()
        return () => { cancelled = true }
    }, [token, eventId])

    async function handleConfirm() {
        if (!contact) return
        setState('submitting')
        try {
            await fetch(`${API_URL}?action=updateConferencier`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_conferencier: contact.id_conferencier, cf_etat: VISITOR_CONFIRMED_STATE }),
            })

            let url: string | null = null
            try {
                const tokenRes = await fetch('/saas/api/badge/token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id_event: eventId, id_contact: contact.id_contact }),
                })
                const tokenData = await tokenRes.json()
                if (tokenData.token) {
                    url = `${window.location.origin}/saas/print/badge/${eventId}?t=${encodeURIComponent(tokenData.token)}`
                    setBadgeUrl(url)
                }
            } catch { /* lien optionnel */ }

            if (contact.mail) {
                fetch(`${API_URL}?action=sendEmailNotification`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        dest: contact.mail,
                        subject: `Votre billet d'entrée — ${eventName}`,
                        from_name: eventCfg.email?.fromName ?? eventCfg.email?.eventName,
                        reply_to: eventCfg.email?.replyTo,
                        AddBCC: eventCfg.email?.contactEmail,
                        body: buildTicketEmailHtml(eventCfg, contact, url),
                    }),
                }).catch(() => {})
            }

            setState('done')
        } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : 'Une erreur est survenue.')
            setState('error')
        }
    }

    const primaryBtnStyle = primaryColor ? { backgroundColor: primaryColor, color: primaryForeground ?? '#ffffff' } : undefined

    if (state === 'loading') {
        return (
            <EventCard cfg={eventCfg}>
                <Loader2 className="w-8 h-8 mx-auto animate-spin text-muted-foreground" />
                <p className="text-muted-foreground text-sm">Chargement de votre invitation…</p>
            </EventCard>
        )
    }

    if (state === 'invalid') {
        return (
            <EventCard cfg={eventCfg}>
                <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto">
                    <AlertTriangle className="w-7 h-7 text-amber-600 dark:text-amber-400" />
                </div>
                <h1 className="text-xl font-bold">Lien invalide ou expiré</h1>
                <p className="text-muted-foreground text-sm">
                    Ce lien de confirmation n&apos;est plus valide. Vérifiez que vous avez bien copié l&apos;intégralité du lien reçu par email,
                    ou contactez l&apos;organisateur{eventCfg.email?.contactEmail ? <> à <a href={`mailto:${eventCfg.email.contactEmail}`} className="underline">{eventCfg.email.contactEmail}</a></> : ''}.
                </p>
            </EventCard>
        )
    }

    if (state === 'error') {
        return (
            <EventCard cfg={eventCfg}>
                <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto">
                    <AlertTriangle className="w-7 h-7 text-red-600 dark:text-red-400" />
                </div>
                <h1 className="text-xl font-bold">Une erreur est survenue</h1>
                <p className="text-muted-foreground text-sm">{errorMsg || 'Merci de réessayer dans quelques instants.'}</p>
                <button onClick={handleConfirm} className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold rounded-lg transition-opacity hover:opacity-90" style={primaryBtnStyle}>
                    Réessayer
                </button>
            </EventCard>
        )
    }

    if (state === 'already' || state === 'done') {
        return (
            <EventCard cfg={eventCfg}>
                <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
                    <CheckCircle className="w-7 h-7 text-green-600 dark:text-green-400" />
                </div>
                <h1 className="text-xl font-bold">
                    {state === 'already' ? 'Votre présence est déjà confirmée' : 'Votre présence est confirmée !'}
                </h1>
                {contact && (
                    <p className="text-muted-foreground text-sm">
                        Merci <strong>{contact.prenom} {contact.nom}</strong> {state === 'done' ? ', à très bientôt !' : '— à très bientôt !'}
                    </p>
                )}
                {state === 'done' ? (
                    <p className="text-sm text-muted-foreground/70 border border-dashed rounded-lg px-4 py-3 text-left leading-relaxed">
                        📬 Un email contenant votre billet d&apos;entrée définitif (avec QR Code) vient de vous être envoyé.
                        S&apos;il n&apos;apparaît pas dans votre boîte de réception dans les prochaines minutes, pensez à vérifier votre dossier <strong>courriers indésirables</strong> ou <strong>spam</strong>.
                    </p>
                ) : (
                    <p className="text-muted-foreground text-sm">Vous avez déjà validé votre venue — votre billet d&apos;entrée vous a été envoyé par email.</p>
                )}
                {badgeUrl && (
                    <a
                        href={badgeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-opacity hover:opacity-90"
                        style={primaryBtnStyle}
                    >
                        <Ticket size={16} /> Voir mon billet d&apos;entrée
                    </a>
                )}
            </EventCard>
        )
    }

    // ready / submitting
    return (
        <EventCard cfg={eventCfg}>
            <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto">
                <Ticket className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-xl font-bold">Confirmer ma présence</h1>
            {contact && (
                <p className="text-muted-foreground text-sm">
                    Bonjour <strong>{contact.prenom} {contact.nom}</strong>, confirmez-vous votre venue à <strong>{eventName}</strong> ?
                </p>
            )}
            <p className="text-muted-foreground text-sm">
                En confirmant, vous recevrez par email votre billet d&apos;entrée définitif avec votre QR Code d&apos;accès.
            </p>
            <button
                onClick={handleConfirm}
                disabled={state === 'submitting'}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold rounded-lg transition-opacity hover:opacity-90 disabled:opacity-60"
                style={primaryBtnStyle}
            >
                {state === 'submitting' ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                {state === 'submitting' ? 'Confirmation en cours…' : 'Je serai présent(e) — Confirmer'}
            </button>
            <Link href={`/events/${eventId}/cancel?t=${encodeURIComponent(token ?? '')}`} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                <ArrowLeft size={12} /> Un empêchement ? Annuler ma venue
            </Link>
        </EventCard>
    )
}

export default function ConfirmPresencePage() {
    return (
        <Suspense fallback={null}>
            <ConfirmPresenceContent />
        </Suspense>
    )
}

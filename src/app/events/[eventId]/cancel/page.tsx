'use client'

import { useState, useEffect, Suspense } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, AlertTriangle, Loader2, ArrowLeft, CalendarX } from 'lucide-react'
import { API_URL } from '@/utils/api'
import { EVENT_CONFIG, type EventConfig } from '@/config/events'

/** Statut attribué quand le visiteur annule lui-même sa venue via le lien de désistement */
const VISITOR_CANCELLED_STATE = 'inscription_annulee_par_le_visiteur'

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

function CancelPresenceContent() {
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
                setState(c.cf_etat === VISITOR_CANCELLED_STATE ? 'already' : 'ready')
            } catch {
                if (!cancelled) setState('invalid')
            }
        }

        load()
        return () => { cancelled = true }
    }, [token, eventId])

    async function handleCancel() {
        if (!contact) return
        setState('submitting')
        try {
            await fetch(`${API_URL}?action=updateConferencier`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_conferencier: contact.id_conferencier, cf_etat: VISITOR_CANCELLED_STATE }),
            })
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
                    Ce lien de désistement n&apos;est plus valide. Vérifiez que vous avez bien copié l&apos;intégralité du lien reçu par email,
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
                <button onClick={handleCancel} className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold rounded-lg transition-opacity hover:opacity-90" style={primaryBtnStyle}>
                    Réessayer
                </button>
            </EventCard>
        )
    }

    if (state === 'already' || state === 'done') {
        return (
            <EventCard cfg={eventCfg}>
                <div className="w-14 h-14 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto">
                    <CheckCircle className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                </div>
                <h1 className="text-xl font-bold">
                    {state === 'already' ? 'Votre désistement est déjà enregistré' : 'Votre désistement est enregistré'}
                </h1>
                {contact && (
                    <p className="text-muted-foreground text-sm">
                        Merci <strong>{contact.prenom} {contact.nom}</strong>, votre place a été libérée pour une personne sur liste d&apos;attente.
                    </p>
                )}
                <p className="text-muted-foreground text-sm">
                    Un empêchement de dernière minute ? Contactez-nous{eventCfg.email?.contactEmail ? <> à <a href={`mailto:${eventCfg.email.contactEmail}`} className="underline">{eventCfg.email.contactEmail}</a></> : ''} si votre situation évolue.
                </p>
            </EventCard>
        )
    }

    // ready / submitting
    return (
        <EventCard cfg={eventCfg}>
            <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto">
                <CalendarX className="w-7 h-7 text-amber-600 dark:text-amber-400" />
            </div>
            <h1 className="text-xl font-bold">Annuler ma venue</h1>
            {contact && (
                <p className="text-muted-foreground text-sm">
                    Bonjour <strong>{contact.prenom} {contact.nom}</strong>, confirmez-vous que vous ne pourrez pas assister à <strong>{eventName}</strong> ?
                </p>
            )}
            <p className="text-muted-foreground text-sm">
                Votre place sera immédiatement libérée et proposée à une personne sur liste d&apos;attente. Cette action est définitive.
            </p>
            <button
                onClick={handleCancel}
                disabled={state === 'submitting'}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold rounded-lg bg-amber-600 text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
                {state === 'submitting' ? <Loader2 size={16} className="animate-spin" /> : <CalendarX size={16} />}
                {state === 'submitting' ? 'Annulation en cours…' : 'J’annule ma venue — Libérer ma place'}
            </button>
            <Link
                href={`/events/${eventId}/confirm?t=${encodeURIComponent(token ?? '')}`}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                style={primaryBtnStyle ? { color: primaryColor } : undefined}
            >
                <ArrowLeft size={12} /> Finalement je serai présent(e) — confirmer ma venue
            </Link>
        </EventCard>
    )
}

export default function CancelPresencePage() {
    return (
        <Suspense fallback={null}>
            <CancelPresenceContent />
        </Suspense>
    )
}

'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Mail, Send, Printer, CheckCircle, XCircle, Loader2, RefreshCw, UserPlus } from 'lucide-react'
import { API_URL } from '@/utils/api'
import { EVENT_CONFIG } from '@/config/events'
import { buildTicketEmailHtml } from '@/lib/ticket-email'

const RESET_DELAY_MS = 12_000

type Phase = 'idle' | 'lookup' | 'choose' | 'processing' | 'sent' | 'notfound' | 'error'
type Action = 'email' | 'print' | 'both'

type Contact = {
    id_contact: string
    prenom: string
    nom: string
    mail: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function OnsiteKioskPage() {
    const { eventId } = useParams<{ eventId: string }>()
    const cfg = EVENT_CONFIG[eventId] ?? {}
    const [email, setEmail] = useState('')
    const [phase, setPhase] = useState<Phase>('idle')
    const [contact, setContact] = useState<Contact | null>(null)
    const [sentTo, setSentTo] = useState('')
    const resetRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        return () => { if (resetRef.current) clearTimeout(resetRef.current) }
    }, [])

    const reset = () => {
        if (resetRef.current) clearTimeout(resetRef.current)
        setEmail('')
        setContact(null)
        setPhase('idle')
    }

    const scheduleReset = () => {
        if (resetRef.current) clearTimeout(resetRef.current)
        resetRef.current = setTimeout(reset, RESET_DELAY_MS)
    }

    const handleLookup = async (e: React.FormEvent) => {
        e.preventDefault()
        const trimmed = email.trim()
        if (!EMAIL_RE.test(trimmed)) return

        setPhase('lookup')
        try {
            const escaped = trimmed.replace(/'/g, "''")
            const params = `AND cf.id_event=${eventId} AND c.mail='${escaped}'`
            const res = await fetch(`${API_URL}?action=getPartenairesLight&params=${encodeURIComponent(params)}`)
            const rows = await res.json()
            const row = Array.isArray(rows) ? rows[0] : null
            if (!row?.contact?.id_contact) {
                setPhase('notfound')
                scheduleReset()
                return
            }

            setContact({
                id_contact: String(row.contact.id_contact),
                prenom: row.contact.prenom || '',
                nom: row.contact.nom || '',
                mail: row.contact.mail || trimmed,
            })
            setPhase('choose')
        } catch {
            setPhase('error')
            scheduleReset()
        }
    }

    const sendBadgeEmail = async (c: Contact) => {
        let badgeUrl: string | null = null
        try {
            const tokenRes = await fetch('/saas/api/badge/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_event: String(eventId), id_contact: c.id_contact }),
            })
            const tokenData = await tokenRes.json()
            if (tokenData.token) {
                badgeUrl = `${window.location.origin}/saas/print/badge/${eventId}?t=${encodeURIComponent(tokenData.token)}`
            }
        } catch { /* lien optionnel */ }

        await fetch(`${API_URL}?action=sendEmailNotification`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                dest: c.mail,
                subject: `Votre billet d'entrée — ${cfg.email?.eventName ?? 'l\'événement'}`,
                from_name: cfg.email?.fromName ?? cfg.email?.eventName,
                reply_to: cfg.email?.replyTo,
                AddBCC: cfg.email?.contactEmail,
                body: buildTicketEmailHtml(cfg, c, badgeUrl),
            }),
        })
    }

    const printBadge = async (c: Contact) => {
        const tokenRes = await fetch('/saas/api/badge/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_event: String(eventId), id_contact: c.id_contact, autoprint: true }),
        })
        const tokenData = await tokenRes.json()
        if (!tokenData.token) throw new Error("La génération du badge a échoué.")
        window.location.href = `/saas/print/badge/${eventId}?t=${encodeURIComponent(tokenData.token)}`
    }

    const handleAction = async (action: Action) => {
        if (!contact) return
        setPhase('processing')
        try {
            if (action === 'email') {
                await sendBadgeEmail(contact)
                setSentTo(contact.mail)
                setPhase('sent')
                scheduleReset()
                return
            }
            if (action === 'both') {
                await sendBadgeEmail(contact)
            }
            // 'print' et 'both' redirigent vers l'impression (sortie de page)
            await printBadge(contact)
        } catch {
            setPhase('error')
            scheduleReset()
        }
    }

    return (
        <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-6 bg-background">
            <div className="w-full max-w-md text-center space-y-6">
                {phase === 'idle' && (
                    <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-muted">
                        <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-card font-semibold text-sm shadow-sm">
                            <Mail size={16} /> Je suis déjà inscrit(e)
                        </div>
                        <Link
                            href={`/events/${eventId}/onsite/register`}
                            className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-muted-foreground hover:text-foreground hover:bg-card/60 active:scale-95 transition-transform"
                        >
                            <UserPlus size={16} /> Je m&apos;inscris sur place
                        </Link>
                    </div>
                )}

                {phase === 'sent' ? (
                    <>
                        <CheckCircle size={64} className="text-green-500 mx-auto" />
                        <h1 className="text-2xl font-bold">E-badge envoyé !</h1>
                        <p className="text-muted-foreground">
                            Votre billet d&apos;entrée avec QR Code vient d&apos;être envoyé à<br />
                            <strong>{sentTo}</strong>
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Pensez à vérifier vos courriers indésirables / spam.
                        </p>
                    </>
                ) : phase === 'notfound' ? (
                    <>
                        <XCircle size={64} className="text-amber-500 mx-auto" />
                        <h1 className="text-2xl font-bold">Email non trouvé</h1>
                        <p className="text-muted-foreground">
                            Aucune inscription ne correspond à cet email pour cet événement.<br />
                            Merci de vous présenter à l&apos;accueil.
                        </p>
                    </>
                ) : phase === 'error' ? (
                    <>
                        <XCircle size={64} className="text-destructive mx-auto" />
                        <h1 className="text-2xl font-bold">Une erreur est survenue</h1>
                        <p className="text-muted-foreground">
                            Merci de réessayer ou de vous présenter à l&apos;accueil.
                        </p>
                    </>
                ) : phase === 'choose' && contact ? (
                    <>
                        <CheckCircle size={64} className="text-green-500 mx-auto" />
                        <h1 className="text-2xl font-bold">Bonjour {contact.prenom} !</h1>
                        <p className="text-muted-foreground">
                            Comment souhaitez-vous récupérer votre badge ?
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={() => handleAction('email')}
                                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-lg border bg-card hover:bg-muted active:scale-95 transition-transform"
                            >
                                <Send size={20} /> Recevoir mon e-badge par email
                            </button>
                            <button
                                onClick={() => handleAction('print')}
                                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-lg border bg-card hover:bg-muted active:scale-95 transition-transform"
                            >
                                <Printer size={20} /> Imprimer mon badge
                            </button>
                            <button
                                onClick={() => handleAction('both')}
                                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-lg bg-primary text-primary-foreground active:scale-95 transition-transform"
                            >
                                <Printer size={20} /> Imprimer et recevoir par email
                            </button>
                        </div>
                    </>
                ) : phase === 'processing' ? (
                    <>
                        <Loader2 size={64} className="text-primary mx-auto animate-spin" />
                        <h1 className="text-2xl font-bold">Un instant…</h1>
                        <p className="text-muted-foreground">Préparation de votre badge.</p>
                    </>
                ) : (
                    <>
                        <Mail size={64} className="text-primary mx-auto" />
                        <h1 className="text-2xl font-bold">Recevoir ou imprimer mon e-badge</h1>
                        <p className="text-muted-foreground">
                            Vous êtes inscrit(e) mais n&apos;avez pas votre billet sur vous ?<br />
                            Saisissez votre email pour le récupérer ou l&apos;imprimer.
                        </p>
                        <form onSubmit={handleLookup} className="space-y-4">
                            <input
                                type="email"
                                inputMode="email"
                                autoFocus
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="prenom.nom@example.com"
                                disabled={phase === 'lookup'}
                                className="w-full px-4 py-4 rounded-2xl border bg-card text-center text-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                                required
                            />
                            <button
                                type="submit"
                                disabled={phase === 'lookup' || !EMAIL_RE.test(email.trim())}
                                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-lg bg-primary text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-transform"
                            >
                                {phase === 'lookup'
                                    ? <><Loader2 size={20} className="animate-spin" /> Recherche…</>
                                    : <><Send size={20} /> Continuer</>}
                            </button>
                        </form>
                    </>
                )}

                {(phase === 'sent' || phase === 'notfound' || phase === 'error' || phase === 'choose') && (
                    <button
                        onClick={reset}
                        className="mx-auto flex items-center gap-2 px-6 py-3 rounded-2xl border font-medium hover:bg-muted active:scale-95 transition-transform"
                    >
                        <RefreshCw size={16} /> Nouvelle saisie
                    </button>
                )}
            </div>
        </div>
    )
}

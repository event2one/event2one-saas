'use client'

import { useEffect, useState } from 'react'
import { Clock, MapPin, CheckCircle2, Circle, Loader2 } from 'lucide-react'
import { API_URL } from '@/utils/api'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ConfEventLight {
    id_conf_event: string
    titre: string
    date_conf_event?: string
    heure_debut?: string
    heure_fin?: string
    cel_titre?: string
    cel_titre_sub_groupe?: string
    salle?: string
    id_salle?: { id_salle: string; salle_nom: string; capacite?: string | number } | null
    type_conf_event?: string
    resume?: string
    nb_conferenciers?: string | number
    capacite?: string | number
    nb_inscrits?: string | number
}

export interface ProgramGridSelectorProps {
    /** ID of the event to load sessions for */
    eventId: string
    /** ID of the contact who is registering (required to call createConferencier) */
    id_contact?: number
    /** Participation status id passed to createConferencier (defaults to 143) */
    statut?: number
    /** Called with the current set of selected id_conf_event after each toggle */
    onSelectionChange?: (selectedIds: string[]) => void
    /** Called after a successful createConferencier call */
    onSessionRegistered?: (id_conf_event: string, id_conferencier: number) => void
    /** If false, only single selection is allowed */
    multiSelect?: boolean
    /** Show capacity gauge bar on each session card (default: false) */
    showGauge?: boolean
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(t?: string) {
    if (!t) return ''
    return t.slice(0, 5).replace(':', 'h')
}

function formatDate(d?: string) {
    if (!d) return ''
    try {
        return new Date(d).toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
        })
    } catch {
        return d
    }
}

function groupByDate(sessions: ConfEventLight[]): Map<string, ConfEventLight[]> {
    const map = new Map<string, ConfEventLight[]>()
    for (const s of sessions) {
        const key = s.date_conf_event ?? ''
        if (!map.has(key)) map.set(key, [])
        map.get(key)!.push(s)
    }
    for (const [, group] of map) {
        group.sort((a, b) => (a.heure_debut ?? '').localeCompare(b.heure_debut ?? ''))
    }
    return map
}

function parseNum(v?: string | number): number {
    return typeof v === 'number' ? v : parseInt(v ?? '0', 10) || 0
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ProgramGridSelector({
    eventId,
    id_contact,
    statut = 143,
    onSelectionChange,
    onSessionRegistered,
    multiSelect = true,
    showGauge = false,
}: ProgramGridSelectorProps) {
    const [sessions, setSessions] = useState<ConfEventLight[]>([])
    const [loading, setLoading] = useState(true)
    const [fetchError, setFetchError] = useState('')
    const [selected, setSelected] = useState<Set<string>>(new Set())
    const [registering, setRegistering] = useState<Set<string>>(new Set())
    const [registerErrors, setRegisterErrors] = useState<Record<string, string>>({})

    // ── Fetch sessions ────────────────────────────────────────────────────────
    useEffect(() => {
        if (!eventId) return
        setLoading(true)
        setFetchError('')

        fetch(`${API_URL}?action=getConfeventLight&filter=${encodeURIComponent(` AND e.id_event=${eventId}`)}`)
            .then(r => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`)
                return r.json()
            })
            .then((data: ConfEventLight[]) => {
                if (!Array.isArray(data)) throw new Error('Format inattendu')
                setSessions(data)
            })
            .catch(e => setFetchError(e.message ?? 'Erreur de chargement'))
            .finally(() => setLoading(false))
    }, [eventId])

    // ── Toggle session selection ──────────────────────────────────────────────
    const toggleSession = async (id_conf_event: string) => {
        const willSelect = !selected.has(id_conf_event)
        const next = new Set(multiSelect ? selected : new Set<string>())
        if (willSelect) {
            next.add(id_conf_event)
        } else {
            next.delete(id_conf_event)
        }
        setSelected(next)
        onSelectionChange?.(Array.from(next))

        // Optimistic gauge update
        setSessions(prev => prev.map(s =>
            s.id_conf_event === id_conf_event
                ? { ...s, nb_inscrits: Math.max(0, parseNum(s.nb_inscrits) + (willSelect ? 1 : -1)) }
                : s
        ))

        // If a contact is provided and we are selecting, call createConferencier
        if (willSelect && id_contact) {
            setRegistering(prev => new Set(prev).add(id_conf_event))
            setRegisterErrors(prev => { const n = { ...prev }; delete n[id_conf_event]; return n })

            try {
                const res = await fetch(`${API_URL}?action=createConferencier`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id_contact,
                        id_conf_event,
                        statut,
                        id_event: eventId,
                    }),
                })
                const raw = JSON.parse(await res.text())
                const id_conferencier =
                    typeof raw === 'string' || typeof raw === 'number'
                        ? parseInt(String(raw), 10)
                        : raw?.id_conferencier
                if (!id_conferencier) throw new Error('Inscription échouée')
                onSessionRegistered?.(id_conf_event, id_conferencier)
            } catch (e) {
                // Rollback selection and gauge
                setSelected(prev => { const n = new Set(prev); n.delete(id_conf_event); return n })
                onSelectionChange?.(Array.from(selected))
                setSessions(prev => prev.map(s =>
                    s.id_conf_event === id_conf_event
                        ? { ...s, nb_inscrits: Math.max(0, parseNum(s.nb_inscrits) - 1) }
                        : s
                ))
                setRegisterErrors(prev => ({
                    ...prev,
                    [id_conf_event]: e instanceof Error ? e.message : 'Erreur',
                }))
            } finally {
                setRegistering(prev => { const n = new Set(prev); n.delete(id_conf_event); return n })
            }
        }
    }

    // ── Render ────────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Chargement du programme…
            </div>
        )
    }

    if (fetchError) {
        return (
            <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                Impossible de charger le programme : {fetchError}
            </p>
        )
    }

    if (sessions.length === 0) {
        return (
            <p className="text-sm text-muted-foreground text-center py-6">
                Aucune session disponible pour cet événement.
            </p>
        )
    }

    const grouped = groupByDate(sessions)

    return (
        <div className="space-y-6">
            {Array.from(grouped.entries()).map(([date, group]) => (
                <div key={date}>
                    {date && (
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-1">
                            {formatDate(date)}
                        </h3>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {group.map(session => {
                            const isSelected = selected.has(session.id_conf_event)
                            const isBusy = registering.has(session.id_conf_event)
                            const errMsg = registerErrors[session.id_conf_event]
                            const cap = parseNum(
                                session.id_salle?.capacite ?? session.capacite
                            )
                            const inscrits = parseNum(session.nb_inscrits)
                            const full = cap > 0 && inscrits >= cap
                            const ratio = cap > 0 ? Math.min(inscrits / cap, 1) : 0
                            const isDisabled = (full && !isSelected) || isBusy

                            return (
                                <button
                                    key={session.id_conf_event}
                                    type="button"
                                    onClick={() => !isDisabled && toggleSession(session.id_conf_event)}
                                    disabled={isDisabled}
                                    className={[
                                        'relative w-full text-left rounded-xl border px-4 py-4 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                                        isSelected
                                            ? 'border-primary bg-primary/5 dark:bg-primary/10'
                                            : full
                                                ? 'border-border bg-muted/40 opacity-60'
                                                : 'border-border bg-card hover:border-primary/50 hover:bg-accent/40',
                                        isBusy
                                            ? 'cursor-wait opacity-70'
                                            : isDisabled
                                                ? 'cursor-not-allowed'
                                                : 'cursor-pointer',
                                    ].join(' ')}
                                >
                                    {/* Status icon */}
                                    <span className="absolute top-3 right-3">
                                        {isBusy ? (
                                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                        ) : isSelected ? (
                                            <CheckCircle2 className="w-4 h-4 text-primary" />
                                        ) : full ? (
                                            <span className="text-[10px] font-semibold text-destructive bg-destructive/10 rounded px-1.5 py-0.5">
                                                Complet
                                            </span>
                                        ) : (
                                            <Circle className="w-4 h-4 text-muted-foreground/50" />
                                        )}
                                    </span>

                                    {/* Title */}
                                    <p className="text-sm font-semibold pr-6 leading-snug">
                                        {session.cel_titre || session.titre || '(Sans titre)'}
                                    </p>

                                    {/* Meta */}
                                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                                        {(session.heure_debut || session.heure_fin) && (
                                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                                <Clock className="w-3 h-3 shrink-0" />
                                                {formatTime(session.heure_debut)}
                                                {session.heure_fin && ` – ${formatTime(session.heure_fin)}`}
                                            </span>
                                        )}
                                        {session.salle && (
                                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                                <MapPin className="w-3 h-3 shrink-0" />
                                                {session.salle}
                                            </span>
                                        )}
                                    </div>

                                    {/* Capacity gauge — only when capacite is set and showGauge is enabled */}
                                    {showGauge && cap > 0 && (
                                        <div className="mt-2.5 space-y-0.5">
                                            <div className="h-1 rounded-full bg-muted overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-300 ${ratio >= 1 ? 'bg-destructive' : ratio >= 0.8 ? 'bg-amber-500' : 'bg-primary'}`}
                                                    style={{ width: `${ratio * 100}%` }}
                                                />
                                            </div>
                                            <p className="text-[10px] text-muted-foreground">
                                                {full ? 'Session complète' : `${inscrits} / ${cap} places`}
                                            </p>
                                        </div>
                                    )}

                                    {/* Short description */}
                                    {session.resume && (
                                        <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                                            {session.resume}
                                        </p>
                                    )}

                                    {/* Inline error */}
                                    {errMsg && (
                                        <p className="mt-2 text-xs text-destructive">{errMsg}</p>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </div>
            ))}

            {selected.size > 0 && (
                <p className="text-xs text-muted-foreground text-right">
                    {selected.size} session{selected.size > 1 ? 's' : ''} sélectionnée{selected.size > 1 ? 's' : ''}
                </p>
            )}
        </div>
    )
}

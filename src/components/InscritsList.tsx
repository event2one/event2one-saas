'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { Loader2, RefreshCw, Mail, Linkedin, QrCode, Pencil } from 'lucide-react'
import { API_URL } from '@/utils/api'

// ─── Constants ────────────────────────────────────────────────────────────────

const CHECKIN_API_URL = 'https://www.mlg-consulting.com/smart_territory/form/checkin_api.php'
const CHECKIN_REFRESH_INTERVAL = 30000

// ─── Types ────────────────────────────────────────────────────────────────────

interface ContactPhotos {
    small?: string
    [key: string]: unknown
}

interface ContactData {
    id_contact: string
    prenom?: string
    nom?: string
    societe?: string
    fonction?: string
    photos?: ContactPhotos
    photo?: string
    mail?: string
    sn_linkedin?: string
    flag?: string
}

interface ConferencierStatut {
    id_event_contact_type: string
    libelle?: string
    event_contact_type_color?: string
}

interface ConfEventLight {
    id_conf_event: string
    titre?: string
    heure_debut?: string
    heure_fin?: string
    salle?: string
    date_conf_event?: string
}

interface RegistrationRow {
    id_conferencier: string
    id_conf_event?: string
    contact: ContactData
    conferencier_statut?: ConferencierStatut
}

interface ContactGroup {
    id_contact: string
    contact: ContactData
    statuts: ConferencierStatut[]
    sessions: ConfEventLight[]
    /** Most prominent statut (first encountered) */
    primaryStatut?: ConferencierStatut
}

interface CheckinRecord {
    id_contact: string
    scanned_at?: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function photoUrl(contact: ContactData): string | null {
    if (contact.photos?.small) return contact.photos.small
    if (contact.photo) return `https://www.mlg-consulting.com/manager_cc/contacts/img_uploaded/${contact.photo}`
    return null
}

function formatTime(t?: string) {
    if (!t) return ''
    return t.slice(0, 5).replace(':', 'h')
}

// ─── CheckinBadge ─────────────────────────────────────────────────────────────

function CheckinBadge({ scan }: { scan: CheckinRecord }) {
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium shrink-0">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {scan.scanned_at ? scan.scanned_at.slice(11, 16) : 'Badgé'}
        </span>
    )
}

// ─── SessionPill ──────────────────────────────────────────────────────────────

function SessionPill({ session }: { session: ConfEventLight }) {
    return (
        <span className="inline-flex items-center gap-1 text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded px-1.5 py-0.5">
            <span className="font-medium truncate max-w-56">
                {session.titre || `#${session.id_conf_event}`}
            </span>
            {session.heure_debut && (
                <span className="text-zinc-400 shrink-0">
                    {formatTime(session.heure_debut)}
                    {session.heure_fin ? `–${formatTime(session.heure_fin)}` : ''}
                </span>
            )}
        </span>
    )
}

// ─── InscritsListItem ─────────────────────────────────────────────────────────

function InscritsListItem({
    group,
    idEvent,
    scan,
}: {
    group: ContactGroup
    idEvent: string
    scan: CheckinRecord | null
}) {
    const { contact, primaryStatut, sessions } = group
    const badgeColor = primaryStatut?.event_contact_type_color ?? '#94a3b8'
    const [badgeLoading, setBadgeLoading] = useState(false)
    const photo = photoUrl(contact)
    const initials = `${contact.prenom?.[0] ?? ''}${contact.nom?.[0] ?? ''}`.toUpperCase()

    async function openBadge() {
        setBadgeLoading(true)
        try {
            const res = await fetch('/saas/api/badge/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_event: idEvent, id_contact: contact.id_contact }),
            })
            const data = await res.json()
            if (data.token) {
                const printUrl = `/saas/print/badge/${idEvent}?t=${encodeURIComponent(data.token)}`
                window.open(printUrl, '_blank')
            } else {
                alert('Erreur génération badge : ' + (data.error ?? 'inconnue'))
            }
        } catch {
            alert('Impossible de générer le badge.')
        } finally {
            setBadgeLoading(false)
        }
    }

    return (
        <div className={`flex items-start gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors ${scan ? 'bg-emerald-50/30 dark:bg-emerald-900/10' : ''}`}>
            {/* Avatar */}
            <div className="relative shrink-0 mt-0.5">
                {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={photo}
                        alt=""
                        className="w-9 h-9 rounded-full object-cover border border-zinc-200 dark:border-zinc-700"
                    />
                ) : (
                    <div className="w-9 h-9 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-600 dark:text-zinc-300">
                        {initials || '?'}
                    </div>
                )}
                {scan && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-zinc-900 rounded-full" />
                )}
            </div>

            {/* Identity + sessions */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                        {contact.prenom} {contact.nom}
                    </span>
                    {contact.flag && <span className="text-sm">{contact.flag}</span>}
                    {/* All statuts */}
                    {group.statuts.map(s => {
                        const c = s.event_contact_type_color ?? '#94a3b8'
                        return (
                            <span
                                key={s.id_event_contact_type}
                                className="inline-flex items-center px-2 py-0.5 text-xs rounded border"
                                style={{ backgroundColor: c + '20', color: c, borderColor: c + '40' }}
                            >
                                {s.libelle}
                            </span>
                        )
                    })}
                    {scan && <CheckinBadge scan={scan} />}
                </div>
                <div className="text-xs text-zinc-400 truncate mt-0.5">
                    {[contact.fonction, contact.societe].filter(Boolean).join(' · ')}
                </div>
                {/* Sessions */}
                {sessions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                        {sessions.map(s => (
                            <SessionPill key={s.id_conf_event} session={s} />
                        ))}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2.5 shrink-0 mt-0.5">
                <a
                    href={`#/events/${idEvent}/inscrits-edit/${group.id_contact}/`}
                    className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                    title="Éditer"
                >
                    <Pencil className="w-3.5 h-3.5" />
                </a>
                {contact.mail && (
                    <a
                        href={`mailto:${contact.mail}`}
                        className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                        title={contact.mail}
                    >
                        <Mail className="w-3.5 h-3.5" />
                    </a>
                )}
                {contact.sn_linkedin && (
                    <a
                        href={contact.sn_linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                        title="LinkedIn"
                    >
                        <Linkedin className="w-3.5 h-3.5" />
                    </a>
                )}
                <button
                    onClick={openBadge}
                    disabled={badgeLoading}
                    className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors disabled:opacity-40"
                    title="Générer e-badge A4"
                >
                    {badgeLoading
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <QrCode className="w-3.5 h-3.5" />
                    }
                </button>
            </div>
        </div>
    )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export interface InscritsListProps {
    eventId: string
}

export default function InscritsList({ eventId }: InscritsListProps) {
    const [rows, setRows] = useState<RegistrationRow[]>([])
    const [sessions, setSessions] = useState<ConfEventLight[]>([])
    const [checkinMap, setCheckinMap] = useState<Record<string, CheckinRecord>>({})
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [activeStatut, setActiveStatut] = useState<string | null>(null)
    const [presenceFilter, setPresenceFilter] = useState<'tous' | 'badges' | 'absents'>('tous')
    const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

    // ── Checkin refresh ───────────────────────────────────────────────────────
    const fetchCheckins = () => {
        fetch(`${CHECKIN_API_URL}?action=getCheckinList&id_event=${eventId}`)
            .then(r => r.json())
            .then((data: CheckinRecord[]) => {
                if (!Array.isArray(data)) return
                const map: Record<string, CheckinRecord> = {}
                data.forEach(c => { if (!map[c.id_contact]) map[c.id_contact] = c })
                setCheckinMap(map)
                setLastRefresh(new Date())
            })
            .catch(() => {})
    }

    // ── Initial load ──────────────────────────────────────────────────────────
    useEffect(() => {
        if (!eventId) return
        setLoading(true)

        Promise.all([
            fetch(`${API_URL}?action=getPartenairesLight&params=${encodeURIComponent(` AND cf.id_event=${eventId}`)}&order_by=nom ASC`).then(r => r.json()),
            fetch(`${API_URL}?action=getConfeventLight&filter=${encodeURIComponent(` AND e.id_event=${eventId}`)}`).then(r => r.json()),
            fetch(`${CHECKIN_API_URL}?action=getCheckinList&id_event=${eventId}`).then(r => r.json()),
        ])
            .then(([regsData, sessionsData, checkinsData]: [RegistrationRow[], ConfEventLight[], CheckinRecord[]]) => {
                setRows(Array.isArray(regsData) ? regsData : [])
                setSessions(Array.isArray(sessionsData) ? sessionsData : [])
                if (Array.isArray(checkinsData)) {
                    const map: Record<string, CheckinRecord> = {}
                    checkinsData.forEach(c => { if (!map[c.id_contact]) map[c.id_contact] = c })
                    setCheckinMap(map)
                    setLastRefresh(new Date())
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false))

        timerRef.current = setInterval(fetchCheckins, CHECKIN_REFRESH_INTERVAL)
        return () => { if (timerRef.current) clearInterval(timerRef.current) }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [eventId])

    // ── Session map ───────────────────────────────────────────────────────────
    const sessionMap = useMemo(() => {
        const m = new Map<string, ConfEventLight>()
        sessions.forEach(s => m.set(s.id_conf_event, s))
        return m
    }, [sessions])

    // ── Deduplicate: one ContactGroup per contact ─────────────────────────────
    const contactGroups = useMemo((): ContactGroup[] => {
        const map = new Map<string, ContactGroup>()
        rows.forEach(row => {
            const id = row.contact.id_contact
            if (!map.has(id)) {
                map.set(id, {
                    id_contact: id,
                    contact: row.contact,
                    statuts: [],
                    sessions: [],
                    primaryStatut: row.conferencier_statut,
                })
            }
            const group = map.get(id)!

            // Collect statuts (deduplicated)
            if (row.conferencier_statut) {
                const sid = row.conferencier_statut.id_event_contact_type
                if (!group.statuts.find(s => s.id_event_contact_type === sid)) {
                    group.statuts.push(row.conferencier_statut)
                }
            }

            // Collect sessions (deduplicated)
            if (row.id_conf_event) {
                if (!group.sessions.find(s => s.id_conf_event === row.id_conf_event)) {
                    const sessionData = sessionMap.get(row.id_conf_event) ?? { id_conf_event: row.id_conf_event }
                    group.sessions.push(sessionData)
                }
            }
        })
        return Array.from(map.values())
    }, [rows, sessionMap])

    // ── Unique statuts for filter bar ─────────────────────────────────────────
    const allStatuts = useMemo(() => {
        const map = new Map<string, ConferencierStatut>()
        contactGroups.forEach(g => g.statuts.forEach(s => { if (!map.has(s.id_event_contact_type)) map.set(s.id_event_contact_type, s) }))
        return Array.from(map.values())
    }, [contactGroups])

    const totalBadges = useMemo(
        () => contactGroups.filter(g => checkinMap[g.id_contact]).length,
        [contactGroups, checkinMap]
    )

    // ── Filter ────────────────────────────────────────────────────────────────
    const filtered = useMemo(() => {
        return contactGroups
            .filter(g => {
                if (activeStatut && !g.statuts.find(s => s.id_event_contact_type === activeStatut)) return false
                const isBadged = !!checkinMap[g.id_contact]
                if (presenceFilter === 'badges' && !isBadged) return false
                if (presenceFilter === 'absents' && isBadged) return false
                if (!search) return true
                const q = search.toLowerCase()
                const c = g.contact
                return (
                    (c.nom ?? '').toLowerCase().includes(q) ||
                    (c.prenom ?? '').toLowerCase().includes(q) ||
                    (c.societe ?? '').toLowerCase().includes(q) ||
                    (c.fonction ?? '').toLowerCase().includes(q) ||
                    g.statuts.some(s => (s.libelle ?? '').toLowerCase().includes(q)) ||
                    g.sessions.some(s => (s.titre ?? '').toLowerCase().includes(q))
                )
            })
            // Badgés en tête
            .sort((a, b) => {
                const aB = !!checkinMap[a.id_contact]
                const bB = !!checkinMap[b.id_contact]
                return aB === bB ? 0 : aB ? -1 : 1
            })
    }, [contactGroups, activeStatut, presenceFilter, search, checkinMap])

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    Inscrits{!loading && (
                        <span className="ml-2 text-sm font-normal text-zinc-400">{filtered.length}</span>
                    )}
                </h2>
                {!loading && (
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-sm text-emerald-700 font-medium bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            {totalBadges} / {contactGroups.length} badgés
                        </div>
                        <button
                            onClick={fetchCheckins}
                            className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                            title={lastRefresh
                                ? 'Actualisé à ' + lastRefresh.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                                : 'Actualiser'
                            }
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Search */}
            <input
                type="search"
                placeholder="Rechercher par nom, société, rôle, session…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition-colors"
            />

            {/* Presence filter */}
            <div className="flex gap-2">
                {(['tous', 'badges', 'absents'] as const).map(key => {
                    const labels = { tous: 'Tous', badges: 'Badgés', absents: 'Non badgés' }
                    const isActive = presenceFilter === key
                    return (
                        <button
                            key={key}
                            onClick={() => setPresenceFilter(key)}
                            className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                                isActive && key === 'badges'
                                    ? 'bg-emerald-600 text-white border-emerald-600'
                                    : isActive
                                        ? 'bg-zinc-800 text-white border-zinc-800 dark:bg-zinc-200 dark:text-zinc-900 dark:border-zinc-200'
                                        : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                            }`}
                        >
                            {key === 'badges' && (
                                <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                            {labels[key]}
                        </button>
                    )
                })}
            </div>

            {/* Statut filter */}
            {allStatuts.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setActiveStatut(null)}
                        className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                            activeStatut === null
                                ? 'bg-zinc-800 text-white border-zinc-800 dark:bg-zinc-200 dark:text-zinc-900 dark:border-zinc-200'
                                : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                        }`}
                    >
                        Tous rôles
                    </button>
                    {allStatuts.map(s => {
                        const isActive = activeStatut === s.id_event_contact_type
                        const color = s.event_contact_type_color ?? '#94a3b8'
                        return (
                            <button
                                key={s.id_event_contact_type}
                                onClick={() => setActiveStatut(isActive ? null : s.id_event_contact_type)}
                                className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border transition-colors"
                                style={isActive
                                    ? { backgroundColor: color, color: '#fff', borderColor: color }
                                    : { backgroundColor: color + '15', color: color, borderColor: color + '40' }
                                }
                            >
                                {s.libelle}
                            </button>
                        )
                    })}
                </div>
            )}

            {/* List */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center gap-2 py-16 text-sm text-zinc-400">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Chargement…
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex items-center justify-center py-16 text-sm text-zinc-400">
                        Aucun inscrit trouvé
                    </div>
                ) : (
                    <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {filtered.map(group => (
                            <InscritsListItem
                                key={group.id_contact}
                                group={group}
                                idEvent={eventId}
                                scan={checkinMap[group.id_contact] ?? null}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

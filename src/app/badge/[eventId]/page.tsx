'use client'

import { useState, useRef, useEffect, useCallback, Suspense } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Search, CreditCard, X, User, Printer, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { BadgeTokenPayload } from '@/lib/badge-token'

const API_URL = 'https://www.mlg-consulting.com/smart_territory/form/api.php'
const DIR_IMG = '//www.mlg-consulting.com/manager_cc/contacts/img_uploaded/'

// ─── Types ───────────────────────────────────────────────────────────────────

type Contact = {
    id_contact: string
    prenom: string
    nom: string
    societe: string
    fonction_nom?: string
    photo?: string
}

type Partner = { contact: Contact }

type EventData = {
    nom?: string
    precision_date?: string
    event_start?: string
    color_1?: string
    lieu?: { lieu_nom?: string; lieu_ville?: string }
}

// ─── Badge A4 pliable en 4 ───────────────────────────────────────────────────
//
//  Disposition sur la feuille A4 portrait (210mm × 297mm) :
//
//  ┌──────────────┬──────────────┐  ← pli horizontal (148.5mm)
//  │  TL          │  TR          │
//  │  (intérieur  │  FACE        │  148.5mm
//  │  programme)  │  VISIBLE     │
//  ├──────────────┼──────────────┤
//  │  BL (rot180) │  BR (rot180) │
//  │  (intérieur  │  (dos du     │  148.5mm
//  │  instructions│   badge)     │
//  └──────────────┴──────────────┘
//        105mm         105mm
//                 ↑ pli vertical
//
//  Pliage : rabattre bas sur haut → plier droite derrière gauche
//  → TR devient la face visible dans la pochette A6

function BadgeA4({ c, event, eventId, accent }: {
    c: Contact
    event: EventData | null
    eventId: string
    accent: string
}) {
    const fullName = `${c.prenom} ${c.nom}`.toUpperCase()
    const society = (c.societe || '').toUpperCase()
    const jobTitle = c.fonction_nom || ''
    const eventName = event?.nom || `Événement #${eventId}`
    const eventDate = event?.precision_date ||
        (event?.event_start
            ? new Date(event.event_start).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
            : '')
    const venue = [event?.lieu?.lieu_nom, event?.lieu?.lieu_ville].filter(Boolean).join(' — ')

    const qrCheckin = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(`${eventId}:${c.id_contact}`)}`
    const qrVcard = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(
        `BEGIN:VCARD\nVERSION:3.0\nN:${c.nom};${c.prenom}\nFN:${c.prenom} ${c.nom}\nORG:${c.societe || ''}\nTITLE:${c.fonction_nom || ''}\nEND:VCARD`
    )}`

    const zone: React.CSSProperties = {
        boxSizing: 'border-box',
        overflow: 'hidden',
        position: 'relative',
        width: '105mm',
        height: '148.5mm',
    }

    const headerBand = (): React.CSSProperties => ({
        background: accent,
        color: '#fff',
        textAlign: 'center',
        fontWeight: 900,
        fontSize: '9pt',
        letterSpacing: '1px',
        padding: '2.5mm 4mm',
        textTransform: 'uppercase',
    })

    return (
        <>
            {/* Global print CSS — injected once */}
            <style>{`
                @page { size: A4 portrait; margin: 0; }
                @media print {
                    html, body { margin: 0 !important; padding: 0 !important; background: white !important; }
                    #badge-ui { display: none !important; }
                    #badge-preview-overlay { display: none !important; }
                }
                @media screen {
                    #badge-print-root {
                        position: absolute;
                        left: -99999px;
                        top: 0;
                        width: 210mm;
                    }
                }
            `}</style>

            <div
                id="badge-print-root"
                style={{
                    width: '210mm',
                    height: '297mm',
                    display: 'grid',
                    gridTemplateColumns: '105mm 105mm',
                    gridTemplateRows: '148.5mm 148.5mm',
                    fontFamily: 'Arial, Helvetica, sans-serif',
                    background: '#fff',
                    position: 'relative',
                }}
            >
                {/* ── TL : Intérieur gauche — programme / infos événement ── */}
                <div style={{
                    ...zone,
                    borderRight: '1px dashed #bbb',
                    borderBottom: '1px dashed #bbb',
                    display: 'flex',
                    flexDirection: 'column',
                }}>
                    <div style={headerBand()}>{eventName}</div>
                    <div style={{ flex: 1, padding: '5mm 6mm', display: 'flex', flexDirection: 'column', gap: '3mm', fontSize: '8pt', color: '#333' }}>
                        {eventDate && <div><strong>Date :</strong> {eventDate}</div>}
                        {venue && <div><strong>Lieu :</strong> {venue}</div>}
                        <div style={{ marginTop: '3mm', fontWeight: 'bold', color: accent, textTransform: 'uppercase', fontSize: '7.5pt' }}>
                            Votre programme
                        </div>
                        <div style={{ flex: 1, borderTop: `1px solid ${accent}33`, paddingTop: '3mm', color: '#888', fontSize: '7pt', fontStyle: 'italic', lineHeight: 1.6 }}>
                            Consultez votre programme en vous connectant à votre espace personnel event2one.
                        </div>
                        <div style={{ textAlign: 'center', marginTop: 'auto' }}>
                            <img src={qrCheckin} alt="QR" style={{ width: '22mm', height: '22mm' }} />
                            <div style={{ fontSize: '6pt', color: '#999', marginTop: '1mm' }}>Espace personnel</div>
                        </div>
                    </div>
                    <div style={{ padding: '2mm 6mm', fontSize: '6pt', color: '#ccc', textAlign: 'center', borderTop: '0.5px solid #eee' }}>
                        ✂ plier ici
                    </div>
                </div>

                {/* ── TR : FACE VISIBLE — identité du participant ── */}
                <div style={{
                    ...zone,
                    borderBottom: '1px dashed #bbb',
                    display: 'flex',
                    flexDirection: 'column',
                }}>
                    {/* Event header */}
                    <div style={{ background: accent, color: '#fff', padding: '3.5mm 5mm', textAlign: 'center' }}>
                        <div style={{ fontSize: '8pt', fontWeight: 900, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{eventName}</div>
                        {eventDate && <div style={{ fontSize: '6.5pt', opacity: 0.85, marginTop: '0.5mm' }}>{eventDate}</div>}
                    </div>

                    {/* Photo + identity */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5mm 6mm', gap: '3mm', textAlign: 'center' }}>
                        {c.photo
                            ? <img src={`${DIR_IMG}${c.photo}`} alt="" style={{ width: '24mm', height: '24mm', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${accent}` }} />
                            : (
                                <div style={{ width: '24mm', height: '24mm', borderRadius: '50%', background: `${accent}18`, border: `2px solid ${accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16pt', color: accent, fontWeight: 900 }}>
                                    {c.prenom.charAt(0)}{c.nom.charAt(0)}
                                </div>
                            )
                        }

                        <div style={{ fontSize: '16pt', fontWeight: 900, color: '#111', lineHeight: 1.1, wordBreak: 'break-word' }}>
                            {fullName}
                        </div>
                        {jobTitle && (
                            <div style={{ fontSize: '8pt', color: '#777' }}>{jobTitle}</div>
                        )}
                        {society && (
                            <div style={{ fontSize: '11pt', fontWeight: 700, color: '#333' }}>{society}</div>
                        )}

                        {/* QR checkin */}
                        <img src={qrCheckin} alt="QR" style={{ width: '30mm', height: '30mm', marginTop: '2mm' }} />
                        <div style={{ fontSize: '6.5pt', color: '#999' }}>Scanner pour accéder au profil</div>
                    </div>

                    {/* Statut band */}
                    <div style={{ background: accent, color: '#fff', textAlign: 'center', fontWeight: 900, fontSize: '15pt', padding: '3.5mm', letterSpacing: '2px' }}>
                        PARTICIPANT
                    </div>
                </div>

                {/* ── BL : Intérieur droite — instructions (rot 180°) ── */}
                <div style={{
                    ...zone,
                    borderRight: '1px dashed #bbb',
                    transform: 'rotate(180deg)',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '6mm',
                    gap: '3mm',
                }}>
                    <div style={{ fontWeight: 900, fontSize: '9pt', color: accent, textTransform: 'uppercase' }}>
                        Votre badge d&apos;accès rapide
                    </div>
                    <div style={{ fontSize: '8pt', color: '#333', lineHeight: 1.7, flex: 1 }}>
                        <div>1/ Imprimez votre badge et munissez-vous en pour accéder à l&apos;événement.</div>
                        <br />
                        <div>2/ <strong>Pliez-le en 4</strong> et insérez-le dans le porte-badge distribué à l&apos;entrée.</div>
                        <br />
                        <div>3/ Conservez-le précieusement : il vous sera demandé à chaque entrée.</div>
                        <br />
                        <div style={{ fontWeight: 700 }}>4/ Nous recyclons vos badges ! Merci de les remettre aux hôtesses lors de votre départ.</div>
                        <br />
                        <div style={{ color: '#888', fontSize: '7pt' }}>Le port du badge est obligatoire. Bonne visite !</div>
                    </div>
                    <div style={{ fontSize: '6.5pt', color: '#bbb', borderTop: '0.5px solid #eee', paddingTop: '2mm' }}>
                        Une solution event2one — www.event2one.com
                    </div>
                </div>

                {/* ── BR : Dos du badge — vCard QR (rot 180°) ── */}
                <div style={{
                    ...zone,
                    transform: 'rotate(180deg)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '6mm',
                    gap: '3.5mm',
                    textAlign: 'center',
                }}>
                    <div style={{ background: accent, color: '#fff', padding: '2.5mm 5mm', fontSize: '8pt', fontWeight: 900, borderRadius: '1mm', letterSpacing: '0.5px' }}>
                        PARTAGEZ VOS COORDONNÉES
                    </div>
                    <img src={qrVcard} alt="vCard QR" style={{ width: '32mm', height: '32mm' }} />
                    <div style={{ fontSize: '9pt', fontWeight: 700, color: '#222' }}>{c.prenom} {c.nom}</div>
                    {c.societe && <div style={{ fontSize: '8pt', color: '#555' }}>{c.societe}</div>}
                    {c.fonction_nom && <div style={{ fontSize: '7pt', color: '#888' }}>{c.fonction_nom}</div>}
                    <div style={{ fontSize: '6.5pt', color: '#aaa', marginTop: '2mm' }}>
                        Scannez pour enregistrer le contact
                    </div>
                    <div style={{ fontSize: '6pt', color: '#ccc', marginTop: 'auto' }}>
                        event2one — Professional Event Management
                    </div>
                </div>
            </div>
        </>
    )
}

// ─── Badge preview card (scaled for screen) ──────────────────────────────────

function BadgePreview({ c, event, eventId, accent, onPrint, onClose }: {
    c: Contact
    event: EventData | null
    eventId: string
    accent: string
    onPrint: () => void
    onClose: () => void
}) {
    // A4 at 96dpi = ~794px × 1123px → scale to fit nicely on screen
    const SCALE = 0.46
    const W = 794
    const H = 1123

    return (
        <div
            id="badge-preview-overlay"
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', zIndex: 50, display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'auto', padding: '24px 16px 32px' }}
            onClick={onClose}
        >
            <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '640px' }}>
                {/* Toolbar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ color: '#fff', fontWeight: 700, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CreditCard size={18} /> Aperçu — badge A4 pliable en 4
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={onPrint}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
                        >
                            <Printer size={14} /> Imprimer / PDF
                        </button>
                        <button onClick={onClose} style={{ padding: '7px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#aaa' }}>
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Scaled badge */}
                <div style={{ width: `${W * SCALE}px`, height: `${H * SCALE}px`, overflow: 'hidden', margin: '0 auto', boxShadow: '0 8px 40px rgba(0,0,0,0.5)', borderRadius: '4px' }}>
                    <div style={{ width: `${W}px`, height: `${H}px`, transform: `scale(${SCALE})`, transformOrigin: 'top left', pointerEvents: 'none' }}>
                        <BadgeContent c={c} event={event} eventId={eventId} accent={accent} />
                    </div>
                </div>

                <p style={{ color: '#666', fontSize: '11px', textAlign: 'center', marginTop: '10px' }}>
                    Imprimer → A4 portrait · marges : aucune · adapter à la page
                </p>
            </div>
        </div>
    )
}

// ─── Badge content WITHOUT the print CSS (used only for preview) ─────────────

function BadgeContent({ c, event, eventId, accent }: {
    c: Contact
    event: EventData | null
    eventId: string
    accent: string
}) {
    const fullName = `${c.prenom} ${c.nom}`.toUpperCase()
    const society = (c.societe || '').toUpperCase()
    const jobTitle = c.fonction_nom || ''
    const eventName = event?.nom || `Événement #${eventId}`
    const eventDate = event?.precision_date ||
        (event?.event_start
            ? new Date(event.event_start).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
            : '')
    const venue = [event?.lieu?.lieu_nom, event?.lieu?.lieu_ville].filter(Boolean).join(' — ')

    const qrCheckin = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(`${eventId}:${c.id_contact}`)}`
    const qrVcard = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(
        `BEGIN:VCARD\nVERSION:3.0\nN:${c.nom};${c.prenom}\nFN:${c.prenom} ${c.nom}\nORG:${c.societe || ''}\nTITLE:${c.fonction_nom || ''}\nEND:VCARD`
    )}`

    const zone: React.CSSProperties = {
        boxSizing: 'border-box',
        overflow: 'hidden',
        position: 'relative',
        width: '105mm',
        height: '148.5mm',
    }

    return (
        <div style={{
            width: '210mm',
            height: '297mm',
            display: 'grid',
            gridTemplateColumns: '105mm 105mm',
            gridTemplateRows: '148.5mm 148.5mm',
            fontFamily: 'Arial, Helvetica, sans-serif',
            background: '#fff',
        }}>
            {/* TL */}
            <div style={{ ...zone, borderRight: '1px dashed #bbb', borderBottom: '1px dashed #bbb', display: 'flex', flexDirection: 'column' }}>
                <div style={{ background: accent, color: '#fff', textAlign: 'center', fontWeight: 900, fontSize: '9pt', letterSpacing: '1px', padding: '2.5mm 4mm', textTransform: 'uppercase' }}>
                    {eventName}
                </div>
                <div style={{ flex: 1, padding: '5mm 6mm', display: 'flex', flexDirection: 'column', gap: '3mm', fontSize: '8pt', color: '#333' }}>
                    {eventDate && <div><strong>Date :</strong> {eventDate}</div>}
                    {venue && <div><strong>Lieu :</strong> {venue}</div>}
                    <div style={{ fontWeight: 'bold', color: accent, textTransform: 'uppercase', fontSize: '7.5pt' }}>Votre programme</div>
                    <div style={{ flex: 1, borderTop: `1px solid ${accent}33`, paddingTop: '3mm', color: '#888', fontSize: '7pt', fontStyle: 'italic', lineHeight: 1.6 }}>
                        Consultez votre programme sur votre espace personnel event2one.
                    </div>
                    <div style={{ textAlign: 'center', marginTop: 'auto' }}>
                        <img src={qrCheckin} alt="QR" style={{ width: '22mm', height: '22mm' }} />
                        <div style={{ fontSize: '6pt', color: '#999', marginTop: '1mm' }}>Espace personnel</div>
                    </div>
                </div>
                <div style={{ padding: '2mm 6mm', fontSize: '6pt', color: '#ccc', textAlign: 'center', borderTop: '0.5px solid #eee' }}>✂ plier ici</div>
            </div>

            {/* TR — FACE VISIBLE */}
            <div style={{ ...zone, borderBottom: '1px dashed #bbb', display: 'flex', flexDirection: 'column' }}>
                <div style={{ background: accent, color: '#fff', padding: '3.5mm 5mm', textAlign: 'center' }}>
                    <div style={{ fontSize: '8pt', fontWeight: 900, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{eventName}</div>
                    {eventDate && <div style={{ fontSize: '6.5pt', opacity: 0.85, marginTop: '0.5mm' }}>{eventDate}</div>}
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5mm 6mm', gap: '3mm', textAlign: 'center' }}>
                    {c.photo
                        ? <img src={`${DIR_IMG}${c.photo}`} alt="" style={{ width: '24mm', height: '24mm', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${accent}` }} />
                        : <div style={{ width: '24mm', height: '24mm', borderRadius: '50%', background: `${accent}18`, border: `2px solid ${accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16pt', color: accent, fontWeight: 900 }}>
                            {c.prenom.charAt(0)}{c.nom.charAt(0)}
                        </div>
                    }
                    <div style={{ fontSize: '16pt', fontWeight: 900, color: '#111', lineHeight: 1.1, wordBreak: 'break-word' }}>{fullName}</div>
                    {jobTitle && <div style={{ fontSize: '8pt', color: '#777' }}>{jobTitle}</div>}
                    {society && <div style={{ fontSize: '11pt', fontWeight: 700, color: '#333' }}>{society}</div>}
                    <img src={qrCheckin} alt="QR" style={{ width: '30mm', height: '30mm', marginTop: '2mm' }} />
                    <div style={{ fontSize: '6.5pt', color: '#999' }}>Scanner pour accéder au profil</div>
                </div>
                <div style={{ background: accent, color: '#fff', textAlign: 'center', fontWeight: 900, fontSize: '15pt', padding: '3.5mm', letterSpacing: '2px' }}>
                    PARTICIPANT
                </div>
            </div>

            {/* BL — instructions rot 180° */}
            <div style={{ ...zone, borderRight: '1px dashed #bbb', transform: 'rotate(180deg)', display: 'flex', flexDirection: 'column', padding: '6mm', gap: '3mm' }}>
                <div style={{ fontWeight: 900, fontSize: '9pt', color: accent, textTransform: 'uppercase' }}>Votre badge d&apos;accès rapide</div>
                <div style={{ fontSize: '8pt', color: '#333', lineHeight: 1.7, flex: 1 }}>
                    <div>1/ Imprimez votre badge et munissez-vous en pour accéder à l&apos;événement.</div>
                    <br /><div>2/ <strong>Pliez-le en 4</strong> et insérez-le dans le porte-badge.</div>
                    <br /><div>3/ Conservez-le précieusement : il vous sera demandé à chaque entrée.</div>
                    <br /><div style={{ fontWeight: 700 }}>4/ Nous recyclons vos badges !</div>
                    <br /><div style={{ color: '#888', fontSize: '7pt' }}>Le port du badge est obligatoire. Bonne visite !</div>
                </div>
                <div style={{ fontSize: '6.5pt', color: '#bbb', borderTop: '0.5px solid #eee', paddingTop: '2mm' }}>
                    Une solution event2one — www.event2one.com
                </div>
            </div>

            {/* BR — dos du badge, vCard QR, rot 180° */}
            <div style={{ ...zone, transform: 'rotate(180deg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6mm', gap: '3.5mm', textAlign: 'center' }}>
                <div style={{ background: accent, color: '#fff', padding: '2.5mm 5mm', fontSize: '8pt', fontWeight: 900, borderRadius: '1mm' }}>
                    PARTAGEZ VOS COORDONNÉES
                </div>
                <img src={qrVcard} alt="vCard" style={{ width: '32mm', height: '32mm' }} />
                <div style={{ fontSize: '9pt', fontWeight: 700, color: '#222' }}>{c.prenom} {c.nom}</div>
                {c.societe && <div style={{ fontSize: '8pt', color: '#555' }}>{c.societe}</div>}
                {c.fonction_nom && <div style={{ fontSize: '7pt', color: '#888' }}>{c.fonction_nom}</div>}
                <div style={{ fontSize: '6.5pt', color: '#aaa', marginTop: '2mm' }}>Scannez pour enregistrer le contact</div>
            </div>
        </div>
    )
}

// ─── Main page ────────────────────────────────────────────────────────────────

function EBadgeGeneratorInner() {
    const { eventId } = useParams<{ eventId: string }>()
    const searchParams = useSearchParams()
    const { resolvedTheme } = useTheme()
    const dark = resolvedTheme === 'dark'

    // URL param chiffré — pour accès direct depuis une autre page
    // Usage: /badge/[eventId]?t=<token_chiffré>
    // Générer le token via POST /api/badge/token
    const urlToken = searchParams.get('t')

    const [query, setQuery]     = useState('')
    const [results, setResults] = useState<Partner[]>([])
    const [loading, setLoading] = useState(false)
    const [selected, setSelected] = useState<Partner | null>(null)
    const [event, setEvent]     = useState<EventData | null>(null)
    const [accentColor, setAccentColor] = useState('#2563eb')
    const [autoprintEnabled, setAutoprintEnabled] = useState(false)
    const [tokenError, setTokenError] = useState<string | null>(null)
    const [tokenLoading, setTokenLoading] = useState(false)
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const printedRef  = useRef(false)

    const loadEvent = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}?action=getEvents&id_event=${eventId}`)
            const data = await res.json()
            const ev = Array.isArray(data) ? data[0] : data
            if (ev) {
                setEvent(ev)
                if (ev.color_1) setAccentColor(`#${ev.color_1.replace('#', '')}`)
            }
        } catch { /* silent */ }
    }, [eventId])

    // Si token chiffré dans l'URL → déchiffrer et auto-sélectionner le contact
    useEffect(() => {
        if (!urlToken) return
        setTokenLoading(true)
        setTokenError(null)
        loadEvent()
        fetch(`/saas/api/badge/token?t=${encodeURIComponent(urlToken)}`)
            .then(r => r.json())
            .then((data: BadgeTokenPayload & { error?: string }) => {
                if (data.error) {
                    setTokenError(data.error)
                    setTokenLoading(false)
                    return
                }
                if (data.autoprint) setAutoprintEnabled(true)
                // Toujours fetch le contact depuis l'API — le token ne contient pas de PII
                const params = encodeURIComponent(
                    `AND cf.id_event=${data.id_event} AND c.id_contact=${data.id_contact}`
                )
                fetch(`${API_URL}?action=getPartenairesLight&params=${params}`)
                    .then(r => r.json())
                    .then((contacts: Partner[]) => {
                        if (Array.isArray(contacts) && contacts[0]) setSelected(contacts[0])
                        else setTokenError('Contact introuvable pour cet événement')
                    })
                    .catch(() => setTokenError('Erreur lors du chargement du contact'))
                    .finally(() => setTokenLoading(false))
            })
            .catch(() => {
                setTokenError('Erreur de déchiffrement du token')
                setTokenLoading(false)
            })
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [urlToken])

    // Auto-print une fois le badge sélectionné + événement chargé
    useEffect(() => {
        if (autoprintEnabled && selected && !printedRef.current) {
            printedRef.current = true
            setTimeout(() => window.print(), 600)
        }
    }, [autoprintEnabled, selected])

    const search = async (q: string) => {
        if (!q || q.length < 2) { setResults([]); return }
        setLoading(true)
        if (!event) loadEvent()
        try {
            const params = `AND cf.id_event=${eventId} AND (c.nom LIKE '%${q}%' OR c.prenom LIKE '%${q}%')`
            const res = await fetch(`${API_URL}?action=getPartenairesLight&params=${encodeURIComponent(params)}`)
            const data = await res.json()
            setResults(Array.isArray(data) ? data : [])
        } catch { setResults([]) }
        setLoading(false)
    }

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setQuery(val)
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => search(val), 350)
    }

    const bg = dark ? '#0a0a0a' : '#f5f5f5'
    const card = dark ? '#1a1a1a' : '#fff'
    const border = dark ? '#333' : '#e5e5e5'
    const text = dark ? '#fff' : '#111'
    const muted = dark ? '#888' : '#666'

    return (
        <>
            {/* ── Screen UI (hidden on print) ── */}
            <div id="badge-ui" style={{ minHeight: '100vh', padding: '24px', background: bg, color: text }}>
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Link href={`/go/${eventId}`} style={{ color: muted, textDecoration: 'none', display: 'flex' }}>
                                <ArrowLeft size={20} />
                            </Link>
                            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <CreditCard size={24} /> Générateur de badge e-badge
                            </h1>
                        </div>
                        {selected && (
                            <button
                                onClick={() => window.print()}
                                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px', background: accentColor, color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 700 }}
                            >
                                <Printer size={15} /> Imprimer ce badge
                            </button>
                        )}
                    </div>

                    {/* Token loading / error state */}
                    {urlToken && tokenLoading && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '20px 0', color: muted, fontSize: '14px' }}>
                            <svg style={{ animation: 'spin 1s linear infinite', width: 20, height: 20 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
                            </svg>
                            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                            Chargement du badge…
                        </div>
                    )}
                    {urlToken && tokenError && (
                        <div style={{ padding: '14px 18px', borderRadius: '12px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '13px' }}>
                            ⚠ {tokenError}
                        </div>
                    )}

                    {/* Search */}
                    {!urlToken && (
                        <>
                            <div style={{ position: 'relative', maxWidth: '480px', marginBottom: '24px' }}>
                                <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} size={17} />
                                <input
                                    type="text"
                                    value={query}
                                    onChange={handleInput}
                                    placeholder="Rechercher par nom ou prénom…"
                                    style={{ width: '100%', paddingLeft: '40px', paddingRight: '14px', paddingTop: '10px', paddingBottom: '10px', borderRadius: '12px', border: `1px solid ${border}`, background: card, color: text, fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                                />
                            </div>

                            {loading && <p style={{ color: muted, fontSize: '13px' }}>Recherche…</p>}
                            {!loading && query.length >= 2 && results.length === 0 && (
                                <p style={{ color: muted, fontSize: '13px' }}>Aucun résultat pour « {query} »</p>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' }}>
                                {results.map(p => {
                                    const c = p.contact
                                    return (
                                        <button
                                            key={c.id_contact}
                                            onClick={() => { setSelected(p); if (!event) loadEvent() }}
                                            style={{ textAlign: 'left', padding: '14px', borderRadius: '14px', border: `1px solid ${border}`, background: card, cursor: 'pointer', transition: 'border-color .2s' }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                {c.photo
                                                    ? <img src={`${DIR_IMG}${c.photo}`} alt="" style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }} />
                                                    : <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <User size={18} style={{ color: '#3b82f6' }} />
                                                    </div>
                                                }
                                                <div>
                                                    <div style={{ fontWeight: 700, fontSize: '14px' }}>{c.prenom} {c.nom}</div>
                                                    <div style={{ fontSize: '12px', color: muted }}>{c.societe}</div>
                                                </div>
                                            </div>
                                            <div style={{ marginTop: '10px', fontSize: '12px', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <CreditCard size={12} /> Générer le badge
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        </>
                    )}

                    {/* Direct mode: show selected contact info */}
                    {urlToken && selected && (
                        <div style={{ padding: '16px', borderRadius: '14px', border: `1px solid ${border}`, background: card, display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
                            {selected.contact.photo
                                ? <img src={`${DIR_IMG}${selected.contact.photo}`} alt="" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                                : <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <User size={20} style={{ color: '#3b82f6' }} />
                                </div>
                            }
                            <div>
                                <div style={{ fontWeight: 700 }}>{selected.contact.prenom} {selected.contact.nom}</div>
                                <div style={{ fontSize: '13px', color: muted }}>{selected.contact.societe}</div>
                            </div>
                        </div>
                    )}

                    {/* Instructions */}
                    {selected && (
                        <div style={{ marginTop: '20px', padding: '14px 18px', borderRadius: '12px', background: dark ? '#1e3a5f' : '#eff6ff', border: `1px solid ${dark ? '#2d5a8e' : '#bfdbfe'}`, fontSize: '13px', color: dark ? '#93c5fd' : '#1d4ed8' }}>
                            <strong>Impression :</strong> A4 portrait · Marges : <strong>Aucune</strong> · Mise à l&apos;échelle : <strong>Adapter à la page</strong><br />
                            Plier le bas sur le haut, puis la droite derrière la gauche → la face visible TR est le badge.
                        </div>
                    )}
                </div>
            </div>

            {/* ── Badge preview (screen only, over the UI) ── */}
            {selected && (
                <BadgePreview
                    c={selected.contact}
                    event={event}
                    eventId={eventId}
                    accent={accentColor}
                    onPrint={() => window.print()}
                    onClose={() => { if (!urlToken) setSelected(null) }}
                />
            )}

            {/* ── Print-only badge (always in DOM when selected, hidden on screen) ── */}
            {selected && (
                <BadgeA4
                    c={selected.contact}
                    event={event}
                    eventId={eventId}
                    accent={accentColor}
                />
            )}

        </>
    )
}

export default function EBadgeGenerator() {
    return (
        <Suspense fallback={null}>
            <EBadgeGeneratorInner />
        </Suspense>
    )
}

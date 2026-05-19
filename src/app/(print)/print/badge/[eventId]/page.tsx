'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { EVENT_CONFIG } from '@/config/events'

const API_URL = 'https://www.mlg-consulting.com/smart_territory/form/api.php'
const DIR_IMG = '//www.mlg-consulting.com/manager_cc/contacts/img_uploaded/'

type Contact = {
    id_contact: string
    prenom: string
    nom: string
    societe: string
    fonction_nom?: string
    photo?: string
    email?: string
    tel?: string
}

type EventData = {
    nom?: string
    precision_date?: string
    event_start?: string
    color_1?: string
    lieu?: { lieu_nom?: string; lieu_ville?: string }
}

export default function PrintBadgePage() {
    const params = useParams()
    const searchParams = useSearchParams()
    const eventId = params?.eventId as string
    const urlToken = searchParams?.get('t')

    const [contact, setContact] = useState<Contact | null>(null)
    const [event, setEvent] = useState<EventData | null>(null)
    const [qrData, setQrData] = useState<string | null>(null)
    const [accent, setAccent] = useState('#2563eb')
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!urlToken) { setError('Token manquant'); return }

        // Déchiffrer le token
        fetch(`/saas/api/badge/token?t=${encodeURIComponent(urlToken)}`)
            .then(r => r.json())
            .then(async (data) => {
                if (data.error) { setError(data.error); return }
                if (data.qrData) setQrData(data.qrData)

                // Charger contact + event en parallèle
                const [partRes, evRes] = await Promise.all([
                    fetch(`${API_URL}?action=getPartenairesLight&params=${encodeURIComponent(`AND cf.id_event=${data.id_event} AND c.id_contact=${data.id_contact}`)}`),
                    fetch(`${API_URL}?action=getEvents&id_event=${data.id_event}`),
                ])
                const parts = await partRes.json()
                const events = await evRes.json()

                if (Array.isArray(parts) && parts[0]) setContact(parts[0].contact)
                else { setError('Contact introuvable'); return }

                const ev = Array.isArray(events) ? events[0] : events
                if (ev) {
                    setEvent(ev)
                    if (ev.color_1) setAccent(`#${ev.color_1.replace('#', '')}`)
                }
            })
            .catch(() => setError('Erreur de chargement'))
    }, [urlToken])

    // Auto-print une fois tout chargé
    useEffect(() => {
        if (contact && event) {
            const t = setTimeout(() => window.print(), 500)
            return () => clearTimeout(t)
        }
    }, [contact, event])

    if (error) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Arial', color: '#dc2626' }}>
            ⚠ {error}
        </div>
    )

    if (!contact) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Arial', color: '#666', gap: 12 }}>
            <svg style={{ animation: 'spin 1s linear infinite', width: 20, height: 20 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
            </svg>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } } @page { size: A4 portrait; margin: 0; }`}</style>
            Chargement du badge…
        </div>
    )

    const badgeCfg = EVENT_CONFIG[eventId] ?? {}
    return <BadgeA4 c={contact} event={event} eventId={eventId} accent={accent} qrData={qrData ?? undefined} headerImageUrl={badgeCfg.headerImageUrl} footerImageUrl={badgeCfg.footerImageUrl} />
}

function BadgeA4({ c, event, eventId, accent, qrData, headerImageUrl, footerImageUrl }: {
    c: Contact
    event: EventData | null
    eventId: string
    accent: string
    qrData?: string
    headerImageUrl?: string
    footerImageUrl?: string
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

    const checkinData = qrData || `${eventId}:${c.id_contact}`
    const qrCheckin = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(checkinData)}`
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
            <style>{`
                @page { size: A4 portrait; margin: 0; }
                html, body { margin: 0; padding: 0; background: white; }
            `}</style>

            <div style={{
                width: '210mm',
                height: '297mm',
                display: 'grid',
                gridTemplateColumns: '105mm 105mm',
                gridTemplateRows: '148.5mm 148.5mm',
                fontFamily: 'Arial, Helvetica, sans-serif',
                background: '#fff',
            }}>
                {/* TL — programme */}
                <div style={{ ...zone, borderRight: '1px dashed #bbb', borderBottom: '1px dashed #bbb', display: 'flex', flexDirection: 'column' }}>
                    <div style={headerBand()}>{eventName}</div>
                    <div style={{ flex: 1, padding: '5mm 6mm', display: 'flex', flexDirection: 'column', gap: '3mm', fontSize: '8pt', color: '#333' }}>
                        {eventDate && <div><strong>Date :</strong> {eventDate}</div>}
                        {venue && <div><strong>Lieu :</strong> {venue}</div>}
                        <div style={{ fontWeight: 'bold', color: accent, textTransform: 'uppercase', fontSize: '7.5pt' }}>Votre programme</div>
                        <div style={{ flex: 1, borderTop: `1px solid ${accent}33`, paddingTop: '3mm', color: '#888', fontSize: '7pt', fontStyle: 'italic', lineHeight: 1.6 }}>
                            Consultez votre programme sur votre espace personnel event2one.
                        </div>
                        <div style={{ textAlign: 'center', marginTop: 'auto' }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={qrCheckin} alt="QR" style={{ width: '22mm', height: '22mm' }} />
                            <div style={{ fontSize: '6pt', color: '#999', marginTop: '1mm' }}>Espace personnel</div>
                        </div>
                    </div>
                    <div style={{ padding: '2mm 6mm', fontSize: '6pt', color: '#ccc', textAlign: 'center', borderTop: '0.5px solid #eee' }}>✂ plier ici</div>
                </div>

                {/* TR — FACE VISIBLE */}
                <div style={{ ...zone, borderBottom: '1px dashed #bbb', display: 'flex', flexDirection: 'column' }}>
                    {headerImageUrl
                        ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={headerImageUrl} alt="" style={{ width: '105mm', display: 'block' }} />
                        : <div style={{ background: accent, color: '#fff', padding: '3.5mm 5mm', textAlign: 'center' }}>
                            <div style={{ fontSize: '8pt', fontWeight: 900, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{eventName}</div>
                            {eventDate && <div style={{ fontSize: '6.5pt', opacity: 0.85, marginTop: '0.5mm' }}>{eventDate}</div>}
                        </div>
                    }
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5mm 6mm', gap: '3mm', textAlign: 'center' }}>
                        {c.photo
                            ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={`${DIR_IMG}${c.photo}`} alt="" style={{ width: '24mm', height: '24mm', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${accent}` }} />
                            : <div style={{ width: '24mm', height: '24mm', borderRadius: '50%', background: `${accent}18`, border: `2px solid ${accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16pt', color: accent, fontWeight: 900 }}>
                                {c.prenom.charAt(0)}{c.nom.charAt(0)}
                            </div>
                        }
                        <div style={{ fontSize: '16pt', fontWeight: 900, color: '#111', lineHeight: 1.1, wordBreak: 'break-word' }}>{fullName}</div>
                        {jobTitle && <div style={{ fontSize: '8pt', color: '#777' }}>{jobTitle}</div>}
                        {society && <div style={{ fontSize: '11pt', fontWeight: 700, color: '#333' }}>{society}</div>}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={qrCheckin} alt="QR" style={{ width: '30mm', height: '30mm', marginTop: '2mm' }} />
                        <div style={{ fontSize: '6.5pt', color: '#999' }}>Scanner pour accéder au profil</div>
                    </div>
                    {footerImageUrl
                        ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={footerImageUrl} alt="" style={{ width: '105mm', display: 'block' }} />
                        : <div style={{ background: accent, color: '#fff', textAlign: 'center', fontWeight: 900, fontSize: '15pt', padding: '3.5mm', letterSpacing: '2px' }}>
                            PARTICIPANT
                        </div>
                    }
                </div>

                {/* BL — instructions (rot 180°) */}
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

                {/* BR — dos vCard (rot 180°) */}
                <div style={{ ...zone, transform: 'rotate(180deg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6mm', gap: '3.5mm', textAlign: 'center' }}>
                    <div style={{ background: accent, color: '#fff', padding: '2.5mm 5mm', fontSize: '8pt', fontWeight: 900, borderRadius: '1mm' }}>
                        PARTAGEZ VOS COORDONNÉES
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qrVcard} alt="vCard" style={{ width: '32mm', height: '32mm' }} />
                    <div style={{ fontSize: '9pt', fontWeight: 700, color: '#222' }}>{c.prenom} {c.nom}</div>
                    {c.societe && <div style={{ fontSize: '8pt', color: '#555' }}>{c.societe}</div>}
                    {c.fonction_nom && <div style={{ fontSize: '7pt', color: '#888' }}>{c.fonction_nom}</div>}
                    <div style={{ fontSize: '6.5pt', color: '#aaa', marginTop: '2mm' }}>Scannez pour enregistrer le contact</div>
                    <div style={{ fontSize: '6pt', color: '#ccc', marginTop: 'auto' }}>event2one — Professional Event Management</div>
                </div>
            </div>
        </>
    )
}

'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { EVENT_CONFIG } from '@/config/events'

type Stats = {
    totalInscriptions: number
    todayInscriptions: number
    totalScans: number
    todayScans: number
    uniqueCheckinsAll: number
    uniqueCheckinsToday: number
    presenceRate: number
    checkinsByHour: { hour: string; scans: number; uniques: number }[]
    checkinsByPoint: { name: string; value: number }[]
    generatedAt: string
}

export default function StatsReportPage() {
    const { eventId } = useParams<{ eventId: string }>()
    const cfg = EVENT_CONFIG[eventId] ?? {}
    const eventName = cfg.email?.eventName ?? `Événement ${eventId}`

    const [stats, setStats] = useState<Stats | null>(null)
    const [error, setError] = useState('')

    useEffect(() => {
        fetch(`/saas/api/events/${eventId}/stats`)
            .then(res => res.json())
            .then(data => {
                if (data.error) throw new Error(data.error)
                setStats(data)
            })
            .catch(e => setError(e instanceof Error ? e.message : 'Erreur de chargement'))
    }, [eventId])

    // Auto-impression une fois les données chargées
    useEffect(() => {
        if (stats) {
            const t = setTimeout(() => window.print(), 500)
            return () => clearTimeout(t)
        }
    }, [stats])

    const notPresent = stats ? Math.max(stats.totalInscriptions - stats.uniqueCheckinsToday, 0) : 0
    const generated = stats ? new Date(stats.generatedAt) : null

    if (error) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Arial', color: '#dc2626' }}>
            ⚠ {error}
        </div>
    )

    if (!stats) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Arial', color: '#666' }}>
            Chargement du rapport…
        </div>
    )

    return (
        <div style={{ fontFamily: 'Arial, sans-serif', color: '#111', background: '#fff', minHeight: '100vh', maxWidth: '190mm', margin: '0 auto', padding: '10mm' }}>
            <style>{`
                @page { size: A4 portrait; margin: 12mm; }
                @media print { .no-print { display: none } }
                h1, h2, p, span, label, td, th { color: #111 !important; }
                table { border-collapse: collapse; width: 100%; }
                th, td { border: 1px solid #ddd; padding: 6px 10px; font-size: 12px; text-align: left; }
                th { background: #f1f5f9; font-weight: 600; }
                td.num, th.num { text-align: right; }
            `}</style>

            <button
                onClick={() => window.print()}
                className="no-print"
                style={{ marginBottom: 16, padding: '8px 16px', borderRadius: 8, border: '1px solid #ccc', background: '#f8fafc', cursor: 'pointer', fontSize: 14 }}
            >
                Imprimer / Enregistrer en PDF
            </button>

            <div style={{ borderBottom: '3px solid #2dd4bf', paddingBottom: 12, marginBottom: 20 }}>
                <div style={{ fontSize: 11, color: '#0d9488', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>event2one — Rapport d&apos;affluence</div>
                <h1 style={{ fontSize: 24, margin: '4px 0 0' }}>{eventName}</h1>
                {generated && (
                    <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                        Généré le {generated.toLocaleDateString('fr-FR')} à {generated.toLocaleTimeString('fr-FR')}
                    </div>
                )}
            </div>

            {/* KPI summary */}
            <h2 style={{ fontSize: 15, marginBottom: 8 }}>Indicateurs clés</h2>
            <table style={{ marginBottom: 20 }}>
                <tbody>
                    <tr><td>Inscriptions totales (personnes uniques)</td><td className="num">{stats.totalInscriptions.toLocaleString('fr-FR')}</td></tr>
                    <tr><td>Nouvelles inscriptions aujourd&apos;hui</td><td className="num">{stats.todayInscriptions.toLocaleString('fr-FR')}</td></tr>
                    <tr><td>Présents aujourd&apos;hui (personnes uniques badgées)</td><td className="num">{stats.uniqueCheckinsToday.toLocaleString('fr-FR')}</td></tr>
                    <tr><td>Inscrits non encore badgés aujourd&apos;hui</td><td className="num">{notPresent.toLocaleString('fr-FR')}</td></tr>
                    <tr><td>Taux de présence (badgés / inscrits)</td><td className="num">{stats.presenceRate}%</td></tr>
                    <tr><td>Scans totaux aujourd&apos;hui (tous points de contrôle)</td><td className="num">{stats.todayScans.toLocaleString('fr-FR')}</td></tr>
                    <tr><td>Contacts uniques badgés depuis le début de l&apos;événement</td><td className="num">{stats.uniqueCheckinsAll.toLocaleString('fr-FR')}</td></tr>
                </tbody>
            </table>

            {/* Hourly breakdown */}
            <h2 style={{ fontSize: 15, marginBottom: 8 }}>Arrivées par heure (aujourd&apos;hui)</h2>
            <p style={{ fontSize: 12, color: '#555', marginTop: 0, marginBottom: 8 }}>
                <strong>Personnes (1er scan)</strong> : nombre de personnes différentes dont c&apos;est le premier badgeage de la journée sur cette tranche horaire (nouvelles arrivées).{' '}
                <strong>Scans totaux</strong> : nombre total de badgeages enregistrés sur cette heure, y compris les repassages d&apos;une même personne sur un autre point de contrôle.
            </p>
            <table style={{ marginBottom: 20 }}>
                <thead>
                    <tr><th>Heure</th><th className="num">Personnes (1er scan)</th><th className="num">Scans totaux</th></tr>
                </thead>
                <tbody>
                    {stats.checkinsByHour.map(row => (
                        <tr key={row.hour}>
                            <td>{row.hour}</td>
                            <td className="num">{row.uniques.toLocaleString('fr-FR')}</td>
                            <td className="num">{row.scans.toLocaleString('fr-FR')}</td>
                        </tr>
                    ))}
                    <tr style={{ fontWeight: 700 }}>
                        <td>Total</td>
                        <td className="num">{stats.uniqueCheckinsToday.toLocaleString('fr-FR')}</td>
                        <td className="num">{stats.todayScans.toLocaleString('fr-FR')}</td>
                    </tr>
                </tbody>
            </table>

            {/* By checkpoint */}
            <h2 style={{ fontSize: 15, marginBottom: 8 }}>Répartition par point de contrôle (aujourd&apos;hui)</h2>
            <table>
                <thead>
                    <tr><th>Point de contrôle</th><th className="num">Scans</th></tr>
                </thead>
                <tbody>
                    {stats.checkinsByPoint.map(row => (
                        <tr key={row.name}>
                            <td>{row.name}</td>
                            <td className="num">{row.value.toLocaleString('fr-FR')}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div style={{ marginTop: 24, fontSize: 11, color: '#999', textAlign: 'center' }}>
                Rapport généré automatiquement par la plateforme event2one
            </div>
        </div>
    )
}

/**
 * GET /api/events/[eventId]/stats
 * Stats temps réel : inscriptions (total + du jour) et check-ins (total + uniques du jour),
 * + répartition horaire des check-ins et inscriptions du jour pour les graphiques.
 */

import { NextRequest, NextResponse } from 'next/server'
import { API_URL } from '@/utils/api'

const CHECKIN_API_URL = 'https://www.mlg-consulting.com/smart_territory/form/checkin_api.php'

type Registration = { id_contact: string; date_creation?: string; cf_etat?: string | null }
type CheckinRecord = { id_contact: string; scanned_at?: string; scan_point?: string }

function hourOf(datetime: string): number | null {
    const m = /\d{4}-\d{2}-\d{2} (\d{2}):/.exec(datetime)
    return m ? parseInt(m[1], 10) : null
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
    const { eventId } = await params
    const today = new Date().toLocaleDateString('fr-CA') // YYYY-MM-DD

    try {
        const [registrationsRes, checkinsRes] = await Promise.all([
            fetch(`${API_URL}?action=getPartenairesLight&params=${encodeURIComponent(`AND cf.id_event=${eventId}`)}&exclude_fields=event,conf_event,photos,presta`),
            fetch(`${CHECKIN_API_URL}?action=getCheckinList&id_event=${eventId}`),
        ])

        const registrations: Registration[] = await registrationsRes.json()
        const checkins: CheckinRecord[] = await checkinsRes.json()

        const regArr = Array.isArray(registrations) ? registrations : []
        const checkinArr = Array.isArray(checkins) ? checkins : []

        // getPartenairesLight renvoie une ligne par rôle/option (un contact peut avoir
        // plusieurs lignes "conferenciers" pour le même événement) : on déduplique par
        // id_contact pour obtenir le nombre de personnes réellement inscrites, en
        // ignorant celles dont toutes les lignes sont annulées.
        const regByContact = new Map<string, string | undefined>() // id_contact -> earliest date_creation
        for (const r of regArr) {
            if (r.cf_etat === 'inscription_annulee_par_le_visiteur') continue
            const existing = regByContact.get(r.id_contact)
            if (existing === undefined || (r.date_creation ?? '') < existing) {
                regByContact.set(r.id_contact, r.date_creation)
            }
        }
        const todayRegistrations = [...regByContact.values()].filter(date => (date ?? '').startsWith(today))
        const todayCheckins = checkinArr.filter(c => (c.scanned_at ?? '').startsWith(today))

        const uniqueCheckinsAll = new Set(checkinArr.map(c => c.id_contact)).size

        // Check-ins uniques par heure (1ère apparition de chaque id_contact)
        const seen = new Set<string>()
        const hourly: Record<number, { scans: number; uniques: number }> = {}
        for (const c of [...todayCheckins].sort((a, b) => (a.scanned_at ?? '').localeCompare(b.scanned_at ?? ''))) {
            const h = hourOf(c.scanned_at ?? '')
            if (h === null) continue
            if (!hourly[h]) hourly[h] = { scans: 0, uniques: 0 }
            hourly[h].scans += 1
            if (!seen.has(c.id_contact)) {
                seen.add(c.id_contact)
                hourly[h].uniques += 1
            }
        }
        const uniqueCheckinsToday = seen.size

        const checkinsByHour = Object.entries(hourly)
            .map(([hour, v]) => ({ hour: `${hour}h`, scans: v.scans, uniques: v.uniques }))
            .sort((a, b) => parseInt(a.hour) - parseInt(b.hour))

        // Répartition par point de scan (normalise casse + corrige le mojibake UTF-8/Latin1)
        const fixEncoding = (s: string) => {
            if (!s.includes('Ã') && !s.includes('Â')) return s
            try {
                const fixed = Buffer.from(s, 'latin1').toString('utf8')
                return fixed.includes('�') ? s : fixed
            } catch {
                return s
            }
        }
        const byPoint: Record<string, { label: string; count: number }> = {}
        for (const c of todayCheckins) {
            const raw = fixEncoding((c.scan_point ?? '').trim()) || 'Inconnu'
            const key = raw.toUpperCase()
            if (!byPoint[key]) byPoint[key] = { label: raw, count: 0 }
            byPoint[key].count += 1
        }
        const checkinsByPoint = Object.values(byPoint)
            .map(({ label, count }) => ({ name: label, value: count }))
            .sort((a, b) => b.value - a.value)

        const totalInscriptions = regByContact.size
        const todayInscriptionsCount = todayRegistrations.length
        const presenceRate = totalInscriptions > 0 ? Math.round((uniqueCheckinsToday / totalInscriptions) * 1000) / 10 : 0

        return NextResponse.json({
            totalInscriptions,
            todayInscriptions: todayInscriptionsCount,
            totalScans: checkinArr.length,
            todayScans: todayCheckins.length,
            uniqueCheckinsAll,
            uniqueCheckinsToday,
            presenceRate,
            checkinsByHour,
            checkinsByPoint,
            generatedAt: new Date().toISOString(),
        })
    } catch (err) {
        return NextResponse.json({ error: err instanceof Error ? err.message : 'Erreur inconnue' }, { status: 500 })
    }
}

'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from 'framer-motion'
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
    PieChart, Pie, Cell, Legend,
} from 'recharts'
import { Users, UserCheck, TrendingUp, Gauge, RefreshCw, Radio } from 'lucide-react'
import { EVENT_CONFIG } from '@/config/events'

const REFRESH_INTERVAL_MS = 30_000

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

// Palette event2one (teal / cyan / blue — cf. marketing site)
const PIE_COLORS = ['#2dd4bf', '#22d3ee', '#60a5fa', '#34d399', '#fbbf24', '#a78bfa', '#f472b6']

function AnimatedNumber({ value, duration = 1.2, className }: { value: number; duration?: number; className?: string }) {
    const mv = useMotionValue(0)
    const rounded = useTransform(mv, latest => Math.round(latest).toLocaleString('fr-FR'))
    const [display, setDisplay] = useState('0')

    useEffect(() => {
        const controls = animate(mv, value, { duration, ease: 'easeOut' })
        const unsub = rounded.on('change', v => setDisplay(v))
        return () => { controls.stop(); unsub() }
    }, [value]) // eslint-disable-line react-hooks/exhaustive-deps

    return <span className={className}>{display}</span>
}

function KpiCard({
    icon, label, value, suffix, accent, delay,
}: {
    icon: React.ReactNode
    label: string
    value: number
    suffix?: string
    accent: string
    delay: number
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay, ease: 'easeOut' }}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-2xl"
        >
            <div
                className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-20 blur-2xl"
                style={{ background: accent }}
            />
            <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${accent}26`, color: accent }}>
                    {icon}
                </div>
                <p className="text-sm font-medium text-white/60! uppercase tracking-wide">{label}</p>
            </div>
            <div className="text-5xl font-extrabold text-white tabular-nums">
                <AnimatedNumber value={value} className="text-white!" />
                {suffix && <span className="text-2xl font-bold text-white/50! ml-1">{suffix}</span>}
            </div>
        </motion.div>
    )
}

export default function OnsiteStatsPage() {
    const { eventId } = useParams<{ eventId: string }>()
    const cfg = EVENT_CONFIG[eventId] ?? {}

    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

    const fetchStats = async () => {
        try {
            const res = await fetch(`/saas/api/events/${eventId}/stats`)
            const data = await res.json()
            if (data.error) throw new Error(data.error)
            setStats(data)
            setLastUpdated(new Date())
            setError('')
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Erreur de chargement')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStats()
        intervalRef.current = setInterval(fetchStats, REFRESH_INTERVAL_MS)
        return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
    }, [eventId]) // eslint-disable-line react-hooks/exhaustive-deps

    const eventName = cfg.email?.eventName ?? `Événement ${eventId}`
    const notPresent = stats ? Math.max(stats.totalInscriptions - stats.uniqueCheckinsToday, 0) : 0

    return (
        <div
            className="min-h-screen text-white relative overflow-hidden"
            style={{
                background: `radial-gradient(circle at 15% 10%, rgba(45,212,191,0.18), transparent 45%),
                             radial-gradient(circle at 85% 90%, rgba(96,165,250,0.18), transparent 45%),
                             linear-gradient(135deg, #020617, #042f2e 50%, #020617)`,
            }}
        >
            {/* Animated background blobs */}
            <motion.div
                className="absolute top-1/4 -left-32 w-96 h-96 rounded-full blur-3xl"
                style={{ background: '#2dd4bf', opacity: 0.18 }}
                animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
                transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
                className="absolute bottom-0 right-0 w-md h-112 rounded-full blur-3xl"
                style={{ background: '#60a5fa', opacity: 0.14 }}
                animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
                transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
            />

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-10 space-y-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-wrap items-end justify-between gap-4"
                >
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <motion.span
                                className="w-2.5 h-2.5 rounded-full bg-emerald-400"
                                animate={{ opacity: [1, 0.3, 1] }}
                                transition={{ duration: 1.6, repeat: Infinity }}
                            />
                            <span className="text-xs font-semibold uppercase tracking-widest text-emerald-300!">En direct</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold leading-tight bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent!">{eventName}</h1>
                        <p className="text-white/50! text-sm mt-1">Tableau de bord — affluence et inscriptions</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/50">
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        {lastUpdated ? `Mis à jour à ${lastUpdated.toLocaleTimeString('fr-FR')}` : 'Chargement…'}
                    </div>
                </motion.div>

                {error && (
                    <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200!">
                        {error}
                    </div>
                )}

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <KpiCard
                        icon={<Users size={20} />}
                        label="Inscriptions totales"
                        value={stats?.totalInscriptions ?? 0}
                        accent="#2dd4bf"
                        delay={0}
                    />
                    <KpiCard
                        icon={<TrendingUp size={20} />}
                        label="Nouvelles inscriptions aujourd'hui"
                        value={stats?.todayInscriptions ?? 0}
                        accent="#22d3ee"
                        delay={0.08}
                    />
                    <KpiCard
                        icon={<UserCheck size={20} />}
                        label="Présents aujourd'hui (check-in unique)"
                        value={stats?.uniqueCheckinsToday ?? 0}
                        accent="#60a5fa"
                        delay={0.16}
                    />
                    <KpiCard
                        icon={<Gauge size={20} />}
                        label="Taux de présence"
                        value={stats?.presenceRate ?? 0}
                        suffix="%"
                        accent="#34d399"
                        delay={0.24}
                    />
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Arrivées par heure */}
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-2xl"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <Radio size={16} className="text-emerald-400!" />
                            <p className="text-sm font-semibold text-white/80!">Arrivées par heure (check-ins uniques)</p>
                        </div>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={stats?.checkinsByHour ?? []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                                <XAxis dataKey="hour" stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ background: '#0f0f23', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff' }}
                                    labelStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="uniques" name="Personnes (1er scan)" fill="#2dd4bf" radius={[6, 6, 0, 0]} animationDuration={900} />
                                <Bar dataKey="scans" name="Scans totaux" fill="#60a5fa" radius={[6, 6, 0, 0]} animationDuration={900} fillOpacity={0.35} />
                            </BarChart>
                        </ResponsiveContainer>
                    </motion.div>

                    {/* Répartition par point de scan */}
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.38 }}
                        className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-2xl"
                    >
                        <p className="text-sm font-semibold text-white/80! mb-4">Répartition par point de contrôle</p>
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={stats?.checkinsByPoint ?? []}
                                    dataKey="value"
                                    nameKey="name"
                                    innerRadius={55}
                                    outerRadius={90}
                                    paddingAngle={2}
                                    animationDuration={900}
                                >
                                    {(stats?.checkinsByPoint ?? []).map((_, i) => (
                                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ background: '#0f0f23', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff' }} />
                                <Legend wrapperStyle={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </motion.div>
                </div>

                {/* Présence summary bar */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.46 }}
                    className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-2xl"
                >
                    <div className="flex items-center justify-between mb-3 text-sm text-white/70!">
                        <span className="text-white/70!">Présents aujourd&apos;hui : <strong><AnimatedNumber value={stats?.uniqueCheckinsToday ?? 0} className="text-cyan-300!" /></strong></span>
                        <span className="text-white/70!">Inscrits non encore badgés : <strong><AnimatedNumber value={notPresent} className="text-white/50!" /></strong></span>
                        <span className="text-white/70!">Total inscrits : <strong><AnimatedNumber value={stats?.totalInscriptions ?? 0} className="text-white!" /></strong></span>
                    </div>
                    <div className="h-4 rounded-full bg-white/10 overflow-hidden">
                        <motion.div
                            className="h-full rounded-full"
                            style={{ background: 'linear-gradient(90deg,#2dd4bf,#22d3ee,#60a5fa)' }}
                            initial={{ width: 0 }}
                            animate={{ width: `${stats?.presenceRate ?? 0}%` }}
                            transition={{ duration: 1.2, ease: 'easeOut' }}
                        />
                    </div>
                </motion.div>

                <AnimatePresence>
                    {stats && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center text-xs text-white/30! pt-2"
                        >
                            {stats.totalScans.toLocaleString('fr-FR')} scans enregistrés au total · {stats.uniqueCheckinsAll.toLocaleString('fr-FR')} contacts uniques badgés depuis le début · actualisation automatique toutes les 30s
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

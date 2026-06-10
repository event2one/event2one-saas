'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { CheckCircle, XCircle, RefreshCw, User, Settings, MapPin, Mail, Hash, WifiOff, CloudOff, Users, Search, X, Check } from 'lucide-react'

const API_URL = 'https://www.mlg-consulting.com/smart_territory/form/api.php'
const CHECKIN_API_URL = 'https://www.mlg-consulting.com/smart_territory/form/checkin_api.php'
const DIR_IMG = '//www.mlg-consulting.com/manager_cc/contacts/img_uploaded/'
const STORAGE_KEY = 'go_identifye_config'
const OFFLINE_QUEUE_KEY = 'checkin_offline_queue'
const CONTACT_CACHE_KEY = 'checkin_contact_cache'

type Phase = 'config' | 'scanning' | 'success' | 'error' | 'manual'
type SaveStatus = 'pending' | 'saved' | 'failed' | 'queued'

type Config = {
    scan_identifier: string
    scanner_email: string
    scan_point: string
}

type Contact = {
    id_contact: string
    prenom: string
    nom: string
    societe?: string
    photo?: string
}

type Partner = {
    contact: Contact
}

type CheckinRecord = {
    id_contact: string
    scanned_at?: string
}

type CheckinPayload = {
    id_event: string
    id_contact: string
    scan_type: 'entree'
    scan_identifier: string
    scanner_email: string
    scan_point: string
}

type QueuedCheckin = {
    id: string
    timestamp: number
    payload: CheckinPayload
    retries: number
}

const emptyConfig: Config = { scan_identifier: '', scanner_email: '', scan_point: '' }

function beep() {
    try {
        const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.frequency.value = 1200
        gain.gain.setValueAtTime(0.3, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)
        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + 0.15)
    } catch { }
}

function vibrate() {
    try { navigator.vibrate?.(80) } catch { }
}

function loadSavedConfig(): Config | null {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
        if (saved?.scanner_email && saved?.scan_point && saved?.scan_identifier) return saved
    } catch { }
    return null
}

// --- Offline queue ---
function loadQueue(): QueuedCheckin[] {
    try { return JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]') } catch { return [] }
}
function saveQueue(q: QueuedCheckin[]) {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(q))
}
function enqueueCheckin(payload: CheckinPayload): void {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    const q = loadQueue()
    q.push({ id, timestamp: Date.now(), payload, retries: 0 })
    saveQueue(q)
}
function dequeueCheckin(id: string) {
    saveQueue(loadQueue().filter(i => i.id !== id))
}

// --- Contact cache ---
function getCachedContact(id: string): Contact | null {
    try {
        const cache: Record<string, Contact> = JSON.parse(localStorage.getItem(CONTACT_CACHE_KEY) || '{}')
        return cache[id] ?? null
    } catch { return null }
}
function cacheContact(contact: Contact) {
    try {
        const cache: Record<string, Contact> = JSON.parse(localStorage.getItem(CONTACT_CACHE_KEY) || '{}')
        cache[contact.id_contact] = contact
        localStorage.setItem(CONTACT_CACHE_KEY, JSON.stringify(cache))
    } catch { }
}

async function postCheckin(payload: CheckinPayload): Promise<{ success: boolean; error?: string }> {
    const r = await fetch(`${CHECKIN_API_URL}?action=createCheckin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    })
    return JSON.parse(await r.text())
}

export default function QrCheckinScanner() {
    const { eventId } = useParams<{ eventId: string }>()
    const [phase, setPhase] = useState<Phase>('config')
    const [config, setConfig] = useState<Config>(emptyConfig)
    const [scanData, setScanData] = useState<{ id_event: string; id_contact: string } | null>(null)
    const [contact, setContact] = useState<Contact | null>(null)
    const [errorMsg, setErrorMsg] = useState('')
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('pending')
    const [isOnline, setIsOnline] = useState(true)
    const [pendingCount, setPendingCount] = useState(0)
    const [manualQuery, setManualQuery] = useState('')
    const [manualResults, setManualResults] = useState<Partner[]>([])
    const [manualLoading, setManualLoading] = useState(false)
    const [manualStatus, setManualStatus] = useState<Record<string, SaveStatus>>({})
    const [checkinMap, setCheckinMap] = useState<Record<string, CheckinRecord>>({})
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const qrRef = useRef<any>(null)
    const cooldownRef = useRef(false)
    const configRef = useRef(config)
    const manualDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const flushQueue = useCallback(async () => {
        const q = loadQueue()
        if (q.length === 0) return
        for (const item of q) {
            try {
                const result = await postCheckin(item.payload)
                if (result.success) dequeueCheckin(item.id)
                else break // server rejection — stop (not a connectivity issue)
            } catch {
                break // still offline — stop trying
            }
        }
        setPendingCount(loadQueue().length)
    }, [])

    // Network status + auto-flush on reconnect
    useEffect(() => {
        setIsOnline(navigator.onLine)
        setPendingCount(loadQueue().length)

        const handleOnline = () => { setIsOnline(true); flushQueue() }
        const handleOffline = () => setIsOnline(false)

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        if (navigator.onLine) flushQueue()

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [flushQueue])

    // Periodic retry every 60s while there are pending items
    useEffect(() => {
        if (pendingCount === 0) return
        const interval = setInterval(flushQueue, 60_000)
        return () => clearInterval(interval)
    }, [pendingCount, flushQueue])

    // Load saved config on mount (client-side only)
    useEffect(() => {
        const saved = loadSavedConfig()
        if (saved) {
            setConfig(saved)
            setPhase('scanning')
        }
    }, [])

    useEffect(() => { configRef.current = config }, [config])

    // Camera lifecycle
    useEffect(() => {
        if (phase !== 'scanning') return

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let qr: any = null

        import('html5-qrcode').then(({ Html5Qrcode }) => {
            qr = new Html5Qrcode('qr-viewport')
            qrRef.current = qr

            qr.start(
                { facingMode: 'environment' },
                { fps: 15 },
                (decodedText: string) => {
                    if (cooldownRef.current) return
                    cooldownRef.current = true
                    beep()
                    vibrate()

                    void (async () => {
                    //   signé (nouveau)  : "id_event:id_contact:HMAC8"  ex: "123:456:a3f8c1d9"
                    //   compact (legacy) : "id_event:id_contact"         ex: "123:456"
                    //   JSON (legacy)    : {"id_event":"123","id_contact":"456"}
                    let payload: { id_event?: string; id_contact?: string }
                    let qrVerified = false

                    const signedMatch = /^(\d+):(\d+):([0-9a-f]{8})$/.exec(decodedText.trim())
                    const compactMatch = !signedMatch && /^(\d+):(\d+)$/.exec(decodedText.trim())

                    if (signedMatch) {
                        // QR signé — vérification HMAC via API (< 5ms réseau local)
                        let verifyOk = false
                        try {
                            const vRes = await fetch(`/saas/api/badge/verify-qr?q=${encodeURIComponent(decodedText.trim())}`)
                            const vData = await vRes.json()
                            verifyOk = vData.valid === true
                        } catch { /* réseau indisponible — on accepte en mode dégradé */ verifyOk = true }
                        if (!verifyOk) {
                            qr!.stop().catch(() => { })
                            qrRef.current = null
                            setErrorMsg('QR invalide — signature incorrecte (badge falsifié ?)')
                            setPhase('error')
                            return
                        }
                        payload = { id_event: signedMatch[1], id_contact: signedMatch[2] }
                        qrVerified = true
                    } else if (compactMatch) {
                        payload = { id_event: compactMatch[1], id_contact: compactMatch[2] }
                    } else {
                        try { payload = JSON.parse(decodedText) }
                        catch {
                            qr!.stop().catch(() => { })
                            qrRef.current = null
                            setErrorMsg('QR non reconnu — format invalide')
                            setPhase('error')
                            return
                        }
                    }
                    void qrVerified // utilisé pour logs futurs

                    const resolvedEvent = payload.id_event || eventId
                    if (!resolvedEvent || !payload.id_contact) {
                        qr!.stop().catch(() => { })
                        qrRef.current = null
                        setErrorMsg('QR invalide : id_event / id_contact manquants')
                        setPhase('error')
                        return
                    }
 
                    qr!.stop().catch(() => { })
                    qrRef.current = null

                    const checkinPayload: CheckinPayload = {
                        id_event: resolvedEvent,
                        id_contact: payload.id_contact,
                        scan_type: 'entree',
                        scan_identifier: configRef.current.scan_identifier,
                        scanner_email: configRef.current.scanner_email,
                        scan_point: configRef.current.scan_point,
                    }

                    setScanData({ id_event: resolvedEvent, id_contact: payload.id_contact })
                    setContact(null)
                    setSaveStatus('pending')
                    setPhase('success')

                    // Fetch contact — fall back to local cache if offline
                    fetch(`${API_URL}?action=getContact&id_contact=${payload.id_contact}`)
                        .then(r => r.json())
                        .then(c => { cacheContact(c); setContact(c) })
                        .catch(() => {
                            const cached = getCachedContact(payload.id_contact!)
                            if (cached) setContact(cached)
                        })

                    // Post checkin — queue locally on network failure
                    postCheckin(checkinPayload)
                        .then(result => {
                            setSaveStatus(result.success ? 'saved' : 'failed')
                            if (!result.success) setErrorMsg(result.error || 'Erreur serveur')
                        })
                        .catch(() => {
                            enqueueCheckin(checkinPayload)
                            setPendingCount(loadQueue().length)
                            setSaveStatus('queued')
                        })
                    })() // end async IIFE
                },
                () => { }
            ).catch((err: unknown) => {
                setErrorMsg(`Caméra inaccessible : ${err}`)
                setPhase('error')
            })
        })

        return () => {
            if (qrRef.current) {
                qrRef.current.stop().catch(() => { })
                qrRef.current = null
            }
        }
    }, [phase, eventId])

    const searchManual = useCallback(async (q: string) => {
        if (!q || q.length < 2) { setManualResults([]); return }
        setManualLoading(true)
        try {
            const params = `AND cf.id_event=${eventId} AND (c.nom LIKE '%${q}%' OR c.prenom LIKE '%${q}%')`
            const res = await fetch(`${API_URL}?action=getPartenairesLight&params=${encodeURIComponent(params)}`)
            const data = await res.json()
            setManualResults(Array.isArray(data) ? data : [])
        } catch {
            setManualResults([])
        }
        setManualLoading(false)
    }, [eventId])

    const handleManualInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setManualQuery(val)
        if (manualDebounceRef.current) clearTimeout(manualDebounceRef.current)
        manualDebounceRef.current = setTimeout(() => searchManual(val), 350)
    }

    const validateManual = async (contact: Contact) => {
        setManualStatus(s => ({ ...s, [contact.id_contact]: 'pending' }))
        const checkinPayload: CheckinPayload = {
            id_event: String(eventId),
            id_contact: contact.id_contact,
            scan_type: 'entree',
            scan_identifier: configRef.current.scan_identifier,
            scanner_email: configRef.current.scanner_email,
            scan_point: configRef.current.scan_point,
        }
        try {
            const result = await postCheckin(checkinPayload)
            setManualStatus(s => ({ ...s, [contact.id_contact]: result.success ? 'saved' : 'failed' }))
            if (result.success) {
                setCheckinMap(m => ({ ...m, [contact.id_contact]: { id_contact: contact.id_contact, scanned_at: new Date().toISOString() } }))
            }
        } catch {
            enqueueCheckin(checkinPayload)
            setPendingCount(loadQueue().length)
            setManualStatus(s => ({ ...s, [contact.id_contact]: 'queued' }))
        }
    }

    const openManual = () => {
        if (qrRef.current) {
            try { qrRef.current.stop().catch(() => { }) } catch { }
            qrRef.current = null
        }
        cooldownRef.current = false
        setPhase('manual')
        fetch(`${CHECKIN_API_URL}?action=getCheckinList&id_event=${eventId}`)
            .then(r => r.json())
            .then((data: CheckinRecord[]) => {
                if (!Array.isArray(data)) return
                const map: Record<string, CheckinRecord> = {}
                data.forEach(c => { if (!map[c.id_contact]) map[c.id_contact] = c })
                setCheckinMap(map)
            })
            .catch(() => { })
    }

    const closeManual = () => {
        setManualQuery('')
        setManualResults([])
        cooldownRef.current = false
        setPhase('scanning')
    }

    const startScan = (e: React.FormEvent) => {
        e.preventDefault()
        if (!config.scan_identifier.trim() || !config.scanner_email.trim() || !config.scan_point.trim()) return
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
        cooldownRef.current = false
        setPhase('scanning')
    }

    const openConfig = () => {
        if (qrRef.current) {
            try { qrRef.current.stop().catch(() => { }) } catch { }
            qrRef.current = null
        }
        cooldownRef.current = false
        setPhase('config')
    }

    const reset = () => {
        cooldownRef.current = false
        setScanData(null)
        setContact(null)
        setErrorMsg('')
        setSaveStatus('pending')
        setPhase('scanning')
    }

    const configValid = config.scan_identifier.trim() && config.scanner_email.trim() && config.scan_point.trim()

    const saveLabel: Record<SaveStatus, { text: string; cls: string }> = {
        pending: { text: 'Enregistrement…', cls: 'text-yellow-400' },
        saved: { text: 'Sauvegardé ✓', cls: 'text-green-400' },
        failed: { text: 'Erreur serveur', cls: 'text-red-400' },
        queued: { text: 'Hors ligne — sync en attente', cls: 'text-orange-400' },
    }

    return (
        <div className="fixed inset-0 bg-neutral-950 text-white overflow-hidden" style={{ zIndex: 999 }}>

            {/* Viewport caméra — toujours dans le DOM */}
            <div
                id="qr-viewport"
                style={{
                    position: 'fixed', inset: 0,
                    visibility: phase === 'scanning' ? 'visible' : 'hidden',
                    zIndex: 0,
                }}
            />

            {/* Scanning overlay */}
            {phase === 'scanning' && (
                <div className="fixed inset-0 z-10 pointer-events-none flex items-center justify-center">
                    <div className="w-64 h-64 border-2 border-white/80 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.45)] relative">
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-400 rounded-tl-2xl" />
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-400 rounded-tr-2xl" />
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-400 rounded-bl-2xl" />
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-400 rounded-br-2xl" />
                    </div>
                    <div className="absolute top-4 left-4 right-16 bg-black/50 backdrop-blur-sm rounded-xl px-3 py-2 text-xs text-white/70 pointer-events-auto">
                        <p className="font-bold text-sm text-white tracking-wide">event2one</p>
                        <p className="flex items-center gap-1 truncate"><MapPin size={11} /> {config.scan_point}</p>
                        <p className="flex items-center gap-1 truncate"><Mail size={11} /> {config.scanner_email}</p>
                    </div>
                    <p className="absolute bottom-10 text-white/60 text-sm">Pointez sur le QR Code</p>
                </div>
            )}

            {/* Settings + network badges — z-index inline pour passer au-dessus des éléments html5-qrcode */}
            {phase !== 'config' && phase !== 'manual' && (
                <div style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 9999 }} className="flex flex-col items-end gap-2">
                    <button
                        type="button"
                        onClick={openConfig}
                        className="p-2 bg-black/60 backdrop-blur-sm rounded-xl text-white hover:bg-black/80 active:scale-95 transition-transform"
                        style={{ pointerEvents: 'all' }}
                    >
                        <Settings size={20} />
                    </button>
                    {phase === 'scanning' && (
                        <button
                            type="button"
                            onClick={openManual}
                            title="Émargement manuel"
                            className="p-2 bg-black/60 backdrop-blur-sm rounded-xl text-white hover:bg-black/80 active:scale-95 transition-transform"
                            style={{ pointerEvents: 'all' }}
                        >
                            <Users size={20} />
                        </button>
                    )}
                    {!isOnline && (
                        <div className="flex items-center gap-1.5 bg-orange-500/90 backdrop-blur-sm rounded-xl px-2.5 py-1.5 text-white text-xs font-medium">
                            <WifiOff size={13} />
                            <span>Hors ligne</span>
                            {pendingCount > 0 && (
                                <span className="bg-white/25 rounded-full px-1.5 py-0.5 text-[10px] leading-none">{pendingCount}</span>
                            )}
                        </div>
                    )}
                    {isOnline && pendingCount > 0 && (
                        <div className="flex items-center gap-1.5 bg-blue-500/90 backdrop-blur-sm rounded-xl px-2.5 py-1.5 text-white text-xs font-medium">
                            <CloudOff size={13} />
                            <span>Sync {pendingCount}…</span>
                        </div>
                    )}
                </div>
            )}

            {/* Config */}
            {phase === 'config' && (
                <div className="fixed inset-0 z-20 bg-neutral-950 flex flex-col items-center justify-center p-6 overflow-y-auto">
                    <h1 className="text-2xl font-bold mb-2">Configuration du scan</h1>
                    <p className="text-neutral-400 text-sm mb-8 text-center">
                        Ces informations sont sauvegardées sur cet appareil.
                    </p>
                    {pendingCount > 0 && (
                        <div className="mb-6 w-full max-w-sm flex items-center gap-2 bg-orange-500/15 border border-orange-500/30 rounded-xl px-4 py-3 text-sm text-orange-300">
                            <CloudOff size={16} className="shrink-0" />
                            <span>{pendingCount} checkin{pendingCount > 1 ? 's' : ''} en attente de synchronisation</span>
                        </div>
                    )}
                    <form onSubmit={startScan} className="w-full max-w-sm flex flex-col gap-4">
                        <label className="flex flex-col gap-1">
                            <span className="text-xs text-neutral-400 flex items-center gap-1"><Hash size={12} /> Identifiant du scan</span>
                            <input type="text" value={config.scan_identifier}
                                onChange={e => setConfig(c => ({ ...c, scan_identifier: e.target.value }))}
                                placeholder="Ex : SCAN-001, Accueil-Matin-J1"
                                className="w-full px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-700 focus:outline-none focus:border-blue-500 text-white placeholder-neutral-500"
                                required />
                        </label>
                        <label className="flex flex-col gap-1">
                            <span className="text-xs text-neutral-400 flex items-center gap-1"><Mail size={12} /> Email hôte d&apos;accueil</span>
                            <input type="email" value={config.scanner_email}
                                onChange={e => setConfig(c => ({ ...c, scanner_email: e.target.value }))}
                                placeholder="prenom.nom@example.com"
                                className="w-full px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-700 focus:outline-none focus:border-blue-500 text-white placeholder-neutral-500"
                                required />
                        </label>
                        <label className="flex flex-col gap-1">
                            <span className="text-xs text-neutral-400 flex items-center gap-1"><MapPin size={12} /> Point de contrôle</span>
                            <input type="text" value={config.scan_point}
                                onChange={e => setConfig(c => ({ ...c, scan_point: e.target.value }))}
                                placeholder="Ex : Entrée principale, Salle A, Déjeuner"
                                className="w-full px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-700 focus:outline-none focus:border-blue-500 text-white placeholder-neutral-500"
                                required />
                        </label>
                        <button type="submit" disabled={!configValid}
                            className="mt-2 w-full py-4 rounded-2xl font-bold text-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-transform">
                            Démarrer le scan
                        </button>
                    </form>
                </div>
            )}

            {/* Success */}
            {phase === 'success' && scanData && (
                <div className="fixed inset-0 z-20 bg-neutral-950 flex flex-col items-center justify-center p-6 gap-4">
                    {contact?.photo
                        ? <img src={`${DIR_IMG}${contact.photo}`} alt=""
                            className="w-28 h-28 rounded-full object-cover ring-4 ring-green-400 shadow-xl" />
                        : <div className="w-28 h-28 rounded-full bg-neutral-700 ring-4 ring-green-400 flex items-center justify-center">
                            <User size={48} className="text-neutral-400" />
                        </div>
                    }
                    {contact
                        ? <>
                            <h2 className="text-3xl font-bold text-center">{contact.prenom} {contact.nom}</h2>
                            {contact.societe && <p className="text-neutral-400 -mt-2">{contact.societe}</p>}
                        </>
                        : <div className="h-10 w-48 bg-neutral-700 animate-pulse rounded-lg" />
                    }
                    <CheckCircle size={40} className="text-green-400" />
                    <span className={`text-sm font-medium px-3 py-1 rounded-full bg-neutral-800 ${saveLabel[saveStatus].cls}`}>
                        {saveLabel[saveStatus].text}
                    </span>
                    {saveStatus === 'queued' && (
                        <p className="text-xs text-orange-300/70 text-center max-w-xs">
                            Enregistré localement. Sera envoyé automatiquement au retour du réseau.
                        </p>
                    )}
                    <div className="text-xs text-neutral-500 text-center space-y-0.5">
                        <p className="flex items-center justify-center gap-1"><MapPin size={10} /> {config.scan_point}</p>
                        <p className="flex items-center justify-center gap-1"><Hash size={10} /> {config.scan_identifier}</p>
                    </div>
                    <button onClick={reset}
                        className="mt-2 flex items-center gap-2 px-10 py-4 bg-blue-600 hover:bg-blue-500 active:scale-95 transition-transform text-white rounded-2xl font-bold text-xl">
                        <RefreshCw size={20} /> Suivant
                    </button>
                    {saveStatus === 'failed' && (
                        <p className="text-xs text-red-400 text-center max-w-xs break-all font-mono bg-neutral-800 rounded-lg p-3">
                            {errorMsg}
                        </p>
                    )}
                </div>
            )}

            {/* Error */}
            {phase === 'error' && (
                <div className="fixed inset-0 z-20 bg-neutral-950 flex flex-col items-center justify-center p-6">
                    <XCircle size={72} className="text-red-400 mb-4" />
                    <h2 className="text-2xl font-bold text-red-400 mb-4">QR invalide</h2>
                    <p className="text-xs text-gray-400 text-center max-w-xs break-all font-mono bg-neutral-800 rounded-lg p-3 mb-8">
                        {errorMsg}
                    </p>
                    <button onClick={reset}
                        className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-semibold text-lg active:scale-95 transition-transform">
                        <RefreshCw size={18} /> Réessayer
                    </button>
                </div>
            )}

            {/* Émargement manuel */}
            {phase === 'manual' && (
                <div className="fixed inset-0 z-20 bg-neutral-950 flex flex-col p-4 sm:p-6 overflow-hidden">
                    <div className="flex items-start justify-between mb-4 gap-3">
                        <div>
                            <p className="font-bold text-sm tracking-wide text-white">event2one</p>
                            <h1 className="text-xl font-bold">Émargement manuel</h1>
                            <p className="text-xs text-neutral-500 flex items-center gap-1 mt-1"><MapPin size={11} /> {config.scan_point}</p>
                        </div>
                        <button onClick={closeManual}
                            className="p-2 bg-neutral-800 rounded-xl text-white hover:bg-neutral-700 active:scale-95 transition-transform">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
                        <input
                            type="text"
                            value={manualQuery}
                            onChange={handleManualInput}
                            placeholder="Rechercher par nom ou prénom…"
                            autoFocus
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-neutral-800 border border-neutral-700 focus:outline-none focus:border-blue-500 text-white placeholder-neutral-500"
                        />
                    </div>

                    {manualLoading && <p className="text-sm text-neutral-400 mb-2">Recherche…</p>}
                    {!manualLoading && manualQuery.length >= 2 && manualResults.length === 0 && (
                        <p className="text-sm text-neutral-400 mb-2">Aucun résultat pour « {manualQuery} »</p>
                    )}
                    {manualQuery.length < 2 && (
                        <p className="text-sm text-neutral-500 mb-2">Tapez au moins 2 caractères pour rechercher un inscrit.</p>
                    )}

                    <div className="flex-1 overflow-y-auto -mx-1 px-1 space-y-2 pb-4">
                        {manualResults.map(({ contact: c }) => {
                            const status = manualStatus[c.id_contact]
                            return (
                                <div key={c.id_contact}
                                    className="flex items-center gap-3 p-3 rounded-xl bg-neutral-800 border border-neutral-700">
                                    {c.photo
                                        ? <img src={`${DIR_IMG}${c.photo}`} alt="" className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                                        : <div className="w-12 h-12 rounded-full bg-neutral-700 flex items-center justify-center flex-shrink-0">
                                            <User size={20} className="text-neutral-400" />
                                        </div>
                                    }
                                    <div className="min-w-0 flex-1">
                                        <p className="font-semibold truncate">{c.prenom} {c.nom}</p>
                                        {c.societe && <p className="text-xs text-neutral-400 truncate">{c.societe}</p>}
                                        {checkinMap[c.id_contact] && (
                                            <p className="flex items-center gap-1 text-xs text-emerald-400 mt-0.5">
                                                <CheckCircle size={11} />
                                                Déjà badgé{checkinMap[c.id_contact].scanned_at ? ` à ${checkinMap[c.id_contact].scanned_at!.slice(11, 16)}` : ''}
                                            </p>
                                        )}
                                    </div>
                                    {status === 'saved' && (
                                        <span className="flex items-center gap-1 text-green-400 text-xs font-medium px-3 py-2">
                                            <Check size={16} /> Validé
                                        </span>
                                    )}
                                    {status === 'queued' && (
                                        <span className="flex items-center gap-1 text-orange-400 text-xs font-medium px-3 py-2">
                                            <CloudOff size={16} /> En attente
                                        </span>
                                    )}
                                    {(status === undefined || status === 'failed') && (
                                        <button onClick={() => validateManual(c)}
                                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 transition-transform text-white text-sm font-semibold flex-shrink-0">
                                            <CheckCircle size={16} /> {status === 'failed' ? 'Réessayer' : 'Valider'}
                                        </button>
                                    )}
                                    {status === 'pending' && (
                                        <span className="flex items-center gap-1 text-yellow-400 text-xs font-medium px-3 py-2">
                                            <RefreshCw size={14} className="animate-spin" />
                                        </span>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

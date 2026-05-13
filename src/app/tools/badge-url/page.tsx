'use client'

import { useState } from 'react'

const PROD_BASE = 'https://www.event2one.com/saas'
const LOCAL_BASE = 'http://localhost:3002/saas'

export default function BadgeUrlGenerator() {
    const [idEvent, setIdEvent] = useState('')
    const [idContact, setIdContact] = useState('')
    const [autoprint, setAutoprint] = useState(false)
    const [targetEnv, setTargetEnv] = useState<'prod' | 'local'>('prod')
    const [result, setResult] = useState<{ token: string; url: string; qrData: string } | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [copied, setCopied] = useState(false)

    async function generate() {
        setError(null)
        setResult(null)
        setCopied(false)

        if (!/^\d+$/.test(idEvent) || !/^\d+$/.test(idContact)) {
            setError('id_event et id_contact doivent être numériques')
            return
        }

        setLoading(true)
        try {
            const res = await fetch('/saas/api/badge/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_event: idEvent, id_contact: idContact, autoprint }),
            })
            const data = await res.json()
            if (data.error) {
                setError(data.error)
                return
            }
            const base = targetEnv === 'prod' ? PROD_BASE : LOCAL_BASE
            const url = `${base}/badge/${idEvent}?t=${encodeURIComponent(data.token)}`
            setResult({ token: data.token, url, qrData: data.qrData })
        } catch {
            setError('Erreur réseau — le serveur local est-il démarré ?')
        } finally {
            setLoading(false)
        }
    }

    function copy(text: string) {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '10px 14px', borderRadius: '10px',
        border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box',
        outline: 'none', fontFamily: 'monospace',
    }
    const labelStyle: React.CSSProperties = { fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px', display: 'block' }
    const btnStyle: React.CSSProperties = {
        padding: '10px 22px', background: '#2563eb', color: '#fff', border: 'none',
        borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: 700,
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '48px 16px' }}>
            <div style={{ background: '#fff', borderRadius: '18px', boxShadow: '0 4px 24px rgba(0,0,0,.08)', padding: '36px 40px', width: '100%', maxWidth: '560px' }}>
                <h1 style={{ margin: '0 0 6px', fontSize: '20px', fontWeight: 800, color: '#111827' }}>
                    🔗 Générateur d&apos;URL de badge
                </h1>
                <p style={{ margin: '0 0 28px', fontSize: '13px', color: '#6b7280' }}>
                    Génère une URL sécurisée (token AES-256-GCM) pour la page badge event2one.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                        <label style={labelStyle}>id_event</label>
                        <input style={inputStyle} value={idEvent} onChange={e => setIdEvent(e.target.value.trim())} placeholder="ex: 2273" />
                    </div>
                    <div>
                        <label style={labelStyle}>id_contact</label>
                        <input style={inputStyle} value={idContact} onChange={e => setIdContact(e.target.value.trim())} placeholder="ex: 456" />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '24px', marginBottom: '20px', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                        <input type="checkbox" checked={autoprint} onChange={e => setAutoprint(e.target.checked)} />
                        <span>Impression automatique</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                        <span>Env :</span>
                        <select
                            value={targetEnv}
                            onChange={e => setTargetEnv(e.target.value as 'prod' | 'local')}
                            style={{ fontSize: '13px', padding: '4px 8px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                        >
                            <option value="prod">Production (event2one.com)</option>
                            <option value="local">Local (localhost:3002)</option>
                        </select>
                    </label>
                </div>

                <button style={{ ...btnStyle, opacity: loading ? 0.7 : 1, width: '100%', marginBottom: '20px' }} onClick={generate} disabled={loading}>
                    {loading ? 'Génération…' : 'Générer l\'URL'}
                </button>

                {error && (
                    <div style={{ padding: '12px 16px', borderRadius: '10px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '13px', marginBottom: '16px' }}>
                        ⚠ {error}
                    </div>
                )}

                {result && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div>
                            <label style={{ ...labelStyle, color: '#059669' }}>✓ URL générée (TTL 2h)</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    readOnly
                                    value={result.url}
                                    style={{ ...inputStyle, flex: 1, background: '#f0fdf4', border: '1px solid #bbf7d0', fontSize: '11px' }}
                                    onClick={e => (e.target as HTMLInputElement).select()}
                                />
                                <button
                                    onClick={() => copy(result.url)}
                                    style={{ ...btnStyle, background: copied ? '#059669' : '#2563eb', padding: '10px 14px', flexShrink: 0 }}
                                >
                                    {copied ? '✓' : 'Copier'}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label style={labelStyle}>QR data (compact)</label>
                            <input readOnly value={result.qrData} style={{ ...inputStyle, background: '#f9fafb', fontSize: '13px', width: 'auto' }} />
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <a
                                href={result.url}
                                target="_blank"
                                rel="noreferrer"
                                style={{ ...btnStyle, textDecoration: 'none', display: 'inline-block', fontSize: '13px', background: '#7c3aed' }}
                            >
                                Ouvrir le badge →
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

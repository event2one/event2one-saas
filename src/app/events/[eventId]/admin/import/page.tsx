'use client'

import { useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import * as XLSX from 'xlsx'
import { EVENT_CONFIG } from '@/config/events'

type Row = {
    nom: string
    prenom: string
    societe: string
    fonction: string
    mail: string
}

type ImportResult = {
    row: number
    nom: string
    prenom: string
    mail: string
    success: boolean
    error?: string
}

const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.-]+/

function normalizeHeader(h: string): string {
    return h
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .trim()
        .toLowerCase()
}

const HEADER_MAP: Record<string, keyof Row> = {
    nom: 'nom',
    prenom: 'prenom',
    'prénom': 'prenom',
    organisme: 'societe',
    organisation: 'societe',
    societe: 'societe',
    'société': 'societe',
    structure: 'societe',
    fonction: 'fonction',
    mail: 'mail',
    email: 'mail',
    'e-mail': 'mail',
    courriel: 'mail',
}

function extractEmail(raw: string): string {
    const match = EMAIL_RE.exec(raw)
    return match ? match[0] : raw.trim()
}

function parseFile(file: File): Promise<Row[]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const data = e.target?.result
                const workbook = XLSX.read(data, { type: 'binary' })
                const sheet = workbook.Sheets[workbook.SheetNames[0]]
                const raw: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, { defval: '' })

                const rows: Row[] = raw.map((r) => {
                    const row: Row = { nom: '', prenom: '', societe: '', fonction: '', mail: '' }
                    for (const [key, value] of Object.entries(r)) {
                        const mapped = HEADER_MAP[normalizeHeader(key)]
                        if (mapped) {
                            const str = String(value ?? '').trim()
                            row[mapped] = mapped === 'mail' ? extractEmail(str) : str
                        }
                    }
                    return row
                }).filter(r => r.nom || r.prenom || r.mail)

                resolve(rows)
            } catch (err) {
                reject(err)
            }
        }
        reader.onerror = () => reject(reader.error)
        reader.readAsBinaryString(file)
    })
}

export default function ImportContactsPage() {
    const { eventId } = useParams<{ eventId: string }>()
    const eventCfg = EVENT_CONFIG[eventId] ?? {}
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [rows, setRows] = useState<Row[]>([])
    const [fileName, setFileName] = useState('')
    const [parseError, setParseError] = useState('')
    const [statut, setStatut] = useState(480)
    const [sendBadge, setSendBadge] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [results, setResults] = useState<ImportResult[] | null>(null)

    const handleFile = async (file: File) => {
        setParseError('')
        setResults(null)
        setFileName(file.name)
        try {
            const parsed = await parseFile(file)
            setRows(parsed)
        } catch {
            setParseError("Impossible de lire ce fichier. Formats acceptés : .csv, .xls, .xlsx")
            setRows([])
        }
    }

    const updateRow = (index: number, field: keyof Row, value: string) => {
        setRows(prev => prev.map((r, i) => i === index ? { ...r, [field]: value } : r))
    }

    const removeRow = (index: number) => {
        setRows(prev => prev.filter((_, i) => i !== index))
    }

    const addRow = () => {
        setRows(prev => [...prev, { nom: '', prenom: '', societe: '', fonction: '', mail: '' }])
    }

    const handleSubmit = async () => {
        setSubmitting(true)
        setResults(null)
        try {
            const res = await fetch(`/saas/api/events/${eventId}/import-contacts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contacts: rows, statut, sendBadge }),
            })
            const data = await res.json()
            setResults(data.results ?? [])
        } catch {
            setParseError("L'import a échoué — vérifiez votre connexion et réessayez.")
        } finally {
            setSubmitting(false)
        }
    }

    const validRows = rows.filter(r => r.nom && r.prenom && r.mail)
    const invalidCount = rows.length - validRows.length

    return (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 16px', fontFamily: 'Verdana, Tahoma, Arial, sans-serif' }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
                Import de contacts — {eventCfg.email?.eventName ?? `Événement ${eventId}`}
            </h1>
            <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 24 }}>
                Importez un fichier CSV ou Excel (colonnes attendues : NOM, PRENOM, ORGANISME, FONCTION, MAIL).
                Vérifiez et corrigez les données ci-dessous avant de créer les contacts et d&apos;envoyer leur e-badge.
            </p>

            <div style={{ marginBottom: 20 }}>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xls,.xlsx"
                    onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleFile(file)
                    }}
                />
                {fileName && <span style={{ marginLeft: 12, fontSize: 13, color: '#6b7280' }}>{fileName}</span>}
            </div>

            {parseError && (
                <p style={{ color: '#dc2626', fontSize: 14, marginBottom: 16 }}>{parseError}</p>
            )}

            {rows.length > 0 && (
                <>
                    <div style={{ overflowX: 'auto', marginBottom: 16, border: '1px solid #e5e7eb', borderRadius: 8 }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                            <thead>
                                <tr style={{ background: '#f9fafb' }}>
                                    <th style={thStyle}>Nom</th>
                                    <th style={thStyle}>Prénom</th>
                                    <th style={thStyle}>Organisme</th>
                                    <th style={thStyle}>Fonction</th>
                                    <th style={thStyle}>Email</th>
                                    <th style={thStyle}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row, i) => {
                                    const isValid = row.nom && row.prenom && row.mail
                                    return (
                                        <tr key={i} style={{ background: isValid ? undefined : '#fef2f2' }}>
                                            <td style={tdStyle}><input style={inputStyle} value={row.nom} onChange={e => updateRow(i, 'nom', e.target.value)} /></td>
                                            <td style={tdStyle}><input style={inputStyle} value={row.prenom} onChange={e => updateRow(i, 'prenom', e.target.value)} /></td>
                                            <td style={tdStyle}><input style={inputStyle} value={row.societe} onChange={e => updateRow(i, 'societe', e.target.value)} /></td>
                                            <td style={tdStyle}><input style={inputStyle} value={row.fonction} onChange={e => updateRow(i, 'fonction', e.target.value)} /></td>
                                            <td style={tdStyle}><input style={inputStyle} value={row.mail} onChange={e => updateRow(i, 'mail', e.target.value)} /></td>
                                            <td style={tdStyle}>
                                                <button onClick={() => removeRow(i)} style={{ color: '#dc2626', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13 }}>
                                                    Supprimer
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>

                    <button onClick={addRow} style={{ marginBottom: 24, fontSize: 13, color: '#170b7e', border: '1px solid #170b7e', borderRadius: 6, padding: '6px 12px', background: 'none', cursor: 'pointer' }}>
                        + Ajouter une ligne
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 16, flexWrap: 'wrap' }}>
                        <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                            Statut (id_event_contact_type) :
                            <input
                                type="number"
                                value={statut}
                                onChange={e => setStatut(parseInt(e.target.value, 10) || 0)}
                                style={{ ...inputStyle, width: 80 }}
                            />
                        </label>
                        <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <input type="checkbox" checked={sendBadge} onChange={e => setSendBadge(e.target.checked)} />
                            Envoyer le e-badge par email immédiatement
                        </label>
                    </div>

                    <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>
                        {validRows.length} contact(s) prêt(s) à être importé(s)
                        {invalidCount > 0 && <span style={{ color: '#dc2626' }}> — {invalidCount} ligne(s) incomplète(s) (nom, prénom et email obligatoires) seront ignorées</span>}
                    </p>

                    <button
                        onClick={handleSubmit}
                        disabled={submitting || validRows.length === 0}
                        style={{
                            background: eventCfg.primaryColor ?? '#170b7e',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 8,
                            padding: '12px 28px',
                            fontSize: 14,
                            fontWeight: 700,
                            cursor: submitting ? 'default' : 'pointer',
                            opacity: submitting ? 0.7 : 1,
                        }}
                    >
                        {submitting ? 'Import en cours…' : `Créer les contacts${sendBadge ? ' et envoyer les e-badges' : ''}`}
                    </button>
                </>
            )}

            {results && (
                <div style={{ marginTop: 32 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Résultats</h2>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, border: '1px solid #e5e7eb', borderRadius: 8 }}>
                        <thead>
                            <tr style={{ background: '#f9fafb' }}>
                                <th style={thStyle}>Nom</th>
                                <th style={thStyle}>Prénom</th>
                                <th style={thStyle}>Email</th>
                                <th style={thStyle}>Statut</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.map((r, i) => (
                                <tr key={i} style={{ background: r.success ? '#f0fdf4' : '#fef2f2' }}>
                                    <td style={tdStyle}>{r.nom}</td>
                                    <td style={tdStyle}>{r.prenom}</td>
                                    <td style={tdStyle}>{r.mail}</td>
                                    <td style={tdStyle}>{r.success ? '✅ Importé' : `❌ ${r.error}`}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

const thStyle: React.CSSProperties = { textAlign: 'left', padding: '8px 10px', borderBottom: '1px solid #e5e7eb', fontWeight: 700 }
const tdStyle: React.CSSProperties = { padding: '4px 6px', borderBottom: '1px solid #f3f4f6' }
const inputStyle: React.CSSProperties = { width: '100%', border: '1px solid #e5e7eb', borderRadius: 4, padding: '6px 8px', fontSize: 13, fontFamily: 'inherit' }

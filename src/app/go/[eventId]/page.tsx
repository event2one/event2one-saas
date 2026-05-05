'use client'

import { useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Search, QrCode, X, User, Download } from 'lucide-react'

const API_URL = 'https://www.mlg-consulting.com/smart_territory/form/api.php'
const DIR_IMG = '//www.mlg-consulting.com/manager_cc/contacts/img_uploaded/'

type Contact = {
    id_contact: string
    prenom: string
    nom: string
    societe: string
    photo: string
}

type Partner = {
    contact: Contact
}

export default function QrBadgeGenerator() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<Partner[]>([])
    const [loading, setLoading] = useState(false)
    const [selected, setSelected] = useState<Partner | null>(null)
    const { eventId } = useParams<{ eventId: string }>()
    const { resolvedTheme } = useTheme()
    const dark = resolvedTheme === 'dark'
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const search = async (q: string) => {
        if (!q || q.length < 2) { setResults([]); return }
        setLoading(true)
        try {
            const params = `AND id_event=${eventId} AND (c.nom LIKE '%${q}%' OR c.prenom LIKE '%${q}%') LIMIT 20`
            const res = await fetch(`${API_URL}?action=getPartenaires&params=${encodeURIComponent(params)}`)
            const data = await res.json()
            setResults(Array.isArray(data) ? data : [])
        } catch {
            setResults([])
        }
        setLoading(false)
    }

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setQuery(val)
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => search(val), 350)
    }

    const qrSrc = (c: Contact) =>
        `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(
            JSON.stringify({ id_event: String(eventId), id_conferencier: String(c.id_contact) })
        )}`

    return (
        <div className={`min-h-screen p-6 ${dark ? 'bg-neutral-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <QrCode size={28} />
                Générer un badge QR
            </h1>

            <div className="relative mb-6 max-w-xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    value={query}
                    onChange={handleInput}
                    placeholder="Rechercher par nom ou prénom…"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${dark
                        ? 'bg-neutral-800 border-neutral-700 text-white placeholder-neutral-500'
                        : 'bg-white border-gray-300'}`}
                />
            </div>

            {loading && <p className="text-sm text-gray-400 mb-4">Recherche…</p>}

            {!loading && query.length >= 2 && results.length === 0 && (
                <p className="text-sm text-gray-400 mb-4">Aucun résultat pour « {query} »</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl">
                {results.map((p) => {
                    const c = p.contact
                    return (
                        <button
                            key={c.id_contact}
                            onClick={() => setSelected(p)}
                            className={`text-left p-4 rounded-xl border transition-all hover:scale-[1.02] ${dark
                                ? 'bg-neutral-800 border-neutral-700 hover:border-blue-500'
                                : 'bg-white border-gray-200 hover:border-blue-400 shadow-sm'}`}
                        >
                            <div className="flex items-center gap-3">
                                {c.photo
                                    ? <img src={`${DIR_IMG}${c.photo}`} alt="" className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                                    : <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                        <User size={20} className="text-blue-500" />
                                    </div>
                                }
                                <div className="min-w-0">
                                    <p className="font-semibold truncate">{c.prenom} {c.nom}</p>
                                    <p className="text-xs text-gray-400 truncate">{c.societe}</p>
                                </div>
                            </div>
                            <p className="mt-3 text-xs text-blue-500 flex items-center gap-1">
                                <QrCode size={13} /> Générer QR Code
                            </p>
                        </button>
                    )
                })}
            </div>

            {selected && (
                <div
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setSelected(null)}
                >
                    <div
                        className={`relative p-6 rounded-2xl shadow-2xl max-w-xs w-full ${dark ? 'bg-neutral-900 text-white' : 'bg-white'}`}
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setSelected(null)}
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                        >
                            <X size={20} />
                        </button>
                        <div className="text-center">
                            <p className="font-bold text-lg">{selected.contact.prenom} {selected.contact.nom}</p>
                            <p className="text-sm text-gray-400 mb-4">{selected.contact.societe}</p>
                            <img
                                src={qrSrc(selected.contact)}
                                alt="QR Code"
                                className="mx-auto rounded-xl w-56 h-56"
                            />
                            <div className={`mt-4 rounded-lg p-3 text-xs text-left font-mono ${dark ? 'bg-neutral-800' : 'bg-gray-50'}`}>
                                <p className="text-gray-400">id_event : <span className="text-blue-400">{eventId}</span></p>
                                <p className="text-gray-400">id_conferencier : <span className="text-blue-400">{selected.contact.id_contact}</span></p>
                            </div>
                            <a
                                href={qrSrc(selected.contact)}
                                download={`qr_${selected.contact.id_contact}.png`}
                                className="mt-4 inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium"
                            >
                                <Download size={15} /> Télécharger
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

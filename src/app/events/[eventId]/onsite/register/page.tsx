'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Printer, Loader2, XCircle, RefreshCw, Mail, UserPlus } from 'lucide-react'
import { API_URL } from '@/utils/api'
import { EVENT_CONFIG } from '@/config/events'

const DEFAULT_STATUT = 143

type FieldKey = 'prenom' | 'nom' | 'mail' | 'societe' | 'fonction' | 'pays' | 'ville' | 'port'
type FormState = Record<FieldKey, string>

const BASE_FIELDS: { key: FieldKey; label: string; type: string; required: boolean }[] = [
    { key: 'prenom', label: 'Prénom', type: 'text', required: true },
    { key: 'nom', label: 'Nom', type: 'text', required: true },
    { key: 'mail', label: 'Email', type: 'email', required: true },
    { key: 'societe', label: 'Société', type: 'text', required: true },
]

const EXTRA_FIELDS: { key: FieldKey; label: string; type: string; required: boolean }[] = [
    { key: 'fonction', label: 'Fonction', type: 'text', required: false },
    { key: 'pays', label: 'Pays', type: 'text', required: false },
    { key: 'ville', label: 'Ville', type: 'text', required: false },
    { key: 'port', label: 'Mobile', type: 'tel', required: false },
]

const emptyForm: FormState = {
    prenom: '', nom: '', mail: '', societe: '', fonction: '', pays: '', ville: '', port: '',
}

type Phase = 'form' | 'submitting' | 'redirecting' | 'error'

export default function OnsiteRegisterPage() {
    const { eventId } = useParams<{ eventId: string }>()
    const cfg = EVENT_CONFIG[eventId] ?? {}
    const extraKeys = new Set(cfg.onsiteExtraFields ?? [])
    const fields = [...BASE_FIELDS, ...EXTRA_FIELDS.filter(f => extraKeys.has(f.key))]

    const [form, setForm] = useState<FormState>(emptyForm)
    const [phase, setPhase] = useState<Phase>('form')
    const [errorMsg, setErrorMsg] = useState('')

    const handleChange = (key: FieldKey, value: string) =>
        setForm(f => ({ ...f, [key]: value }))

    const reset = () => {
        setForm(emptyForm)
        setPhase('form')
        setErrorMsg('')
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setPhase('submitting')
        setErrorMsg('')

        try {
            // 1. Création du contact
            const contactRes = await fetch(`${API_URL}?action=createContact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            })
            const contactData = JSON.parse(await contactRes.text())
            const id_contact =
                typeof contactData === 'string' || typeof contactData === 'number'
                    ? parseInt(String(contactData), 10)
                    : contactData?.id_contact
            if (!id_contact) throw new Error('La création du contact a échoué.')

            // 2. Inscription à l'event (sans conf_event)
            const confRes = await fetch(`${API_URL}?action=createConferencier`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_contact, id_conf_event: '', statut: cfg.onsiteDefaultStatut ?? DEFAULT_STATUT, id_event: eventId }),
            })
            const confRaw = JSON.parse(await confRes.text())
            const id_conferencier =
                typeof confRaw === 'string' || typeof confRaw === 'number'
                    ? parseInt(String(confRaw), 10)
                    : confRaw?.id_conferencier
            if (!id_conferencier) throw new Error("L'association contact/créneau a échoué.")

            // 3. Presta
            await fetch(`${API_URL}?action=createPresta`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_contact }),
            })

            // 4. Token badge (autoprint) + redirection vers l'impression directe
            const tokenRes = await fetch('/saas/api/badge/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_event: String(eventId), id_contact: String(id_contact), autoprint: true }),
            })
            const tokenData = await tokenRes.json()
            if (!tokenData.token) throw new Error("La génération du badge a échoué.")

            setPhase('redirecting')
            window.location.href = `/saas/print/badge/${eventId}?t=${encodeURIComponent(tokenData.token)}`
        } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : 'Une erreur est survenue.')
            setPhase('error')
        }
    }

    if (phase === 'error') {
        return (
            <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-6 bg-background">
                <div className="w-full max-w-md text-center space-y-6">
                    <XCircle size={64} className="text-destructive mx-auto" />
                    <h1 className="text-2xl font-bold">Une erreur est survenue</h1>
                    <p className="text-muted-foreground text-sm">{errorMsg}</p>
                    <button
                        onClick={reset}
                        className="mx-auto flex items-center gap-2 px-6 py-3 rounded-2xl border font-medium hover:bg-muted active:scale-95 transition-transform"
                    >
                        <RefreshCw size={16} /> Recommencer
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-6 bg-background">
            <div className="w-full max-w-md space-y-6">
                {phase === 'form' && (
                    <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-muted">
                        <Link
                            href={`/events/${eventId}/onsite/kiosk`}
                            className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-muted-foreground hover:text-foreground hover:bg-card/60 active:scale-95 transition-transform"
                        >
                            <Mail size={16} /> Je suis déjà inscrit(e)
                        </Link>
                        <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-card font-semibold text-sm shadow-sm">
                            <UserPlus size={16} /> Je m&apos;inscris sur place
                        </div>
                    </div>
                )}

                <div className="text-center space-y-2">
                    <Printer size={48} className="mx-auto text-primary" />
                    <h1 className="text-2xl font-bold">Inscription sur place</h1>
                    <p className="text-muted-foreground text-sm">
                        Renseignez vos informations, votre badge sera imprimé immédiatement.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {fields.map(({ key, label, type, required }) => (
                        <div key={key}>
                            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                                {label}{required && <span className="text-destructive"> *</span>}
                            </label>
                            <input
                                type={type}
                                required={required}
                                value={form[key]}
                                onChange={e => handleChange(key, e.target.value)}
                                disabled={phase !== 'form'}
                                className="w-full px-4 py-3 rounded-xl border bg-card text-base focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                            />
                        </div>
                    ))}

                    <button
                        type="submit"
                        disabled={phase !== 'form'}
                        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-lg bg-primary text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-transform"
                    >
                        {phase === 'submitting' || phase === 'redirecting'
                            ? <><Loader2 size={20} className="animate-spin" /> {phase === 'redirecting' ? 'Impression…' : 'Inscription…'}</>
                            : <><Printer size={20} /> M&apos;inscrire et imprimer mon badge</>}
                    </button>
                </form>
            </div>
        </div>
    )
}

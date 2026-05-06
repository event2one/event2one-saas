'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import { API_URL } from '@/utils/api'
import { IdDocumentUpload } from '@/components/id-document-upload'

const LINKEDIN_CLIENT_ID = '78eqa2rddcgy4s'
const LINKEDIN_SCOPE = 'openid profile email'
const UPLOAD_API_URL = 'https://manager.event2one.com/videos/upload-to-youtube/upload_api.php'
const UPLOAD_API_KEY = 'mgv_yt_upload_2026'

const FIELDS = [
    { key: 'prenom',      label: 'Prénom',                                 required: true,  type: 'text'  },
    { key: 'nom',         label: 'Nom',                                    required: true,  type: 'text'  },
    { key: 'societe',     label: 'Société',                                required: true,  type: 'text'  },
    { key: 'fonction',    label: 'Fonction / Titre',                       required: false, type: 'text'  },
    { key: 'mail',        label: 'Email',                                  required: true,  type: 'email' },
    { key: 'port',        label: 'Mobile',                                 required: false, type: 'tel'   },
    { key: 'sn_linkedin', label: 'Profil LinkedIn',                        required: false, type: 'url',  placeholder: 'https://www.linkedin.com/in/...' },
    //{ key: 'punchline',   label: 'Thème / Punchline de votre intervention',required: false, type: 'text', full: true },
] as const

type FieldKey = typeof FIELDS[number]['key']
type FormState = Record<FieldKey, string>

const LI_FILLABLE = new Set<FieldKey>(['prenom', 'nom', 'mail', 'sn_linkedin', 'fonction', 'societe'])

type LiProfile = {
    prenom?: string
    nom?: string
    mail?: string
    sn_linkedin?: string
    fonction?: string
    societe?: string
    photo?: string
}

const LinkedInIcon = () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white shrink-0">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
)

export default function RegisterPage() {
    const { eventId } = useParams<{ eventId: string }>()

    const [form, setForm] = useState<FormState>(
        () => Object.fromEntries(FIELDS.map(f => [f.key, ''])) as FormState
    )
    const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle')
    const [errorMsg, setErrorMsg] = useState('')
    const [liProfile, setLiProfile] = useState<LiProfile | null>(null)
    const [liLoading, setLiLoading] = useState(false)
    const [liError, setLiError] = useState('')
    const popupRef = useRef<Window | null>(null)

    const handleChange = (key: FieldKey, value: string) =>
        setForm(f => ({ ...f, [key]: value }))

    // ─── LinkedIn OAuth ──────────────────────────────────────────────────────

    const handleLinkedInConnect = () => {
        const redirectUri = window.location.origin + '/saas/linkedin-callback'
        const state = Math.random().toString(36).substring(2, 18)
        sessionStorage.setItem('linkedin_oauth_state', state)

        const qs = new URLSearchParams({
            response_type: 'code',
            client_id: LINKEDIN_CLIENT_ID,
            redirect_uri: redirectUri,
            scope: LINKEDIN_SCOPE,
            state,
        })
        popupRef.current = window.open(
            `https://www.linkedin.com/oauth/v2/authorization?${qs}`,
            'linkedin_auth',
            'width=600,height=700,top=100,left=300'
        )
        setLiLoading(true)
        setLiError('')
    }

    useEffect(() => {
        const handleMessage = async (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return
            if (event.data?.type !== 'linkedin_callback') return

            const { code, state, error } = event.data
            if (error || !code) {
                setLiLoading(false)
                setLiError('Connexion LinkedIn annulée.')
                return
            }
            if (state !== sessionStorage.getItem('linkedin_oauth_state')) {
                setLiLoading(false)
                setLiError('Erreur de sécurité OAuth (state mismatch).')
                return
            }
            sessionStorage.removeItem('linkedin_oauth_state')

            try {
                const redirectUri = window.location.origin + '/saas/linkedin-callback'
                const fd = new FormData()
                fd.append('code', code)
                fd.append('redirect_uri', redirectUri)
                const res = await fetch(`${UPLOAD_API_URL}?action=linkedin_token_exchange`, {
                    method: 'POST',
                    headers: { 'X-Api-Key': UPLOAD_API_KEY },
                    body: fd,
                })
                const data: LiProfile & { error?: string; detail?: unknown } = await res.json()
                if (data.error) throw new Error(data.error)

                setLiProfile(data)
                setForm(f => ({
                    ...f,
                    ...(data.prenom      ? { prenom:      data.prenom }      : {}),
                    ...(data.nom         ? { nom:         data.nom }         : {}),
                    ...(data.mail        ? { mail:        data.mail }        : {}),
                    ...(data.sn_linkedin ? { sn_linkedin: data.sn_linkedin } : {}),
                    ...(data.fonction    ? { fonction:    data.fonction }    : {}),
                    ...(data.societe     ? { societe:     data.societe }     : {}),
                }))
            } catch (e) {
                setLiError('Impossible de récupérer le profil LinkedIn : ' + (e instanceof Error ? e.message : ''))
            } finally {
                setLiLoading(false)
            }
        }

        window.addEventListener('message', handleMessage)
        return () => window.removeEventListener('message', handleMessage)
    }, [])

    // ─── Submit ──────────────────────────────────────────────────────────────

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setStatus('submitting')
        setErrorMsg('')

        try {
            // 1. Create or find contact
            const contactRes = await fetch(`${API_URL}?action=createContact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    ...(liProfile?.photo ? { photo_linkedin: liProfile.photo } : {}),
                }),
            })
            const contactData = JSON.parse(await contactRes.text())
            const id_contact =
                typeof contactData === 'string' || typeof contactData === 'number'
                    ? parseInt(String(contactData), 10)
                    : contactData?.id_contact
            if (!id_contact) throw new Error('La création du contact a échoué.')

            // 2. Create conf event slot
            const ceRes = await fetch(`${API_URL}?action=createConfEvent`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_event: eventId }),
            })
            const id_conf_event = parseInt(JSON.parse(await ceRes.text()), 10)
            if (!id_conf_event) throw new Error('La création du créneau a échoué.')

            // 3. Link contact to slot
            const confRes = await fetch(`${API_URL}?action=createConferencier`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_contact, id_conf_event, statut: 143, id_event: eventId }),
            })
            const confRaw = JSON.parse(await confRes.text())
            const id_conferencier =
                typeof confRaw === 'string' || typeof confRaw === 'number'
                    ? parseInt(String(confRaw), 10)
                    : confRaw?.id_conferencier
            if (!id_conferencier) throw new Error("L'association contact/créneau a échoué.")

            // 4. Create presta
            await fetch(`${API_URL}?action=createPresta`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_contact }),
            })

            setStatus('done')
        } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : 'Une erreur est survenue.')
            setStatus('error')
        }
    }

    // ─── Success screen ──────────────────────────────────────────────────────

    if (status === 'done') {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center px-4">
                <div className="bg-card border rounded-2xl max-w-md w-full p-8 text-center space-y-4">
                    <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
                        <CheckCircle className="w-7 h-7 text-green-600 dark:text-green-400" />
                    </div>
                    <h1 className="text-xl font-bold">Inscription confirmée !</h1>
                    <p className="text-muted-foreground text-sm">
                        Merci <strong>{form.prenom} {form.nom}</strong>. Notre équipe vous contactera pour confirmer les détails.
                    </p>
                    <Link
                        href={`/events/${eventId}`}
                        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mt-2"
                    >
                        <ArrowLeft size={14} /> Retour à l'événement
                    </Link>
                </div>
            </div>
        )
    }

    // ─── Form ────────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-background px-4 py-12">
            <div className="max-w-xl mx-auto space-y-6">

                <div>
                    <Link
                        href={`/events/${eventId}`}
                        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"
                    >
                        <ArrowLeft size={14} /> Retour
                    </Link>
                    <h1 className="text-2xl font-bold">Inscription</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Enregistrez votre participation à cet événement.
                    </p>
                </div>

                {/* LinkedIn connect */}
                {!liProfile ? (
                    <div className="bg-card border rounded-2xl p-5 text-center space-y-4">
                        <div className="space-y-0.5">
                            <p className="text-sm font-semibold">Inscription rapide</p>
                            <p className="text-xs text-muted-foreground">
                                Pré-remplissez le formulaire avec votre profil LinkedIn
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={handleLinkedInConnect}
                            disabled={liLoading}
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm text-white bg-[#0A66C2] hover:bg-[#004182] disabled:opacity-60 transition-colors w-full max-w-xs mx-auto"
                        >
                            {liLoading ? (
                                <>
                                    <svg className="w-4 h-4 animate-spin fill-white" viewBox="0 0 24 24">
                                        <path d="M12 2a10 10 0 0 1 10 10h-2a8 8 0 0 0-8-8V2z" />
                                    </svg>
                                    Connexion…
                                </>
                            ) : (
                                <><LinkedInIcon /> Continuer avec LinkedIn</>
                            )}
                        </button>
                        {liError && <p className="text-xs text-destructive">{liError}</p>}
                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-px bg-border" />
                            <span className="text-xs text-muted-foreground">ou remplir manuellement</span>
                            <div className="flex-1 h-px bg-border" />
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 bg-[#0A66C2]/8 border border-[#0A66C2]/20 rounded-xl px-4 py-3">
                        {liProfile.photo ? (
                            <img src={liProfile.photo} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-[#0A66C2] flex items-center justify-center shrink-0">
                                <LinkedInIcon />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{liProfile.prenom} {liProfile.nom}</p>
                            <p className="text-xs text-[#0A66C2]">Connecté via LinkedIn · formulaire pré-rempli</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => { setLiProfile(null); setLiError('') }}
                            className="text-xs text-muted-foreground hover:text-foreground shrink-0"
                        >
                            Déconnecter
                        </button>
                    </div>
                )}

                {/* ID document */}
                <IdDocumentUpload />

                {/* Form */}
                <div className="bg-card border rounded-2xl p-6 md:p-8">
                    <p className="text-sm text-muted-foreground mb-6">
                        Remplissez le formulaire ci-dessous pour enregistrer votre demande.
                        Notre équipe vous recontactera pour confirmer votre participation.
                    </p>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {FIELDS.map((field) => {
                                const { key, label, required, type } = field
                                const placeholder = 'placeholder' in field ? field.placeholder : undefined
                                const full = 'full' in field ? (field as { full?: boolean }).full : false
                                return (
                                <div key={key} className={full ? 'sm:col-span-2' : ''}>
                                    <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mb-1.5">
                                        {label}
                                        {required && <span className="text-destructive">*</span>}
                                        {liProfile && LI_FILLABLE.has(key) && form[key] && (
                                            <span className="ml-auto text-[10px] font-medium text-[#0A66C2]">
                                                LinkedIn
                                            </span>
                                        )}
                                    </label>
                                    <input
                                        type={type}
                                        required={required}
                                        placeholder={placeholder ?? ''}
                                        value={form[key]}
                                        onChange={e => handleChange(key, e.target.value)}
                                        className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                                    />
                                </div>
                                )
                            })}
                        </div>

                        {status === 'error' && (
                            <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                                {errorMsg}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={status === 'submitting'}
                            className="w-full py-3 text-sm font-semibold text-primary-foreground bg-primary hover:opacity-90 rounded-lg transition-opacity disabled:opacity-50 mt-2"
                        >
                            {status === 'submitting' ? 'Envoi en cours…' : 'Confirmer mon inscription'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

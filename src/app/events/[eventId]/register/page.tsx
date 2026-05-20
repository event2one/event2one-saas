'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import { API_URL } from '@/utils/api'
import { IdDocumentUpload, type DocumentType } from '@/components/id-document-upload'
import ProgramGridSelector from '@/components/ProgramGridSelector'
import { type EventConfig, EVENT_CONFIG } from '@/config/events'

const LINKEDIN_CLIENT_ID = '78eqa2rddcgy4s'
const LINKEDIN_SCOPE = 'openid profile email'
const UPLOAD_API_URL = 'https://manager.event2one.com/videos/upload-to-youtube/upload_api.php'
const UPLOAD_API_KEY = 'mgv_yt_upload_2026'



const FIELDS = [
    { key: 'prenom',         label: 'Prénom',                                 required: true,  type: 'text'  },
    { key: 'nom',            label: 'Nom',                                    required: true,  type: 'text'  },
    { key: 'societe',        label: 'Société',                                required: true,  type: 'text'  },
    { key: 'fonction',       label: 'Fonction / Titre',                       required: false, type: 'text'  },
    { key: 'mail',           label: 'Email',                                  required: true,  type: 'email' },
    { key: 'port',           label: 'Mobile',                                 required: false, type: 'tel'   },
    { key: 'date_naissance', label: 'Date de naissance',                      required: false, type: 'date'  },
    { key: 'pays_naissance', label: 'Pays de naissance',                      required: false, type: 'text',  placeholder: 'Ex : France, Maroc, Italie…'  },
    { key: 'ville_naissance',label: 'Ville de naissance',                     required: false, type: 'text',  placeholder: 'Ex : Paris, Casablanca, Rome…' },
    { key: 'sn_linkedin',    label: 'Profil LinkedIn',                        required: false, type: 'url',  placeholder: 'https://www.linkedin.com/in/...' },
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

type EventContactType = {
    id_event_contact_type: string
    libelle: string
}

const LinkedInIcon = () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white shrink-0">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
)

function buildConfirmationHtml(cfg: EventConfig, form: FormState, badgeUrl: string | null): string {
    const color = cfg.primaryColor ?? '#1a56db'
    const logo = cfg.email?.logoUrl
    const headerImageUrl = cfg.headerImageUrl
    const footerImageUrl = cfg.footerImageUrl
    const eventName = cfg.email?.eventName ?? 'l\'événement'
    const intro = cfg.email?.introText ?? `Nous avons bien reçu votre inscription à ${eventName} et nous vous en remercions.`
    const contactEmail = cfg.email?.contactEmail ?? 'contact@mlg-consulting.com'
    const signatureName = cfg.email?.signatureName ?? 'Notre équipe'
    const hideBadgeCta = cfg.email?.hideBadgeCta ?? false
    const ctaUrl = cfg.email?.ctaUrl
    const ctaLabel = cfg.email?.ctaLabel ?? 'En savoir plus'

    const introParagraphs = intro.split('\n\n')
        .map(p => `<p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;font-family:Verdana,Tahoma,Arial,sans-serif">${p.replace(/\n/g, '<br>')}</p>`)
        .join('')

    const ctaBlock = !hideBadgeCta && badgeUrl ? `
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4ff;border:1px solid #c7d2fe;border-radius:10px;margin-bottom:28px">
            <tr><td style="padding:24px;text-align:center">
              <p style="margin:0 0 6px;font-size:14px;font-weight:700;color:#374151;font-family:Verdana,Tahoma,Arial,sans-serif">Votre e-badge personnalisé</p>
              <p style="margin:0 0 16px;font-size:13px;color:#6b7280;font-family:Verdana,Tahoma,Arial,sans-serif">Imprimez votre badge A4 pliable à glisser dans votre porte-badge.</p>
              <a href="${badgeUrl}" style="display:inline-block;background:${color};color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:12px 28px;border-radius:8px">Imprimer mon badge</a>
            </td></tr>
          </table>` : ctaUrl ? `
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px">
            <tr><td style="text-align:center">
              <a href="${ctaUrl}" style="display:inline-block;background:${color};color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:12px 28px;border-radius:8px">${ctaLabel}</a>
            </td></tr>
          </table>` : ''

    return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Verdana,Tahoma,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);margin:0 auto">
        <!-- Header -->
        ${headerImageUrl
            ? `<tr><td style="padding:0;line-height:0"><img src="${headerImageUrl}" alt="" width="600" style="width:100%;max-width:600px;display:block"></td></tr>`
            : `<tr><td style="background:${color};padding:32px 40px;text-align:center">
          ${logo ? `<img src="${logo}" alt="" style="max-height:60px;max-width:200px;margin-bottom:16px;display:block;margin-left:auto;margin-right:auto">` : ''}
          <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700">Inscription confirmée</h1>
        </td></tr>`}
        <!-- Body -->
        <tr><td style="padding:40px">
          <p style="margin:0 0 16px;font-size:15px;color:#374151;font-family:Verdana,Tahoma,Arial,sans-serif">Bonjour <strong>${form.prenom} ${form.nom}</strong>,</p>
          ${introParagraphs}
          ${ctaBlock}
          <p style="margin:28px 0 0;font-size:14px;color:#6b7280;line-height:1.6;font-family:Verdana,Tahoma,Arial,sans-serif">
            Bien cordialement,<br><strong>${signatureName}</strong>${contactEmail ? `<br><a href="mailto:${contactEmail}" style="color:${color};font-family:Verdana,Tahoma,Arial,sans-serif">${contactEmail}</a>` : ''}
          </p>
        </td></tr>
        <!-- Footer -->
        ${footerImageUrl
            ? `<tr><td style="padding:0;line-height:0"><img src="${footerImageUrl}" alt="" width="600" style="width:100%;max-width:600px;display:block"></td></tr>`
            : `<tr><td style="padding:20px 40px;border-top:1px solid #e5e7eb;text-align:center">
          <p style="margin:0;font-size:11px;color:#9ca3af">Cet email vous a été envoyé suite à votre inscription à ${eventName}.<br>Powered by <strong>event2one</strong></p>
        </td></tr>`}
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

const DEFAULT_CONFIG: EventConfig = {
    showLinkedIn: true,
    showIdDocument: false,
    requireIdDocument: false,
    hiddenFields: ['date_naissance', 'pays_naissance', 'ville_naissance'],
    requiredFields: [],
}

function RegisterPageInner() {
    const { eventId } = useParams<{ eventId: string }>()
    const searchParams = useSearchParams()
    const isEmbed = searchParams.get('embed') === '1'

    const eventCfg = { ...DEFAULT_CONFIG, ...(EVENT_CONFIG[eventId] ?? {}) }
    const { showLinkedIn, showIdDocument, requireIdDocument, primaryColor, primaryForeground } = eventCfg
    const hiddenFields = new Set<string>(eventCfg.hiddenFields ?? [])
    const requiredFields = new Set<string>(eventCfg.requiredFields ?? [])

    useEffect(() => {
        if (isEmbed) {
            document.documentElement.classList.add('embed-mode')
        }
        return () => { document.documentElement.classList.remove('embed-mode') }
    }, [isEmbed])

    const [form, setForm] = useState<FormState>(
        () => Object.fromEntries(FIELDS.map(f => [f.key, ''])) as FormState
    )
    const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle')
    const [errorMsg, setErrorMsg] = useState('')
    const [liProfile, setLiProfile] = useState<LiProfile | null>(null)
    const [liLoading, setLiLoading] = useState(false)
    const [liError, setLiError] = useState('')

    const [countries, setCountries] = useState<string[]>([])
    const [participationTypes, setParticipationTypes] = useState<EventContactType[]>([])
    const [participationTypeId, setParticipationTypeId] = useState('')
    const [selectedSessions, setSelectedSessions] = useState<string[]>([])
    const [idDoc, setIdDoc] = useState<{ front: File | null; back: File | null; docType: DocumentType }>({
        front: null, back: null, docType: 'id_card',
    })
    const idDocRef = useRef(idDoc)
    idDocRef.current = idDoc

    useEffect(() => {
        fetch(`${API_URL}?action=getCountries`)
            .then(r => r.json())
            .then((data: unknown) => {
                if (Array.isArray(data))
                    setCountries(data.map((c: unknown) => typeof c === 'string' ? c : String((c as Record<string,unknown>).libelle ?? (c as Record<string,unknown>).name ?? c)))
            })
            .catch(() => {})
    }, [])

    useEffect(() => {
        fetch(`${API_URL}?action=getEventContactTypeList&filter=${encodeURIComponent('WHERE id_event_contact_type IN (143, 466, 467)')}`)
            .then(r => r.json())
            .then((data: EventContactType[]) => {
                if (Array.isArray(data) && data.length > 0) {
                    setParticipationTypes(data)
                    setParticipationTypeId(data[0].id_event_contact_type)
                }
            })
            .catch(() => {})
    }, [])


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
        if (requireIdDocument && !idDocRef.current.front) {
            setErrorMsg('Une pièce d\'identité est obligatoire pour valider l\'inscription.')
            setStatus('error')
            return
        }

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

            // 2. Register contact to each selected session (or create a generic slot if none selected)
            if (selectedSessions.length > 0) {
                // Register in each chosen session from the program grid
                for (const id_conf_event of selectedSessions) {
                    const confRes = await fetch(`${API_URL}?action=createConferencier`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id_contact, id_conf_event, statut: participationTypeId || 143, id_event: eventId }),
                    })
                    const confRaw = JSON.parse(await confRes.text())
                    const id_conferencier =
                        typeof confRaw === 'string' || typeof confRaw === 'number'
                            ? parseInt(String(confRaw), 10)
                            : confRaw?.id_conferencier
                    if (!id_conferencier) throw new Error(`Inscription à la session ${id_conf_event} échouée.`)
                }
            } else {
                // Fallback: create a generic slot and link the contact
                const ceRes = await fetch(`${API_URL}?action=createConfEvent`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id_event: eventId }),
                })
                const id_conf_event = parseInt(JSON.parse(await ceRes.text()), 10)
                if (!id_conf_event) throw new Error('La création du créneau a échoué.')

                const confRes = await fetch(`${API_URL}?action=createConferencier`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id_contact, id_conf_event, statut: participationTypeId || 143, id_event: eventId }),
                })
                const confRaw = JSON.parse(await confRes.text())
                const id_conferencier =
                    typeof confRaw === 'string' || typeof confRaw === 'number'
                        ? parseInt(String(confRaw), 10)
                        : confRaw?.id_conferencier
                if (!id_conferencier) throw new Error("L'association contact/créneau a échoué.")
            }

            // 3. Create presta
            await fetch(`${API_URL}?action=createPresta`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_contact }),
            })

            // 4. Upload identity document if provided
            const doc = idDocRef.current
            const uploadVisuel = (file: File, field: string) => {
                const fd = new FormData()
                fd.append('id_contact', String(id_contact))
                fd.append(field, file)
                return fetch(`${API_URL}?action=updateContactVisuel`, { method: 'POST', body: fd })
            }
            if (doc.front) {
                const field = doc.docType === 'id_card' ? 'id_card_recto' : 'passeport'
                await uploadVisuel(doc.front, field)
            }
            if (doc.back && doc.docType === 'id_card') {
                await uploadVisuel(doc.back, 'id_card_verso')
            }

            // 5. Send confirmation email (fire-and-forget — ne bloque pas l'inscription)
            if (form.mail && eventCfg.email) {
                ;(async () => {
                    let badgeUrl: string | null = null
                    try {
                        const tokenRes = await fetch('/saas/api/badge/token', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id_event: eventId, id_contact: String(id_contact) }),
                        })
                        const tokenData = await tokenRes.json()
                        if (tokenData.token) {
                            badgeUrl = `${window.location.origin}/saas/print/badge/${eventId}?t=${encodeURIComponent(tokenData.token)}`
                        }
                    } catch { /* badge URL optionnelle */ }

                    fetch(`${API_URL}?action=sendEmailNotification`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            dest: form.mail,
                            subject: eventCfg.email!.subject,
                            body: buildConfirmationHtml(eventCfg, form, badgeUrl),
                        }),
                    }).catch(() => {})
                })()
            }

            setStatus('done')
        } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : 'Une erreur est survenue.')
            setStatus('error')
        }
    }

    // ─── Success screen ──────────────────────────────────────────────────────

    if (status === 'done') {
        return (
            <div className={isEmbed ? 'bg-background py-4' : 'min-h-screen bg-background flex items-center justify-center px-4'}>
                <div className={`bg-card border rounded-2xl overflow-hidden text-center ${isEmbed ? 'w-full' : 'max-w-md w-full'}`}>
                    {eventCfg.headerImageUrl && (
                        <img src={eventCfg.headerImageUrl} alt="" className="w-full block" />
                    )}
                    <div className="px-8 py-6 space-y-4">
                        <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
                            <CheckCircle className="w-7 h-7 text-green-600 dark:text-green-400" />
                        </div>
                        <h1 className="text-xl font-bold">Inscription confirmée !</h1>
                        {eventCfg.confirmationMessage ? (
                            <div className="text-muted-foreground text-sm space-y-2 text-left">
                                {eventCfg.confirmationMessage.split('\n\n').map((p, i) => (
                                    <p key={i}>{p}</p>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-sm">
                                Merci <strong>{form.prenom} {form.nom}</strong>. Notre équipe vous contactera pour confirmer les détails.
                            </p>
                        )}
                        {!isEmbed && (
                            <Link
                                href={`/events/${eventId}`}
                                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mt-2"
                            >
                                <ArrowLeft size={14} /> Retour à l&apos;événement
                            </Link>
                        )}
                    </div>
                    {eventCfg.footerImageUrl && (
                        <img src={eventCfg.footerImageUrl} alt="" className="w-full block" />
                    )}
                </div>
            </div>
        )
    }

    // ─── Form ────────────────────────────────────────────────────────────────

    return (
        <div className={isEmbed ? 'bg-background px-4 py-8' : 'min-h-screen bg-background px-4 py-12'}>
            <div className={isEmbed ? 'w-full space-y-6' : 'max-w-xl mx-auto space-y-6'}>

                <div>
                    {!isEmbed && (
                        <Link
                            href={`/events/${eventId}`}
                            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"
                        >
                            <ArrowLeft size={14} /> Retour
                        </Link>
                    )}
                    {!isEmbed && (
                        <>
                            <h1 className="text-2xl font-bold">Inscription</h1>
                            <p className="text-muted-foreground text-sm mt-1">
                                Enregistrez votre participation à cet événement.
                            </p>
                        </>
                    )}
                </div>

                {/* LinkedIn connect */}
                {showLinkedIn && (!liProfile ? (
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
                ))}

                {/* Form */}
                <div className="bg-card border rounded-2xl p-6 md:p-8">
                    <p className="text-sm text-muted-foreground mb-6">
                        Remplissez le formulaire ci-dessous pour enregistrer votre inscription.
                        Notre équipe vous recontactera pour confirmer votre participation.
                    </p>
                    <form id="register-form" onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {participationTypes.length > 0 && (
                                <div className="sm:col-span-2">
                                    <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mb-1.5">
                                        Type de participation
                                        <span className="text-destructive">*</span>
                                    </label>
                                    <select
                                        required
                                        value={participationTypeId}
                                        onChange={e => setParticipationTypeId(e.target.value)}
                                        className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                                    >
                                        {participationTypes.map(t => (
                                            <option key={t.id_event_contact_type} value={t.id_event_contact_type}>
                                                {t.libelle}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            {FIELDS.filter(f => !hiddenFields.has(f.key)).map((field) => {
                                const { key, label, type } = field
                                const required = field.required || requiredFields.has(key)
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
                                        list={key === 'pays_naissance' ? 'pays-naissance-list' : undefined}
                                        className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                                    />
                                    {key === 'pays_naissance' && (
                                        <datalist id="pays-naissance-list">
                                            {countries.map(c => <option key={c} value={c} />)}
                                        </datalist>
                                    )}
                                </div>
                                )
                            })}
                        </div>

                    </form>
                </div>

                {/* Program grid */}
                <div className="bg-card border rounded-2xl p-6 md:p-8 space-y-4">
                    <div>
                        <p className="text-sm font-semibold">Programme de l&apos;événement</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Sélectionnez les sessions auxquelles vous souhaitez participer.
                        </p>
                    </div>
                    <ProgramGridSelector
                        eventId={eventId}
                        onSelectionChange={setSelectedSessions}
                    />
                </div>

                {/* ID document */}
                {showIdDocument && (
                    <IdDocumentUpload
                        required={requireIdDocument}
                        onFilesChange={(front, back, docType) => setIdDoc({ front, back, docType })}
                    />
                )}

                {status === 'error' && (
                    <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                        {errorMsg}
                    </p>
                )}

                <button
                    type="submit"
                    form="register-form"
                    disabled={status === 'submitting'}
                    style={primaryColor ? { backgroundColor: primaryColor, color: primaryForeground ?? '#ffffff' } : undefined}
                    className="w-full py-3 text-sm font-semibold text-primary-foreground bg-primary hover:opacity-90 rounded-lg transition-opacity disabled:opacity-50"
                >
                    {status === 'submitting' ? 'Envoi en cours…' : 'Confirmer mon inscription'}
                </button>

                {/* Mention CNIL */}
                <div className="text-sm text-muted-foreground leading-relaxed border-t pt-4 space-y-2">
                    <p>
                        Les données récoltées par ce formulaire sont destinées à la Région Hauts-de-France et au CITC et sont traitées dans le cadre de l&apos;organisation du Grand Sommet IA avec NOUS, le 12 juin 2026 à Lille.
                    </p>
                    <p>
                        Elles seront conservées pour une durée de 3 mois à compter de la fin de l&apos;événement auquel vous vous êtes inscrit.
                    </p>
                    <p>
                        Vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;effacement de vos données, de limitation du traitement ou, pour des motifs légitimes, vous opposer au traitement de ces données.
                        Vous pouvez exercer ces droits auprès de{' '}
                        <a href="mailto:web@hautsdefrance.fr" className="underline hover:text-foreground">web@hautsdefrance.fr</a>
                        {' '}ou en contactant le Délégué à la protection des données (DPO) de la Région Hauts-de-France dont les coordonnées sont disponibles sur{' '}
                        <a href="https://www.hautsdefrance.fr/informatique-et-libertes" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">https://www.hautsdefrance.fr/informatique-et-libertes</a>
                    </p>
                    <p>
                        Si, après avoir contacté le DPO, vous estimez que vos droits Informatiques &amp; Libertés ne sont pas respectés ou que le traitement n&apos;est pas conforme aux règles de protection des données, vous pouvez adresser une réclamation auprès de la{' '}
                        <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">CNIL</a>.
                    </p>
                </div>

            </div>
        </div>
    )
}

export default function RegisterPage() {
    return (
        <Suspense>
            <RegisterPageInner />
        </Suspense>
    )
}

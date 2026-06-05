// Shared per-event configuration — used by register page, badge, and email builder.

export type EventConfig = {
    // ── Branding (badge + email + confirmation page) ──────────────────────────
    primaryColor?: string
    primaryForeground?: string
    headerImageUrl?: string
    footerImageUrl?: string
    badgePartnersImageUrl?: string

    // ── Register page ─────────────────────────────────────────────────────────
    showLinkedIn?: boolean
    showProgram?: boolean
    showBadgePhoto?: boolean
    /** Hide the sticky layout header bar on event pages (default: true = visible) */
    showLayoutHeader?: boolean
    /** Zoom factor applied to confirmation page content (e.g. 1.15 = +15%) */
    fontSizeZoom?: number
    showIdDocument?: boolean
    requireIdDocument?: boolean
    /** Activate two-step validation workflow (inscription → retenu/liste_attente/non_retenu) */
    validationWorkflow?: boolean
    /** Email templates sent by the admin for each validation decision */
    validationEmails?: {
        retenu?:        { subject: string; introText: string; ctaUrl?: string; ctaLabel?: string }
        liste_attente?: { subject: string; introText: string }
        non_retenu?:    { subject: string; introText: string }
    }
    /** Keys from the FIELDS array in register/page.tsx */
    hiddenFields?: string[]
    requiredFields?: string[]
    /** Title shown above the form intro */
    formTitle?: string
    /** Intro text shown at the top of the registration form (supports \n\n paragraphs) */
    formIntro?: string
    confirmationTitle?: string
    confirmationMessage?: string
    email?: {
        subject?: string
        logoUrl?: string
        eventName?: string
        salutation?: string
        introText?: string
        fromName?: string
        replyTo?: string
        contactEmail?: string
        signatureName?: string
        closingText?: string
        ctaUrl?: string
        ctaLabel?: string
        hideBadgeCta?: boolean
    }
}

export const EVENT_CONFIG: Record<string, EventConfig> = {
    '2273': {
        primaryColor: '#170b7e',
        primaryForeground: '#d8cfc7',
        headerImageUrl: 'https://www.mlg-consulting.com/manager_cc/docs/archives/260519175100_ia-avec-nous-rs-mailing-bandeau-01.png',
        footerImageUrl: 'https://www.mlg-consulting.com/manager_cc/docs/archives/260519175100_footer.png',
        badgePartnersImageUrl: 'https://www.mlg-consulting.com/manager_cc/docs/archives/260605173331_partenaires-e-billet.png',

        showLinkedIn: false,
        showProgram: false,
        showBadgePhoto: false,
        fontSizeZoom: 1.15,
        showIdDocument: false,
        validationWorkflow: true,
        requireIdDocument: false,
        hiddenFields: ['sn_linkedin', 'port', 'cp','pays_naissance', 'ville_naissance'],
        requiredFields: ['date_naissance', 'fonction'],
        formTitle: 'Enregistrement – Sommet IA avec Nous\nRegistration – IA avec Nous Summit',
        formIntro: 'Remplissez le formulaire ci-dessous pour enregistrer votre inscription. Attention vous devrez impérativement confirmer votre présence 4 jours avant l\'événement, soit le lundi 8 juin pour finaliser votre inscription et recevoir votre badge.\n\nPlease fill in the form below to register your attendance. Please note that you will be required to confirm your presence 4 days before the event — on Monday, June 8th — in order to finalise your registration and receive your badge.',
        confirmationTitle: 'Enregistrement confirmé !',
        confirmationMessage: 'Votre enregistrement au Sommet européen « L\'IA avec NOUS » est bien pris en compte.\n\nNous vous invitons à bien prendre connaissance du mail qui vient de vous être envoyé et qui précise les modalités de réception du badge.\n\n📬 S\'il n\'apparaît pas dans votre boîte de réception dans les prochaines minutes, pensez à vérifier votre dossier courriers indésirables ou spam — en particulier si vous utilisez une adresse professionnelle ou un filtre anti-spam.\n\n―\n\nYour registration for the European Summit "AI With US" has been successfully recorded.\n\nWe invite you to carefully read the email that has just been sent to you, which details the steps to receive your badge.\n\n📬 If it does not appear in your inbox within the next few minutes, please remember to check your junk mail or spam folder — particularly if you are using a professional email address or a spam filter.',

        email: {
            subject: 'Pré-inscription confirmée — Sommet « L\'IA avec NOUS » — 12 juin 2026',
            eventName: 'Sommet « L\'IA avec NOUS »',
            salutation: 'Bonjour,',
            introText: 'Votre enregistrement au Sommet européen l’IA avec NOUS a bien été pris en compte.\n\nVous recevrez un mail quatre jours avant l\'événement soit le lundi 8 juin pour confirmer définitivement votre inscription. Les places étant limitées, pensez à répondre sous 48h — vous recevrez votre badge avec QR Code suite à cette confirmation.\n\nLe programme s\'annonce riche et dense. Nous vous recommandons de bloquer l\'intégralité de votre journée pour profiter de tous les temps forts.\n\nA noter également que le programme est susceptible d\'évoluer jusqu\'au jour J en raison de contraintes liées à l\'agenda de certains de nos officiels.\n\nRetrouvez le programme complet et la liste des intervenants sur <a href="https://ia-avecnous.fr" style="color:#170b7e">ia-avecnous.fr</a>\n\nÀ très bientôt à Lille.\n<strong>L\'équipe « L\'IA avec NOUS »</strong>\n<a href="mailto:contact@ia-avecnous.fr" style="color:#170b7e">contact@ia-avecnous.fr</a>\n\n―\n\nDear,\n\nYour registration for the European AI Summit with US has been successfully recorded..\n\nYou will receive an email four days before the event — on Monday, June 8th — to definitively confirm your registration. As places are limited, please make sure to respond within 48 hours — you will receive your badge with QR Code following this confirmation.\n\nThe programme promises to be rich and packed. We recommend blocking out your entire day to make the most of all the highlights.\n\nPlease also note that the programme may be subject to changes up until the day of the event, due to scheduling constraints of some of our officials.\n\nFind the full programme and list of speakers at <a href="https://ia-avecnous.fr" style="color:#170b7e">ia-avecnous.fr</a>\n\nSee you very soon in Lille.\n<strong>The "AI With US" Team</strong>',
            fromName: 'Grand Sommet IA avec Nous',
            replyTo: 'contact@ia-avecnous.fr',
            contactEmail: '',
            signatureName: '',
            closingText: '',
            hideBadgeCta: true,
        },
    },
}

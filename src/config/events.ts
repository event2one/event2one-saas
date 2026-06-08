// Shared per-event configuration — used by register page, badge, and email builder.

export type EventConfig = {
    // ── Branding (badge + email + confirmation page) ──────────────────────────
    primaryColor?: string
    primaryForeground?: string
    headerImageUrl?: string
    footerImageUrl?: string
    /** Override du pied de page du e-badge uniquement (TR) — si absent, utilise footerImageUrl */
    badgeFooterImageUrl?: string
    badgePartnersImageUrl?: string
    /** Override du panneau "programme" (TL) du e-badge — libellé + texte (supporte \n\n pour les paragraphes) */
    badgeProgramPanel?: { label?: string; text: string }
    /** Masque le panneau bas-droit (dos vCard) du badge A4 */
    hideBadgeBackPanel?: boolean

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
    /**
     * Mode de remise du e-badge après inscription :
     * - 'direct'    : le e-badge (lien + QR) est envoyé immédiatement dans l'email de confirmation d'inscription
     * - 'moderated' : le badge n'est pas inclus à l'inscription — il est remis ultérieurement via la modération
     *                 admin (validationWorkflow) et/ou la relance de confirmation J-4 (routes /confirm, /cancel)
     * Par défaut : 'moderated'
     */
    badgeDelivery?: 'direct' | 'moderated'
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
    /** Si renseigné, affiche un message de clôture à la place du formulaire d'inscription */
    registrationClosed?: {
        title?: string
        introText?: string
        ctaUrl?: string
        ctaLabel?: string
        outroText?: string
    }
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
    }
}

export const EVENT_CONFIG: Record<string, EventConfig> = {
    '2273': {
        primaryColor: '#170b7e',
        primaryForeground: '#d8cfc7',
        headerImageUrl: 'https://www.mlg-consulting.com/manager_cc/docs/archives/260519175100_ia-avec-nous-rs-mailing-bandeau-01.png',
        footerImageUrl: 'https://www.mlg-consulting.com/manager_cc/docs/archives/260519175100_footer.png',
        badgeFooterImageUrl: 'https://www.mlg-consulting.com/manager_cc/docs/archives/260608184134_sans-titre-08-juin-2026-18.00.47-1-.png',
        badgePartnersImageUrl: 'https://www.mlg-consulting.com/manager_cc/docs/archives/260608175408_sans-titre-05-juin-2026-16.32.55.png',
        badgeProgramPanel: {
            label: 'Se rendre au sommet',
            text: 'Retrouvez toutes les informations pour vous rendre au Sommet sur https://ia-avecnous.fr/grand-sommet/lieu/\n\nFind all the information on how to get to the Summit at https://ia-avecnous.fr/grand-sommet/lieu/',
        },
        hideBadgeBackPanel: true,
        badgeDelivery: 'direct',

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
        formIntro: 'Remplissez le formulaire ci-dessous pour enregistrer votre inscription. Vous recevrez immédiatement par email votre billet d\'entrée définitif avec QR Code — à imprimer ou à présenter directement depuis votre téléphone à l\'accueil le jour J.\n\nPlease fill in the form below to register your attendance. You will immediately receive your definitive entry ticket with QR Code by email — to print or show directly from your phone at check-in on the day.',
        confirmationTitle: 'Enregistrement confirmé !',
        confirmationMessage: 'Votre enregistrement au Sommet européen « L\'IA avec NOUS » est bien pris en compte.\n\nNous vous invitons à bien prendre connaissance du mail qui vient de vous être envoyé et qui précise les modalités de réception du badge.\n\n📬 S\'il n\'apparaît pas dans votre boîte de réception dans les prochaines minutes, pensez à vérifier votre dossier courriers indésirables ou spam — en particulier si vous utilisez une adresse professionnelle ou un filtre anti-spam.\n\n―\n\nYour registration for the European Summit "AI With US" has been successfully recorded.\n\nWe invite you to carefully read the email that has just been sent to you, which details the steps to receive your badge.\n\n📬 If it does not appear in your inbox within the next few minutes, please remember to check your junk mail or spam folder — particularly if you are using a professional email address or a spam filter.',

        email: {
            subject: 'Pré-inscription confirmée — Sommet « L\'IA avec NOUS » — 12 juin 2026',
            eventName: 'Sommet « L\'IA avec NOUS »',
            salutation: 'Bonjour,',
            introText: 'Votre enregistrement au Sommet européen l’IA avec NOUS a bien été pris en compte.\n\nVotre billet d\'entrée définitif avec QR Code est joint à cet email — imprimez-le ou présentez-le directement depuis votre téléphone à l\'accueil le jour J.\n\nLe programme s\'annonce riche et dense. Nous vous recommandons de bloquer l\'intégralité de votre journée pour profiter de tous les temps forts.\n\nA noter également que le programme est susceptible d\'évoluer jusqu\'au jour J en raison de contraintes liées à l\'agenda de certains de nos officiels.\n\nRetrouvez le programme complet et la liste des intervenants sur <a href="https://ia-avecnous.fr" style="color:#170b7e">ia-avecnous.fr</a>\n\nÀ très bientôt à Lille.\n<strong>L\'équipe « L\'IA avec NOUS »</strong>\n<a href="mailto:contact@ia-avecnous.fr" style="color:#170b7e">contact@ia-avecnous.fr</a>\n\n―\n\nDear,\n\nYour registration for the European AI Summit with US has been successfully recorded.\n\nYour definitive entry ticket with QR Code is attached to this email — print it or show it directly from your phone at check-in on the day.\n\nThe programme promises to be rich and packed. We recommend blocking out your entire day to make the most of all the highlights.\n\nPlease also note that the programme may be subject to changes up until the day of the event, due to scheduling constraints of some of our officials.\n\nFind the full programme and list of speakers at <a href="https://ia-avecnous.fr" style="color:#170b7e">ia-avecnous.fr</a>\n\nSee you very soon in Lille.\n<strong>The "AI With US" Team</strong>',
            fromName: 'Grand Sommet IA avec Nous',
            replyTo: 'contact@ia-avecnous.fr',
            contactEmail: '',
            signatureName: '',
            closingText: '',
        },
    },
}

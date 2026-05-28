// Shared per-event configuration — used by register page, badge, and email builder.

export type EventConfig = {
    // ── Branding (badge + email + confirmation page) ──────────────────────────
    primaryColor?: string
    primaryForeground?: string
    headerImageUrl?: string
    footerImageUrl?: string

    // ── Register page ─────────────────────────────────────────────────────────
    showLinkedIn?: boolean
    showProgram?: boolean
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
    confirmationMessage?: string
    email?: {
        subject?: string
        logoUrl?: string
        eventName?: string
        introText?: string
        fromName?: string
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

        showLinkedIn: false,
        showProgram: false,
        showIdDocument: false,
        validationWorkflow: true,
        requireIdDocument: false,
        hiddenFields: ['sn_linkedin', 'port'],
        requiredFields: ['date_naissance', 'pays_naissance', 'ville_naissance'],
        confirmationMessage: 'Votre pré-inscription au Sommet européen « L\'IA avec NOUS » est bien enregistrée.\n\nUn email de confirmation vient de vous être envoyé.',

        email: {
            subject: 'Pré-inscription confirmée — Sommet « L\'IA avec NOUS » — 12 juin 2026',
            eventName: 'Sommet « L\'IA avec NOUS »',
            introText: 'Votre pré-inscription au Sommet européen « L\'IA avec NOUS » est bien enregistrée.\n\n<span style="color:#dc2626;font-style:italic">Vous recevrez un mail quatre jours avant l\'événement pour confirmer définitivement votre inscription. Les places étant limitées, pensez à répondre sous 48h — vous recevrez votre billet avec QR Code suite à cette confirmation.</span>\n\nLe programme s\'annonce riche et dense. Nous vous recommandons de <strong>bloquer l\'intégralité de votre journée</strong> <em>pour profiter de tous les temps forts</em>. Une zone dédiée sera disponible pour assurer vos visioconférences et répondre à quelques mails ;) La journée se clôturera par un <strong>cocktail festif à partir de 18h30</strong> — nous vous invitons à rester avec nous pour en profiter pleinement.\n\nA noter également que le programme est susceptible d\'évoluer jusqu\'au jour J en raison de contraintes liées à l\'agenda de certains de nos officiels.\n\nRetrouvez le programme complet et la liste des intervenants sur <strong><a href="https://ia-avecnous.fr" style="color:#170b7e">ia-avecnous.fr</a></strong>',
            contactEmail: 'contact@ia-avecnous.fr',
            signatureName: 'L\'équipe « L\'IA avec NOUS »',
            closingText: 'À très bientôt à Lille.',
            hideBadgeCta: true,
        },
    },
}

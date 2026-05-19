// Shared per-event configuration — used by register page, badge, and email builder.

export type EventConfig = {
    // ── Branding (badge + email + confirmation page) ──────────────────────────
    primaryColor?: string
    primaryForeground?: string
    headerImageUrl?: string
    footerImageUrl?: string

    // ── Register page ─────────────────────────────────────────────────────────
    showLinkedIn?: boolean
    showIdDocument?: boolean
    requireIdDocument?: boolean
    /** Keys from the FIELDS array in register/page.tsx */
    hiddenFields?: string[]
    requiredFields?: string[]
    confirmationMessage?: string
    email?: {
        subject?: string
        logoUrl?: string
        eventName?: string
        introText?: string
        contactEmail?: string
        signatureName?: string
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
        showIdDocument: true,
        requireIdDocument: true,
        hiddenFields: ['sn_linkedin', 'port', 'societe', 'fonction'],
        requiredFields: ['date_naissance', 'pays_naissance', 'ville_naissance'],
        confirmationMessage: 'Nous vous remercions de votre intérêt pour le Grand Sommet IA Avec Nous.\n\nUn email de confirmation vient de vous être envoyé avec les prochaines étapes et les informations relatives au Grand Sommet IA Avec Nous.',

        email: {
            subject: 'Confirmation de votre inscription – Grand Sommet IA Avec Nous',
            eventName: 'Grand Sommet IA Avec Nous',
            introText: 'Votre inscription au « Grand Sommet IA Avec Nous » a bien été prise en compte.\n\nCe rendez-vous réunira décideurs, experts, entrepreneurs et acteurs de l\'innovation autour des grandes transformations liées à l\'intelligence artificielle.\n\nVotre demande d\'inscription est désormais enregistrée.',
            signatureName: 'L\'équipe IA Avec Nous',
            ctaUrl: 'https://ia-avecnous.fr/grand-sommet/',
            ctaLabel: 'Plus d\'informations',
            hideBadgeCta: false,
        },
    },
}

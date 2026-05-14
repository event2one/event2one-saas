export type EventTheme = {
    /** Couleur principale (header, hero, boutons) */
    primaryColor?: string
    /** Couleur du texte sur fond primaryColor */
    primaryForeground?: string
    /** Google Font name (ex: 'Oswald', 'Montserrat'). Poids 400 et 700 chargés. */
    googleFont?: string
}

export const DEFAULT_THEME: EventTheme = {}

export const EVENT_THEMES: Record<string, EventTheme> = {
    '2273': {
        primaryColor: '#170b7e',
        primaryForeground: '#d8cfc7',
        googleFont: 'Oswald',
    },
}

export function getEventTheme(eventId: string): EventTheme {
    return { ...DEFAULT_THEME, ...EVENT_THEMES[eventId] }
}

/** Retourne les styles inline pour un élément à fond primaryColor */
export function primaryBgStyle(theme: EventTheme): React.CSSProperties | undefined {
    if (!theme.primaryColor) return undefined
    return {
        backgroundColor: theme.primaryColor,
        color: theme.primaryForeground ?? '#ffffff',
    }
}

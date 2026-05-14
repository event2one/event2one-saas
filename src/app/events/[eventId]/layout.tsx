import { Calendar, MapPin } from 'lucide-react'
import { API_URL } from '@/utils/api'
import { getEventTheme } from '@/config/event-themes'

const DIR_EVENT_IMG = 'https://www.mlg-consulting.com/manager_cc/docs/img_uploaded/'

// ─── Charte graphique → voir src/config/event-themes.ts ─────────────────────

type Lieu = {
    lieu_nom?: string
    lieu_ville?: string
    lieu_cp?: string
}

type Event = {
    id_event: string
    nom: string
    date_debut?: string
    lieu?: Lieu | string
    logo?: string
}

async function getEvent(eventId: string): Promise<Event | null> {
    try {
        const res = await fetch(`${API_URL}?action=getEvents&id_event=${eventId}`, { cache: 'no-store' })
        const data = await res.json()
        return Array.isArray(data) ? (data[0] ?? null) : (data ?? null)
    } catch {
        return null
    }
}

export default async function EventLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ eventId: string }>
}) {
    const { eventId } = await params
    const event = await getEvent(eventId)
    const theme = getEventTheme(eventId)

    const googleFontUrl = theme.googleFont
        ? `https://fonts.googleapis.com/css2?family=${encodeURIComponent(theme.googleFont)}:wght@400;700&display=swap`
        : null

    const formattedDate = event?.date_debut
        ? new Date(event.date_debut).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
          })
        : null

    const lieuLabel = event?.lieu
        ? typeof event.lieu === 'string'
            ? event.lieu
            : [event.lieu.lieu_nom, event.lieu.lieu_ville].filter(Boolean).join(', ')
        : null

    const logoSrc = event?.logo
        ? event.logo.startsWith('http')
            ? event.logo
            : `${DIR_EVENT_IMG}${event.logo}`
        : null

    return (
        <>
            {googleFontUrl && (
                <link rel="stylesheet" href={googleFontUrl} />
            )}
            {(theme.primaryColor || theme.primaryForeground || theme.googleFont) && (
                <style>{`
                    .event-theme {
                        ${theme.primaryColor      ? `--color-primary: ${theme.primaryColor};` : ''}
                        ${theme.primaryForeground ? `--color-primary-foreground: ${theme.primaryForeground};` : ''}
                        ${theme.googleFont        ? `font-family: '${theme.googleFont}', ui-sans-serif, system-ui, sans-serif;` : ''}
                    }
                    ${theme.primaryColor ? `.event-theme, .event-theme h1, .event-theme h2, .event-theme h3, .event-theme p, .event-theme label, .event-theme span:not(.text-destructive), .event-theme input { color: ${theme.primaryColor}; }` : ''}
                    ${theme.primaryColor ? `.event-theme .text-muted-foreground { color: ${theme.primaryColor}99; }` : ''}
                `}</style>
            )}
            <div className="event-theme">
            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
                <div className="max-w-4xl mx-auto px-6 h-14 flex items-center gap-4">
                    {/* Logo */}
                    <div className="shrink-0">
                        {logoSrc ? (
                            <img
                                src={logoSrc}
                                alt={event?.nom ?? 'Logo'}
                                className="h-8 w-auto max-w-[120px] object-contain"
                            />
                        ) : (
                            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                                {event?.nom?.[0]?.toUpperCase() ?? 'E'}
                            </div>
                        )}
                    </div>

                    {/* Divider */}
                    <div className="h-5 w-px bg-border shrink-0" />

                    {/* Event info */}
                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate leading-tight">
                            {event?.nom ?? 'Événement'}
                        </p>
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-0.5">
                            {formattedDate && (
                                <span className="flex items-center gap-1">
                                    <Calendar size={11} />
                                    {formattedDate}
                                </span>
                            )}
                            {lieuLabel && (
                                <span className="flex items-center gap-1">
                                    <MapPin size={11} />
                                    {lieuLabel}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Brand */}
                    <span className="shrink-0 text-xs font-semibold tracking-wide text-muted-foreground/60 select-none">
                        event2one
                    </span>
                </div>
            </header>

            {children}
            </div>
        </>
    )
}

import Link from 'next/link'
import { Calendar, MapPin, Users, ArrowRight, ChevronRight } from 'lucide-react'
import { API_URL } from '@/utils/api'

const DIR_IMG = 'https://www.mlg-consulting.com/manager_cc/contacts/img_uploaded/'

type Lieu = {
    lieu_nom?: string
    lieu_ville?: string
    lieu_cp?: string
    [key: string]: unknown
}

type Event = {
    id_event: string
    nom: string
    date_debut?: string
    date_fin?: string
    lieu?: Lieu | string
    description?: string
    logo?: string
    actif?: string
}

type Contact = {
    id_contact: string
    prenom: string
    nom: string
    societe?: string
    fonction?: string
    photo?: string
}

type Partner = {
    contact: Contact
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

async function getSpeakers(eventId: string): Promise<Partner[]> {
    try {
        const params = encodeURIComponent(` AND id_event=${eventId} and afficher !='0'`)
        const res = await fetch(
            `${API_URL}?action=getPartenairesLight&params=${params}&exclude_fields=event,conf_event&order_by=ordre_affichage ASC`,
            { cache: 'no-store' }
        )
        const data = await res.json()
        return Array.isArray(data) ? data : []
    } catch {
        return []
    }
}

export default async function EventHomePage({ params }: { params: Promise<{ eventId: string }> }) {
    const { eventId } = await params
    const [event, speakers] = await Promise.all([getEvent(eventId), getSpeakers(eventId)])

    if (!event) {
        return (
            <div className="min-h-screen flex items-center justify-center text-muted-foreground">
                Événement introuvable.
            </div>
        )
    }

    const formattedDate = event.date_debut
        ? new Date(event.date_debut).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
          })
        : null

    return (
        <div className="min-h-screen bg-background">
            {/* Hero */}
            <div className="bg-primary text-primary-foreground">
                <div className="max-w-4xl mx-auto px-6 py-16">
                    <p className="text-sm font-medium opacity-60 mb-2">event2one</p>
                    <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">{event.nom}</h1>
                    <div className="flex flex-wrap gap-5 text-sm opacity-75 mb-8">
                        {formattedDate && (
                            <span className="flex items-center gap-1.5">
                                <Calendar size={14} />
                                {formattedDate}
                            </span>
                        )}
                        {event.lieu && (
                            <span className="flex items-center gap-1.5">
                                <MapPin size={14} />
                                {typeof event.lieu === 'string'
                                    ? event.lieu
                                    : [event.lieu.lieu_nom, event.lieu.lieu_ville].filter(Boolean).join(', ')}
                            </span>
                        )}
                        {speakers.length > 0 && (
                            <span className="flex items-center gap-1.5">
                                <Users size={14} />
                                {speakers.length} participant{speakers.length > 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                    <Link
                        href={`/events/${eventId}/register`}
                        className="inline-flex items-center gap-2 bg-background text-foreground font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
                    >
                        S'inscrire <ArrowRight size={16} />
                    </Link>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
                {event.description && (
                    <section>
                        <h2 className="text-xl font-semibold mb-3">À propos</h2>
                        <p className="text-muted-foreground leading-relaxed">{event.description}</p>
                    </section>
                )}

                {/* Speakers grid */}
                {speakers.length > 0 ? (
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold">
                                Participants ({speakers.length})
                            </h2>
                            <Link
                                href={`/events/${eventId}/register`}
                                className="text-sm font-medium flex items-center gap-1 hover:underline text-muted-foreground"
                            >
                                M'inscrire <ChevronRight size={14} />
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {speakers.map((p) => {
                                const c = p.contact
                                const initials = `${c.prenom?.[0] ?? ''}${c.nom?.[0] ?? ''}`
                                return (
                                    <div
                                        key={c.id_contact}
                                        className="bg-card border rounded-xl p-4 text-center space-y-2"
                                    >
                                        {c.photo ? (
                                            <img
                                                src={`${DIR_IMG}${c.photo}`}
                                                alt={`${c.prenom} ${c.nom}`}
                                                className="w-16 h-16 rounded-full object-cover mx-auto"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground font-bold text-lg">
                                                {initials}
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-semibold text-sm leading-tight">
                                                {c.prenom} {c.nom}
                                            </p>
                                            {c.fonction && (
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {c.fonction}
                                                </p>
                                            )}
                                            {c.societe && (
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {c.societe}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </section>
                ) : (
                    <section className="text-center py-16 border rounded-2xl bg-muted/30">
                        <Users size={40} className="mx-auto mb-3 text-muted-foreground/40" />
                        <p className="text-muted-foreground mb-6">
                            Soyez le premier à vous inscrire !
                        </p>
                        <Link
                            href={`/events/${eventId}/register`}
                            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity text-sm"
                        >
                            S'inscrire maintenant <ArrowRight size={15} />
                        </Link>
                    </section>
                )}
            </div>
        </div>
    )
}

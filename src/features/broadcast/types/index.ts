export interface Presta {
    id_presta: string;
    presta_nom: string;
    punchline?: string;
    id_contact: string;
    video_url?: string;
}

export interface EventContactType {
    id_event_contact_type: string;
    libelle: string;
    event_contact_type_color: string;
}

export interface Contact {
    id_contact: string;
    nom: string;
    prenom: string;
    societe: string;
    flag: string;
    logos: { tiny: string };
    photos: { tiny: string };
    prestas_list: Presta[];
}

export interface Partner {
    id_conferencier: string;
    contact?: Contact;
    id_contact?: string;
    conferencier_statut?: {
        id_event_contact_type: string;
        event_contact_type_color: string;
        libelle: string;
    };
}

export interface Event {
    id_event: string;
    nom: string;
    event_start: string;
    event_end: string;
}

export interface confEventType {
    id_conf_event_type: string;
    conf_event_type_nom: string;
    picto: string;
    visuel: string;
    color: string;
}

export interface ConfEvent {
    id_conf_event: string;
    cel_titre: string;
    heure_debut: string;
    heure_fin: string;
    type: confEventType;
}

export interface ConfEventItem {
    [key: string]: unknown;
}

export interface ConfEventContribution {
    [key: string]: unknown;
}

export interface ContactStatut {
    [key: string]: unknown;
}

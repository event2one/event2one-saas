export interface ContactDatas {
    id_contact: string;
    mail: string;
    mobile?: string;
    port?: string; // used in Vote.js
    prenom: string;
    nom: string;
    societe: string;
    code_postal?: string;
    ville?: string;
    pays: string;
    photos?: {
        tiny: string;
        medium?: string;
    };
    logos?: any;
    web?: string;
}

export interface JuryEvent {
    id_event: string | number;
    id_jury_event: string | number;
    close_registration: string;
    nom: string;
    nom_us: string;
    id_conf_event_type: string;
    id_conf_event: {
        id_conf_event?: string | number; // Numeric ID
        conf_event_lang: {
            cel_titre: string;
        };
    };
    event: {
        logos: {
            medium: string;
        };
    };
}

export interface Demo {
    id_presta: string | number;
    event_cycle_lang?: {
        event_cycle_lang_nom: string;
    };
    // Add other fields as needed
}

export interface Note {
    id_presta: string | number;
    contactMe: boolean;
    [key: string]: any; // Allow dynamic rating criteria
}

import mysql from 'mysql';
import axios from 'axios';

// ok

// Database configuration
const db_config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
};

export const connection = mysql.createConnection(db_config);

connection.connect(function (err: any) {
    if (!err) {
        console.log("Database is connected ...");
    } else {
        console.log("Error connecting database ...", err);
    }
});

// API Helper Functions
export const getConfEvent = async ({ idEvent, idConfEvent }: { idEvent: string, idConfEvent: string }) => {
    try {
        return await axios.get(`https://www.mlg-consulting.com/smart_territory/form/api.php?action=getConfEvent&id_event=${idEvent}&filter= AND type NOT IN(5, 65, 69, 84, 92, 95) AND publier!='n' AND id_conf_event IN(${idConfEvent}) `);
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const getEvents = async ({ idEvent, idConfEvent }: { idEvent: string, idConfEvent: string }) => {
    try {
        return await axios.get(`https://www.mlg-consulting.com/smart_territory/form/api.php?action=getEvents&id_event=${idEvent}'`);
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const getConfEventContribution = async ({ idEvent, idConfEvent }: { idEvent: string, idConfEvent: string }) => {
    try {
        return await axios.get(`https://www.mlg-consulting.com/smart_territory/form/api.php?action=getConfEventContribution&filter= WHERE id_conf_event IN(SELECT id_conf_event FROM conf_event WHERE id_event ="${idEvent}") AND id_conf_event IN(${idConfEvent}) ORDER BY conf_event_contribution_order ASC`);
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const getPrestaList = async ({ idEvent, idConfEvent }: { idEvent: string, idConfEvent: string }) => {
    const params = `WHERE (id_contact IN(SELECT id_contact FROM conferenciers WHERE id_event=${idEvent} AND id_contact NOT IN("",0) AND id_conf_event IN(${idConfEvent}))) OR (id_contact IN (SELECT id_contact FROM conf_event_contribution WHERE id_conf_event IN (SELECT id_conf_event FROM conf_event WHERE id_event=${idEvent} AND id_conf_event IN(${idConfEvent})) AND id_contact NOT IN("",0)))`;
    try {
        return await axios.get(`https://www.mlg-consulting.com/smart_territory/form/api.php?action=getPrestaList&params=${params}`);
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const getEventContactTypeList = async () => {
    try {
        return await axios.get('https://www.mlg-consulting.com/smart_territory/form/api.php?action=getEventContactTypeList&filter=WHERE event_contact_type_state="active"');
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const getContactStatutList = async ({ idEvent, idConfEvent }: { idEvent: string, idConfEvent: string }) => {
    const filter = `WHERE id_contact IN(SELECT id_contact FROM conferenciers WHERE id_event=${idEvent} AND id_contact NOT IN(0, '') AND id_conf_event IN(${idConfEvent}) ) OR (id_contact IN (SELECT id_contact FROM conf_event_contribution WHERE id_contact NOT IN(0, '') AND  id_conf_event IN (SELECT id_conf_event FROM conf_event WHERE id_event=${idEvent} AND id_conf_event IN(${idConfEvent}))))`;
    const url = `https://www.mlg-consulting.com/smart_territory/form/api.php?action=getContactStatutList&filter=${filter}`;
    try {
        const res = await axios.get(url);
        return res;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const getPartenaires = async ({ idEvent, idConfEvent }: { idEvent: string, idConfEvent: string }) => {
    try {
        // Validate IDs are numeric to prevent API errors (e.g. "app.js" passed as ID)
        if (isNaN(Number(idEvent)) || isNaN(Number(idConfEvent))) {
            console.warn(`Invalid IDs passed to getPartenaires: idEvent=${idEvent}, idConfEvent=${idConfEvent}`);
            return { data: [] }; // Return empty data instead of crashing
        }

        let req;
        if (idConfEvent == "0") {
            req = `https://www.mlg-consulting.com/smart_territory/form/api.php?action=getPartenaires&params= AND id_event=${idEvent} and afficher !='0'`;
        } else {
            req = `https://www.mlg-consulting.com/smart_territory/form/api.php?action=getPartenaires&params= AND id_event=${idEvent} AND id_conf_event IN(${idConfEvent}) and afficher !='0'`;
        }
        console.log(req);
        return await axios.get(req);
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const getPartenaires2 = async ({ idEvent, idConfEvent }: { idEvent: string, idConfEvent: string }) => {
    const sql = `
        SELECT 
            id_conferencier,
            cf.id_conf_event,
            c.id_contact, c.prenom, c.nom, c.societe ,
            libelle, ect.id_event_contact_type, ect.event_contact_type_color
        FROM contacts c 
        JOIN conferenciers cf ON c.id_contact = cf.id_contact 
        JOIN conf_event ce ON cf.id_conf_event = ce.id_conf_event
        JOIN event_contact_type ect ON cf.statut = ect.id_event_contact_type
        WHERE cf.id_event = ? AND cf.id_conf_event = ? 
        GROUP BY c.id_contact
    `;

    return new Promise((resolve, reject) => {
        connection.query(sql, [idEvent, idConfEvent], (error: any, results: any) => {
            if (error) {
                console.error("Erreur lors de l'exécution de la requête SQL:", error);
                return reject(error);
            }

            const formatedResults = results.map((row: any) => ({
                id_conferencier: row.id_conferencier,
                contact: { id_contact: row.id_contact, prenom: row.prenom, nom: row.nom, societe: row.societe },
                event: {},
                id_conf_event: { id_conf_event: row.id_conf_event },
                conf_event: { id_conf_event: row.id_conf_event },
                conferencier_statut: { libelle: row.libelle, id_event_contact_type: row.id_event_contact_type, event_contact_type_color: row.event_contact_type_color }
            }));

            console.log("Résultats de getPartenaires2:", formatedResults);
            resolve(formatedResults);
        });
    });
};

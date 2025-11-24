// src/utils/api.ts
/**
 * Placeholder for data fetching used by the migrated admin page.
 * This version accepts the IDs coming from the URL so the page can display
 * the correct `idEvent` and `idConfEvent`. Replace the body with a real
 * HTTP request to your backend when available.
 */
export interface FetchParams {
    idEvent: number;
    idConfEvent: number;
}

export const API_URL = 'https://www.mlg-consulting.com/smart_territory/form/api.php';

export async function fetchInitialData(params: FetchParams) {
    const { idEvent, idConfEvent } = params;

    // Helper to fetch JSON from a URL
    const fetchData = async (url: string) => {
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
            return await res.json();
        } catch (err) {
            console.error(err);
            return [];
        }
    };

    // Construct URLs based on server.js logic
    const confEventUrl = `${API_URL}?action=getConfEvent&id_event=${idEvent}&filter= AND type NOT IN(5, 65, 69, 84, 92, 95) AND publier!='n' AND id_conf_event IN(${idConfEvent})`;

    const eventsUrl = `${API_URL}?action=getEvents&id_event=${idEvent}`;

    const confEventContributionUrl = `${API_URL}?action=getConfEventContribution&filter= WHERE id_conf_event IN(SELECT id_conf_event FROM conf_event WHERE id_event ="${idEvent}") AND id_conf_event IN(${idConfEvent}) ORDER BY conf_event_contribution_order ASC`;

    const prestaParams = `WHERE (id_contact IN(SELECT id_contact FROM conferenciers WHERE id_event=${idEvent} AND id_contact NOT IN("",0) AND id_conf_event IN(${idConfEvent}))) OR (id_contact IN (SELECT id_contact FROM conf_event_contribution WHERE id_conf_event IN (SELECT id_conf_event FROM conf_event WHERE id_event=${idEvent} AND id_conf_event IN(${idConfEvent})) AND id_contact NOT IN("",0)))`;
    const prestaListUrl = `${API_URL}?action=getPrestaList&params=${encodeURIComponent(prestaParams)}`;

    const eventContactTypeListUrl = `${API_URL}?action=getEventContactTypeList&filter=WHERE event_contact_type_state="active"`;

    const contactStatutFilter = `WHERE id_contact IN(SELECT id_contact FROM conferenciers WHERE id_event=${idEvent} AND id_contact NOT IN(0, '') AND id_conf_event IN(${idConfEvent}) ) OR (id_contact IN (SELECT id_contact FROM conf_event_contribution WHERE id_contact NOT IN(0, '') AND  id_conf_event IN (SELECT id_conf_event FROM conf_event WHERE id_event=${idEvent} AND id_conf_event IN(${idConfEvent}))))`;
    const contactStatutListUrl = `${API_URL}?action=getContactStatutList&filter=${encodeURIComponent(contactStatutFilter)}`;

    const futureEventsUrl = `${API_URL}?action=getEvents&futur=y&params=WHERE`;
    const confEventListLightUrl = `${API_URL}?action=getConfeventLight&filter= AND e.id_event=${idEvent}`;

    let partenaireListUrl;
    if (idConfEvent === 0) {
        partenaireListUrl = `${API_URL}?action=getPartenairesLight&params= AND id_event=${idEvent} and afficher !='0'&exclude_fields=event,conf_event`;
    } else {
        partenaireListUrl = `${API_URL}?action=getPartenairesLight&params= AND id_event=${idEvent} AND id_conf_event IN(${idConfEvent}) and afficher !='0'&exclude_fields=event,conf_event`;
    }

    // Execute all requests in parallel
    const [
        confEventList,
        // events, // Not currently used in the interface props but available if needed
        confEventContributionList,
        prestaList,
        eventContactTypeList,
        contactStatutList,
        partenaireList,
        futureEvents,
        confEventListLight
    ] = await Promise.all([
        fetchData(confEventUrl),
        // fetchData(eventsUrl),
        fetchData(confEventContributionUrl),
        fetchData(prestaListUrl),
        fetchData(eventContactTypeListUrl),
        fetchData(contactStatutListUrl),
        fetchData(partenaireListUrl),
        fetchData(futureEventsUrl),
        fetchData(confEventListLightUrl)
    ]);

    return {
        idEvent,
        idConfEvent,
        confEventList: Array.isArray(confEventList) ? confEventList : [],
        confEventContributionList: Array.isArray(confEventContributionList) ? confEventContributionList : [],
        partenaireList: Array.isArray(partenaireList) ? partenaireList : [],
        prestaList: Array.isArray(prestaList) ? prestaList : [],
        contactStatutList: Array.isArray(contactStatutList) ? contactStatutList : [],
        eventContactTypeList: Array.isArray(eventContactTypeList) ? eventContactTypeList : [],
        futureEvents: Array.isArray(futureEvents) ? futureEvents : [],
        confEventListLight: Array.isArray(confEventListLight) ? confEventListLight : [],
    };
}

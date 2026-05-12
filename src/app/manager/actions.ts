'use server';

import axios from 'axios';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

const API_URL = 'https://www.mlg-consulting.com/smart_territory/form/api.php';

async function requireSession() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
        throw new Error('Unauthorized');
    }
    return session;
}

export async function getManagerEvents() {
    try {
        const response = await axios.get(`${API_URL}?action=getEvents&futur=y&params=%20where%20%20event_start%20%3E%20(DATE_SUB(current_date(),%20INTERVAL%202%20YEAR))%20AND`);
      
      console.log(response.data)
        return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        console.error('Failed to fetch events:', error);
        return [];
    }
}

export async function createManagerEvent(formData: FormData) {
    const session = await requireSession();

    const name = formData.get('name');
    const date = formData.get('date');
    const location = formData.get('location');

    if (!name || !date) {
        return { error: 'Name and Date are required' };
    }

    try {
        const response = await axios.post(`${API_URL}?action=createEvent`, {
            nom: name,
            date_debut: date,
            lieu: location,
            actif: '1',
            id_client: session.user.id
        });

        if (response.data && response.data.success) {
            return { success: true };
        } else {
            return { error: response.data?.error || 'Failed to create event' };
        }
    } catch (error) {
        console.error('Failed to create event:', error);
        return { error: 'Failed to create event' };
    }
}

export async function getManagerEvent(eventId: string) {
    try {
        const response = await axios.get(`${API_URL}?action=getEvents&id_event=${eventId}`);
        const data = response.data;
        return Array.isArray(data) ? (data[0] ?? null) : (data ?? null);
    } catch (error) {
        console.error('Failed to fetch event:', error);
        return null;
    }
}

export async function updateManagerEvent(eventId: string, formData: FormData) {
    await requireSession();

    const nom = formData.get('nom');
    const date_debut = formData.get('date_debut');
    const date_fin = formData.get('date_fin');
    const description = formData.get('description');
    const actif = formData.get('actif') === '1' ? '1' : '0';

    try {
        const response = await axios.post(`${API_URL}?action=updateEvent`, {
            id_event: eventId,
            nom,
            date_debut: date_debut || null,
            date_fin: date_fin || null,
            description,
            actif,
        });

        if (response.data && response.data.success) {
            return { success: true };
        }
        return { error: response.data?.error || 'Failed to update event' };
    } catch (error) {
        console.error('Failed to update event:', error);
        return { error: 'Failed to update event' };
    }
}

export async function getManagerUsers() {
    await requireSession();

    // TODO: Implement with MLG API
    return [];
}

export async function getDashboardStats() {
    await requireSession();

    try {
        const eventsResponse = await axios.get(`${API_URL}?action=getEvents&params=WHERE events.id_event > 2000`);
        const eventsCount = Array.isArray(eventsResponse.data) ? eventsResponse.data.length : 0;

        // TODO: Fetch from MLG API
        const activeUsersCount = 0;

        return {
            totalEvents: eventsCount,
            activeUsers: activeUsersCount,
            totalVotes: 0,
            broadcasts: 0
        };
    } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        return {
            totalEvents: 0,
            activeUsers: 0,
            totalVotes: 0,
            broadcasts: 0,
        };
    }
}

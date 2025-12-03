'use server';

import axios from 'axios';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

const API_URL = 'https://www.mlg-consulting.com/smart_territory/form/api.php';

export async function getManagerEvents() {
    // For now, return empty array since Better Auth session is not implemented yet
    // This will be updated once Better Auth is properly configured with database
    return [];

    try {
        // Fetch all events. 'futur=y' might filter for future events, but we want all for manager.
        // The API usage in utils/api.ts suggests: action=getEvents&futur=y&params=WHERE
        // Let's try to get all events.
        const response = await axios.get(`${API_URL}?action=getEvents&params=WHERE 1=1 ORDER BY date_debut DESC`);

        if (Array.isArray(response.data)) {
            return response.data;
        }
        return [];
    } catch (error) {
        console.error('Failed to fetch events:', error);
        return [];
    }
}

async function requireSession() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
        throw new Error('Unauthorized');
    }
    return session;
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
        // Placeholder for creating event via API
        // We might need to adjust the payload based on the actual API requirements
        const response = await axios.post(`${API_URL}?action=createEvent`, {
            nom: name,
            date_debut: date,
            lieu: location,
            // Default values
            actif: '1',
            id_client: session.user.id // Assuming we link it to the creator
        });

        if (response.data && response.data.success) {
            return { success: true };
        } else {
            // If the API returns an error or success is false
            return { error: response.data?.error || 'Failed to create event' };
        }
    } catch (error) {
        console.error('Failed to create event:', error);
        return { error: 'Failed to create event' };
    }
}

export async function getManagerUsers() {
    await requireSession();

    try {
        const users = await prisma.contacts.findMany({
            take: 50, // Limit to 50 for now
            orderBy: {
                date_creat: 'desc',
            },
            include: {
                rcc: {
                    select: {
                        statut: true,
                        last_password_update: true,
                    }
                }
            }
        });

        return users;
    } catch (error) {
        console.error('Failed to fetch users:', error);
        return [];
    }
}

export async function getDashboardStats() {
    await requireSession();

    try {
        // Fetch events count
        const eventsResponse = await axios.get(`${API_URL}?action=getEvents&params=WHERE events.id_event > 2000 AND `);
        console.log(`${API_URL}?action=getEvents&params=WHERE events.id_event > 2000 AND `)
        const eventsCount = Array.isArray(eventsResponse.data) ? eventsResponse.data.length : 0;

        // Fetch active users count from Prisma
        const activeUsersCount = await prisma.contacts.count();

        // For now, return placeholder values for votes and broadcasts
        // These would need to be implemented based on your actual data structure
        return {
            totalEvents: eventsCount,
            activeUsers: activeUsersCount,
            totalVotes: 0, // Placeholder
            broadcasts: 0, // Placeholder
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

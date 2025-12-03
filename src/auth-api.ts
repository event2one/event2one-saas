import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import Apple from 'next-auth/providers/apple';
import LinkedIn from 'next-auth/providers/linkedin';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

async function getUser(email: string) {
    try {
        const user = await prisma.rcc.findFirst({
            where: {
                contact: {
                    mail: email,
                },
            },
            include: {
                contact: true,
            },
        });
        return user;
    } catch (error) {
        console.error('Failed to fetch user:', error);
        throw new Error('Failed to fetch user.');
    }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code"
                }
            }
        }),
        Apple({
            clientId: process.env.APPLE_CLIENT_ID!,
            clientSecret: process.env.APPLE_CLIENT_SECRET!,
        }),
        LinkedIn({
            clientId: process.env.LINKEDIN_CLIENT_ID!,
            clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
        }),
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;
                    const user = await getUser(email);

                    if (!user) return null;

                    // Check if password is bcrypt hashed or plain text (legacy)
                    const passwordsMatch = user.rcc_pass.startsWith('$2')
                        ? await bcrypt.compare(password, user.rcc_pass)
                        : password === user.rcc_pass;

                    if (passwordsMatch) {
                        return {
                            id: user.id_rcc.toString(),
                            email: user.contact.mail,
                            name: `${user.contact.prenom} ${user.contact.nom}`,
                        };
                    }
                }

                console.log('Invalid credentials');
                return null;
            },
        }),
    ],
    pages: {
        signIn: '/signin',
    },
    callbacks: {
        async session({ session, token }) {
            if (token.sub) {
                session.user.id = token.sub;

                // Add privilege information to session
                if (token.privilege !== undefined) {
                    session.user.privilege = token.privilege as number;
                    session.user.isAdmin = token.isAdmin as boolean;
                }
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                // Fetch user privileges when creating JWT
                try {
                    const userWithRcc = await prisma.contacts.findFirst({
                        where: { mail: user.email! },
                        include: { rcc: true },
                    });

                    if (userWithRcc?.rcc?.[0]?.statut !== null && userWithRcc?.rcc?.[0]?.statut !== undefined) {
                        token.privilege = userWithRcc.rcc[0].statut;
                        // Define admin privilege codes (adjust based on your system)
                        // Example: statut 1 = admin
                        token.isAdmin = userWithRcc.rcc[0].statut === 1;
                    }
                } catch (error) {
                    console.error('Error fetching user privileges:', error);
                }
            }
            return token;
        },
        async signIn({ user, account }) {
            // Handle OAuth sign-in
            if (account?.provider !== 'credentials') {
                try {
                    // Check if user exists in database
                    const existingUser = await getUser(user.email!);

                    // If user doesn't exist, create them automatically
                    if (!existingUser) {
                        console.log('Creating new OAuth user:', user.email);
                        
                        // First, check if contact exists
                        let contact = await prisma.contacts.findFirst({
                            where: { mail: user.email! }
                        });

                        // If contact doesn't exist, create it
                        if (!contact) {
                            const names = user.name?.split(' ') || ['', ''];
                            const prenom = names[0] || '';
                            const nom = names.slice(1).join(' ') || '';

                            contact = await prisma.contacts.create({
                                data: {
                                    mail: user.email!,
                                    prenom: prenom,
                                    nom: nom,
                                    date_creat: new Date(),
                                }
                            });
                        }

                        // Create RCC entry for the new user
                        await prisma.rcc.create({
                            data: {
                                id_contact: contact.id_contact,
                                rcc_pass: '', // No password for OAuth users
                                statut: 0, // Regular user status
                                jour: new Date(),
                            }
                        });

                        console.log('Successfully created new OAuth user');
                    }
                } catch (error) {
                    console.error('Error handling OAuth sign-in:', error);
                    return false; // Prevent sign-in on error
                }
            }
            return true;
        },
    },
});
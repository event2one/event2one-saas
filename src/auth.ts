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
            }
            return session;
        },
        async signIn({ user, account, profile }) {
            // Handle OAuth sign-in
            if (account?.provider !== 'credentials') {
                // Check if user exists in database
                const existingUser = await getUser(user.email!);

                // If user doesn't exist, you might want to create them
                // This is a placeholder - implement based on your business logic
                if (!existingUser) {
                    console.log('New OAuth user - implement user creation logic');
                    // TODO: Call API to create user or handle new OAuth users
                }
            }
            return true;
        },
    },
});

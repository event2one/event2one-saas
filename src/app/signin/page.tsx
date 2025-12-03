'use client';

import { authClient } from '@/lib/auth-client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function SignInForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const registered = searchParams.get('registered');
    const callbackUrl = searchParams.get('callbackUrl') ?? '/saas';

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError('');
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        try {
            const { data, error } = await authClient.signIn.email({
                email,
                password,
            });

            if (error) {
                setError('Email ou mot de passe incorrect');
                setLoading(false);
            } else {
                router.push(callbackUrl);
                router.refresh();
            }
        } catch {
            setError('Une erreur est survenue');
            setLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2 text-center">
                <h1 className="text-3xl font-bold tracking-tight">Sign in to Event2one</h1>
                <p className="text-sm text-muted-foreground">
                    Enter your email below to sign in to your account
                </p>
            </div>

            <div className="space-y-4">
                {/* OAuth Providers */}
                <div className="grid gap-2">
                    <Button
                        variant="outline"
                        onClick={() => authClient.signIn.social({
                            provider: 'google',
                            callbackURL: callbackUrl
                        })}
                        className="w-full"
                    >
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        Continue with Google
                    </Button>
                </div>
                <div className="grid gap-2">
                    <Button
                        variant="outline"
                        onClick={() => authClient.signIn.social({
                            provider: 'linkedin',
                            callbackURL: callbackUrl
                        })}
                        className="w-full"
                    >
                         
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4.983 3.5C3.343 3.5 2 4.843 2 6.483c0 1.64 1.343 2.983 2.983 2.983s2.983-1.343 2.983-2.983C7.966 4.843 6.623 3.5 4.983 3.5zM2.4 8.4h5.167V21H2.4V8.4zM9.334 8.4h4.958v1.712h.07c.69-1.31 2.377-2.694 4.895-2.694 5.234 0 6.2 3.445 6.2 7.922V21h-5.167v-6.844c0-1.632-.03-3.732-2.272-3.732-2.272 0-2.618 1.772-2.618 3.604V21H9.334V8.4z" fill="#0A66C2"/>
                        </svg>

                        Continue with Linkedin
                    </Button>
                </div>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                    </div>
                </div>

                {/* Email/Password Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {registered && (
                        <div className="rounded-md bg-green-50 p-3 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-400">
                            Compte créé avec succès ! Vous pouvez maintenant vous connecter.
                        </div>
                    )}

                    {error && (
                        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="name@example.com"
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Password</Label>
                            <Link
                                href="/forgot-password"
                                className="text-sm text-muted-foreground hover:text-primary underline-offset-4 hover:underline"
                            >
                                Forgot password?
                            </Link>
                        </div>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign in'}
                    </Button>
                </form>

                <div className="text-center text-sm text-muted-foreground">
                    Don&apos;t have an account?{' '}
                    <Link href="/signup" className="text-primary underline-offset-4 hover:underline font-medium">
                        Sign up
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function SignInPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SignInForm />
        </Suspense>
    );
}
'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LinkedInCallbackInner() {
    const params = useSearchParams()

    useEffect(() => {
        const code  = params.get('code')
        const state = params.get('state')
        const error = params.get('error')

        if (window.opener) {
            window.opener.postMessage(
                { type: 'linkedin_callback', code, state, error },
                window.location.origin
            )
            window.close()
        }
    }, [params])

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center space-y-2">
                <svg className="w-6 h-6 animate-spin text-muted-foreground mx-auto" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <p className="text-sm text-muted-foreground">Connexion en cours…</p>
            </div>
        </div>
    )
}

export default function LinkedInCallbackPage() {
    return (
        <Suspense>
            <LinkedInCallbackInner />
        </Suspense>
    )
}

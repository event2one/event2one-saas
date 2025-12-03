import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // For now, we'll remove the auth middleware and handle authentication in the components
    // This can be reimplemented with Better Auth's middleware once the database is connected
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/saas/manager/:path*',
        // Add other protected routes here
    ],
};

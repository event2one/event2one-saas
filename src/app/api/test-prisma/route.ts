import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const pathname = url.pathname.replace('/api/test-prisma', '/saas/api/test-prisma');
    const redirectUrl = `${url.protocol}//${url.host}${pathname}${url.search}`;
    
    return Response.redirect(redirectUrl, 307);
}
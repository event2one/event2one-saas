import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get('url');

    if (!url) {
        return new NextResponse('Missing URL parameter', { status: 400 });
    }

    try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const headers = new Headers(response.headers);
        // Remove headers that block iframe embedding or cause encoding issues
        headers.delete('x-frame-options');
        headers.delete('content-security-policy');
        headers.delete('content-encoding'); // Fetch decompresses automatically, so we must remove this
        headers.delete('content-length');   // Length might change after decompression/re-buffering
        // Add CORS headers
        headers.set('Access-Control-Allow-Origin', '*');

        return new NextResponse(buffer, {
            status: response.status,
            headers: headers,
        });
    } catch (error) {
        console.error('Proxy error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

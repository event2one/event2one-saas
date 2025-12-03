export async function GET() {
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
    
    return new Response(JSON.stringify({
        hasGoogleClientId: !!googleClientId,
        hasGoogleClientSecret: !!googleClientSecret,
        nextAuthUrl: process.env.NEXTAUTH_URL,
        clientIdPrefix: googleClientId ? googleClientId.substring(0, 20) + '...' : 'Not found',
        secretPrefix: googleClientSecret ? googleClientSecret.substring(0, 10) + '...' : 'Not found'
    }), {
        headers: { 'Content-Type': 'application/json' }
    });
}
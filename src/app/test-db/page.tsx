// app/test-db/page.tsx
import { prisma } from '@/lib/prisma'; // Importez votre instance créée à l'étape 1

// Force la page à se recharger dynamiquement à chaque visite
export const dynamic = 'force-dynamic';

export default async function TestDbPage() {
    let message = '';
    let status = '';
    let userCount = 0;

    try {
        // 1. Test simple de connexion
        await prisma.$connect();
        status = '✅ SUCCÈS';
        message = 'La connexion à la base de données est établie.';

        // 2. Test de lecture (optionnel, remplacez 'user' par une de vos tables)
        // Cela vérifie que les permissions de lecture sont OK
        // userCount = await prisma.user.count(); 

    } catch (e: any) {
        status = '❌ ERREUR';
        message = e.message || 'Une erreur inconnue est survenue';
        console.error(e); // Affiche l'erreur complète dans le terminal du serveur
    }

    return (
        <div style={{ padding: '40px', fontFamily: 'system-ui' }}>
            <h1>Test de connexion BDD (Next.js 16)</h1>

            <div style={{
                padding: '20px',
                borderRadius: '8px',
                backgroundColor: status.includes('SUCCÈS') ? '#d1fae5' : '#fee2e2',
                border: `1px solid ${status.includes('SUCCÈS') ? '#059669' : '#b91c1c'}`
            }}>
                <h2>{status}</h2>
                <p>{message}</p>

                {status.includes('SUCCÈS') && (
                    <p><strong>Test supplémentaire :</strong> Si vous avez décommenté la ligne count, il y a {userCount} entrées.</p>
                )}
            </div>

            <p style={{ marginTop: '20px', color: '#666' }}>
                Regardez votre terminal (là où tourne <code>npm run dev</code>) pour voir les détails si une erreur survient.
            </p>
        </div>
    );
}
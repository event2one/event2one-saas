/**
 * Layout minimal pour les routes d'impression.
 * Pas de ThemeProvider, pas de footer, pas de AuthProvider.
 * La page reçoit un DOM propre — le CSS @media print est trivial.
 */
export default function PrintLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="fr">
            <body style={{ margin: 0, padding: 0, background: 'white' }}>
                {children}
            </body>
        </html>
    )
}

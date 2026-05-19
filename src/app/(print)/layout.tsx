/**
 * Layout minimal pour les routes d'impression.
 * Pas de ThemeProvider, pas de footer, pas de AuthProvider.
 * On ne re-déclare pas <html>/<body> (nesting invalide avec le root layout)
 * → on surcharge les styles via <style> injecté.
 */
export default function PrintLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <style>{`
                body { margin: 0 !important; padding: 0 !important; background: white !important; display: block !important; min-height: unset !important; }
                body > footer { display: none !important; }
            `}</style>
            {children}
        </>
    )
}

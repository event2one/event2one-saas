export default function MarketingFooter() {
    const currentYear = new Date().getFullYear();

    const footerLinks = [
        { label: 'Accueil', href: '#accueil' },
        { label: 'Fonctionnalités', href: '#fonctionnalites' },
        { label: 'Solutions', href: '#solutions' },
        { label: 'Expérience', href: '#experience' },
        { label: 'Contact', href: '#contact' }
    ];

    return (
        <footer className="relative bg-black/30 border-t border-white/10 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    {/* Footer Links */}
                    <ul className="flex flex-wrap justify-center gap-6 mb-6">
                        {footerLinks.map((link, index) => (
                            <li key={index}>
                                <a
                                    href={link.href}
                                    className="text-slate-400 hover:text-white transition-colors duration-200"
                                >
                                    {link.label}
                                </a>
                            </li>
                        ))}
                    </ul>

                    {/* Copyright */}
                    <p className="text-slate-500 text-sm">
                        © 2003-{currentYear} Event2One. Tous droits réservés. | Plateforme de gestion d&apos;événements professionnels
                    </p>
                </div>
            </div>
        </footer>
    );
}

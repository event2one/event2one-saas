'use client';

import Image from 'next/image';

// Liste des logos clients - formats mixtes (SVG, PNG, JPG, etc.)
const clientLogos = [
    {
        name: 'Deloitte',
        url: 'https://www.deloitte.com/content/dam/assets-shared/logos/svg/a-d/deloitte.svg',
        width: 120,
        height: 40,
    },
    {
        name: 'La Cité - Centre des Congrès de Nantes',
        url: 'https://lacite-nantes.fr/wp-content/themes/cdc/images/logo-la-cite-le-centre-des-congres-de-nantes-fr.svg',
        width: 120,
        height: 40,
    },
    {
        name: 'CCIAMP',
        url: '/saas/logos/cciamp.png',
        width: 120,
        height: 40,
    },
    // Ajoutez ici les autres logos (SVG, PNG, JPG, etc.)
];

export default function LogoMarquee() {
    // Dupliquer les logos pour un défilement infini sans coupure
    const duplicatedLogos = [...clientLogos, ...clientLogos, ...clientLogos, ...clientLogos];

    return (
        <section className="relative py-16 overflow-hidden border-y border-white/10">
            {/* Background */}
            <div className="absolute inset-0 bg-slate-950/50"></div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <p className="text-sm font-semibold text-teal-400 mb-2 uppercase tracking-wider">
                        Ils nous font confiance
                    </p>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white">
                        Rejoignez des centaines d&apos;organisateurs d&apos;événements
                    </h2>
                </div>

                {/* Logos Marquee */}
                <div className="relative">
                    {/* Gradient Overlays */}
                    <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-slate-950 to-transparent z-10"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-950 to-transparent z-10"></div>

                    {/* Scrolling Container */}
                    <div className="flex overflow-hidden">
                        {/* First set of logos */}
                        <div className="flex animate-scroll items-center">
                            {duplicatedLogos.map((logo, index) => (
                                <div
                                    key={`logo-${index}`}
                                    className="flex-shrink-0 mx-8 flex items-center justify-center"
                                >
                                    <div className="group relative">
                                        <div className="w-40 h-20 flex items-center justify-center bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl transition-all duration-300 hover:bg-white/10 hover:border-teal-500/50 hover:shadow-lg hover:shadow-teal-500/20 p-4">
                                            <div className="relative w-full h-full flex items-center justify-center">
                                                <Image
                                                    src={logo.url}
                                                    alt={logo.name}
                                                    width={logo.width}
                                                    height={logo.height}
                                                    className="max-w-full max-h-full object-contain filter brightness-0 invert opacity-70 group-hover:opacity-100 transition-opacity duration-300"
                                                    unoptimized={logo.url.endsWith('.svg')}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

const features = [
    {
        title: 'Billetterie & Inscriptions',
        description: 'Managez simplement l\'ensemble de vos services à partir d\'une interface commune. Event2one est une plateforme technologique simple, polyvalente et intuitive.',
        image: 'https://www.mlg-consulting.com/manager_cc/docs/archives/eto_capture.png',
        cta: 'Découvrir la billetterie',
        ctaLink: '#fonctionnalites'
    },
    {
        title: 'Accueil & Badging',
        description: 'Une interface simple et performante pour identifier et badger. Vos équipes se concentrent sur la qualité de l\'accueil et sur la satisfaction de vos visiteurs.',
        image: 'https://www.mlg-consulting.com/manager_cc/docs/archives/e2o_accuei.png',
        cta: 'Solutions d\'accueil',
        ctaLink: '#contact'
    },
    {
        title: 'Site Web Événementiel',
        description: 'Déployez votre site web dédié et commencez à générer des inscriptions en quelques clics. 100% personnalisable selon vos besoins et votre charte graphique.',
        image: 'https://www.mlg-consulting.com/manager_cc/docs/archives/mini_site.png',
        cta: 'Créer mon site',
        ctaLink: '#contact'
    },
    {
        title: 'Contrôle d\'accès',
        description: 'Déployez très simplement un nombre illimité de points de contrôle. Vous savez en temps réel qui rentre, qui sort. Sécurisez vos événements efficacement.',
        image: 'https://www.mlg-consulting.com/manager_cc/docs/archives/e2o_control.png',
        cta: 'Sécuriser mon événement',
        ctaLink: '#contact'
    },
    {
        title: 'Social & Networking',
        description: 'Votre événement interagit avec les principaux médias sociaux. Diffusez et recevez automatiquement des flux d\'information.',
        image: 'https://www.mlg-consulting.com/manager_cc/docs/archives/eto_connector.png',
        cta: 'Connecter les participants',
        ctaLink: '#contact'
    }
];

export default function SolutionsFeature() {
    const [activeFeature, setActiveFeature] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const progressRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isAutoPlaying) return;

        const interval = setInterval(() => {
            setActiveFeature((prev) => (prev + 1) % features.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [isAutoPlaying]);

    return (
        <section id="solutions" className="py-24 bg-slate-950 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-64 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 -right-64 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="mb-16">
                    <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
                        Tout pour votre événement. <br />
                        <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                            Au même endroit.
                        </span>
                    </h2>
                    <p className="text-lg text-slate-400 max-w-2xl">
                        Une suite complète d'outils intégrés pour gérer chaque aspect de vos événements professionnels, de l'inscription à l'analyse post-événement.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    {/* Left Column: Feature List */}
                    <div className="lg:col-span-6 flex flex-col gap-4">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className={`group relative p-6 rounded-xl cursor-pointer transition-all duration-300 border ${activeFeature === index
                                    ? 'bg-slate-900 border-teal-500/50 shadow-[0_0_30px_-10px_rgba(20,184,166,0.3)]'
                                    : 'bg-transparent border-transparent hover:bg-slate-900/50'
                                    }`}
                                onClick={() => {
                                    setActiveFeature(index);
                                    setIsAutoPlaying(false);
                                }}
                                onMouseEnter={() => setIsAutoPlaying(false)}
                                onMouseLeave={() => setIsAutoPlaying(true)}
                            >
                                {/* Progress Bar for Active Item */}
                                {activeFeature === index && isAutoPlaying && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-800 rounded-l-xl overflow-hidden">
                                        <div className="w-full h-full bg-teal-500 animate-[progress_5s_linear_infinite] origin-top"></div>
                                    </div>
                                )}

                                {/* Static Active Indicator */}
                                {activeFeature === index && !isAutoPlaying && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500 rounded-l-xl"></div>
                                )}

                                <div className="flex items-center justify-between w-full">
                                    <h3 className={`text-xl md:text-2xl font-bold transition-colors ${activeFeature === index ? 'text-teal-400' : 'text-slate-300 group-hover:text-white'
                                        }`}>
                                        {feature.title}
                                    </h3>

                                    {/* Plus/Minus Icon */}
                                    <div className={`w-6 h-6 flex items-center justify-center rounded-full border transition-all duration-300 ${activeFeature === index
                                        ? 'border-teal-500 bg-teal-500/20 rotate-45'
                                        : 'border-slate-600 group-hover:border-slate-400'
                                        }`}>
                                        <svg className={`w-4 h-4 transition-colors ${activeFeature === index ? 'text-teal-400' : 'text-slate-500 group-hover:text-slate-300'
                                            }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                    </div>
                                </div>

                                <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${activeFeature === index ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0'
                                    }`}>
                                    <div className="overflow-hidden">
                                        <p className="text-slate-300 leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right Column: Preview Area */}
                    <div className="lg:col-span-6 relative">
                        <div className="relative aspect-[16/10] bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
                            {/* Window Controls */}
                            <div className="absolute top-0 left-0 right-0 h-10 bg-slate-900 border-b border-slate-800 flex items-center px-4 gap-2 z-20">
                                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                                <div className="ml-4 text-xs text-slate-500 font-mono">event2one-dashboard.tsx</div>
                            </div>

                            {/* Content */}
                            <div className="absolute inset-0 pt-10 bg-slate-950/50">
                                {features.map((feature, index) => (
                                    <div
                                        key={index}
                                        className={`absolute inset-0 transition-all duration-700 ease-in-out transform ${activeFeature === index
                                            ? 'opacity-100 translate-y-0 scale-100'
                                            : 'opacity-0 translate-y-8 scale-95 pointer-events-none'
                                            }`}
                                    >
                                        <div className="relative w-full h-full p-8 flex flex-col items-center justify-center">
                                            {/* Glow Effect behind image */}
                                            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-teal-500/20 blur-[100px] rounded-full transition-opacity duration-1000 ${activeFeature === index ? 'opacity-100' : 'opacity-0'
                                                }`}></div>

                                            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
                                                <div className="relative w-full max-w-2xl aspect-video rounded-lg overflow-hidden shadow-2xl border border-slate-700/50 bg-slate-900">
                                                    <Image
                                                        src={feature.image}
                                                        alt={feature.title}
                                                        fill
                                                        className="object-contain"
                                                    />
                                                </div>

                                                <div className="mt-8">
                                                    <a
                                                        href={feature.ctaLink}
                                                        className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-950 rounded-full font-bold hover:bg-teal-50 transition-colors shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]"
                                                    >
                                                        {feature.cta}
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                                        </svg>
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes progress {
                    0% { height: 0%; }
                    100% { height: 100%; }
                }
            `}</style>
        </section>
    );
}

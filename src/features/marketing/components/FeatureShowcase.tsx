'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

const features = [
    {
        id: 'ticket',
        title: 'Billetterie Tout-en-un',
        shortDescription: 'Solution complète de billetterie et gestion.',
        description: 'Managez simplement l\'ensemble de vos services à partir d\'une interface commune. Event2one est une plateforme technologique simple, polyvalente et intuitive de gestion d\'événements, salons, forums et rendez-vous d\'affaires.',
        image: 'https://www.mlg-consulting.com/manager_cc/docs/archives/eto_capture.png',
        cta: 'Les fonctionnalités',
        ctaLink: '#fonctionnalites'
    },
    {
        id: 'accueil',
        title: 'Accueil Visiteurs',
        shortDescription: 'Interface performante pour l\'accueil.',
        description: 'Une interface simple et performante pour identifier et badger. Vos équipes se concentrent sur la qualité de l\'accueil et sur la satisfaction de vos visiteurs et participants.',
        image: 'https://www.mlg-consulting.com/manager_cc/docs/archives/e2o_accuei.png',
        cta: 'Contactez-nous',
        ctaLink: '#contact'
    },
    {
        id: 'experience',
        title: '15+ Ans d\'Expérience',
        shortDescription: 'Solution éprouvée depuis 2003.',
        description: 'Conçu en 2003 et développé en permanence depuis par et pour des organisateurs de manifestations professionnelles. Event2One est une solution flexible livrée clé en main, disponible rapidement et sans aucune connaissance technique requise.',
        image: 'https://www.mlg-consulting.com/manager_cc/docs/archives/e2o_Icon_400.png',
        cta: 'Contactez-nous',
        ctaLink: '#contact'
    },
    {
        id: 'website',
        title: 'Site Web Clé en Main',
        shortDescription: 'Déployez votre site dédié en quelques clics.',
        description: 'Déployez votre site web dédié et commencez à générer des inscriptions en quelques clics. 100% personnalisable selon vos besoins et votre charte graphique.',
        image: 'https://www.mlg-consulting.com/manager_cc/docs/archives/mini_site.png',
        cta: 'Contactez-nous',
        ctaLink: '#contact'
    },
    {
        id: 'badges',
        title: 'Badges & Billets PDF',
        shortDescription: 'Simplifiez la logistique d\'impression.',
        description: 'Vos participants reçoivent un badge électronique et l\'impriment directement chez eux. Simplifiez la logistique et réduisez vos coûts d\'impression.',
        image: 'https://www.mlg-consulting.com/manager_cc/docs/archives/badge_pdf.png',
        cta: 'Contactez-nous',
        ctaLink: '#contact'
    },
    {
        id: 'controle',
        title: 'Contrôle d\'Accès',
        shortDescription: 'Suivi temps réel des entrées/sorties.',
        description: 'Déployez très simplement un nombre illimité de points de contrôle. Vous savez en temps réel qui rentre, qui sort. Sécurisez vos événements efficacement.',
        image: 'https://www.mlg-consulting.com/manager_cc/docs/archives/e2o_control.png',
        cta: 'Contactez-nous',
        ctaLink: '#contact'
    },
    {
        id: 'hebergement',
        title: 'Hébergement Sécurisé',
        shortDescription: 'Infrastructure fiable et performante.',
        description: 'Une infrastructure fiable et performante. Un système de stockage sécurisé de forte capacité. SaaS : Software As A Service - Mode hébergé. EmS : Event Management Software.',
        image: 'https://www.mlg-consulting.com/manager_cc/docs/archives/eto_cloud2.png',
        cta: 'Contactez-nous',
        ctaLink: '#contact'
    },
    {
        id: 'social',
        title: 'Intégration Sociale',
        shortDescription: 'Connecté aux principaux médias sociaux.',
        description: 'Votre événement interagit avec les principaux médias sociaux. Diffusez et recevez automatiquement des flux d\'information en direction et en provenance de vos comptes existants.',
        image: 'https://www.mlg-consulting.com/manager_cc/docs/archives/eto_connector.png',
        cta: 'Contactez-nous',
        ctaLink: '#contact'
    }
];

export default function FeatureShowcase() {
    const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [progress, setProgress] = useState(0);
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const DURATION = 5000; // 5 seconds per slide
    const UPDATE_INTERVAL = 50; // Update progress every 50ms

    const activeFeature = features[activeFeatureIndex];

    useEffect(() => {
        if (!isAutoPlaying) {
            setProgress(0);
            return;
        }

        const startTime = Date.now();
        const startProgress = 0;

        progressIntervalRef.current = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const newProgress = Math.min((elapsed / DURATION) * 100, 100);

            setProgress(newProgress);

            if (elapsed >= DURATION) {
                setActiveFeatureIndex((prev) => (prev + 1) % features.length);
                // Reset for next slide is handled by the re-run of effect due to activeFeatureIndex change?
                // Actually, if activeFeatureIndex changes, this effect cleans up and restarts.
            }
        }, UPDATE_INTERVAL);

        return () => {
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
            }
        };
    }, [activeFeatureIndex, isAutoPlaying]);

    const handleFeatureClick = (index: number) => {
        setActiveFeatureIndex(index);
        setIsAutoPlaying(false);
        setProgress(0);
    };

    return (
        <section className="relative py-24 overflow-hidden bg-slate-950 border-y border-white/10">
            {/* Background Glow */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[100px] -translate-x-1/2"></div>
                <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] translate-x-1/2"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-16">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6">
                        <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                            Une plateforme complète
                        </span>
                    </h2>
                    <p className="text-lg text-slate-400 max-w-2xl">
                        Découvrez comment Event2One simplifie chaque étape de votre gestion d&apos;événements.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    {/* Left Column: Feature List */}
                    <div className="lg:col-span-4 flex flex-col gap-2">
                        {features.map((feature, index) => (
                            <button
                                key={feature.id}
                                onClick={() => handleFeatureClick(index)}
                                className={`group relative text-left p-4 rounded-xl transition-all duration-300 border ${index === activeFeatureIndex
                                        ? 'bg-white/10 border-teal-500/50 shadow-lg shadow-teal-500/10'
                                        : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/10'
                                    }`}
                            >
                                {/* Progress Bar for Active Item */}
                                {index === activeFeatureIndex && isAutoPlaying && (
                                    <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-50 ease-linear rounded-b-xl" style={{ width: `${progress}%` }}></div>
                                )}

                                <h3 className={`font-bold text-lg mb-1 transition-colors ${index === activeFeatureIndex ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                                    }`}>
                                    {feature.title}
                                </h3>
                                <p className={`text-sm transition-colors ${index === activeFeatureIndex ? 'text-teal-200' : 'text-slate-500 group-hover:text-slate-400'
                                    }`}>
                                    {feature.shortDescription}
                                </p>

                                {/* Active Indicator Arrow */}
                                {index === activeFeatureIndex && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-teal-400 hidden lg:block">
                                        →
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Right Column: Preview Area */}
                    <div className="lg:col-span-8">
                        <div className="relative h-full min-h-[500px] bg-slate-900/50 border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm group">
                            {/* Glow Effect behind image */}
                            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                            <div className="absolute inset-0 flex flex-col">
                                {/* Image Area */}
                                <div className="relative flex-grow overflow-hidden bg-slate-950/50">
                                    <Image
                                        src={activeFeature.image}
                                        alt={activeFeature.title}
                                        fill
                                        className="object-contain p-8 transition-transform duration-700 hover:scale-105"
                                        priority
                                    />
                                </div>

                                {/* Content Area Overlay */}
                                <div className="relative bg-slate-900/90 border-t border-white/10 p-8 backdrop-blur-md">
                                    <h3 className="text-2xl font-bold text-white mb-4">
                                        {activeFeature.title}
                                    </h3>
                                    <p className="text-slate-300 leading-relaxed mb-6 text-lg">
                                        {activeFeature.description}
                                    </p>
                                    <a
                                        href={activeFeature.ctaLink}
                                        className="inline-flex items-center gap-2 text-teal-400 font-semibold hover:text-teal-300 transition-colors group/link"
                                    >
                                        {activeFeature.cta}
                                        <span className="group-hover/link:translate-x-1 transition-transform">→</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

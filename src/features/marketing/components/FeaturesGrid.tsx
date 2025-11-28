'use client';

import { useEffect, useRef } from 'react';

const features = [
    {
        icon: '🎫',
        title: 'Billetterie Intelligente',
        description: 'Générez et gérez vos billets et badges PDF imprimables. Vos participants les reçoivent et les impriment directement chez eux.'
    },
    {
        icon: '🌐',
        title: 'Site Web Clé en Main',
        description: 'Déployez votre site web dédié et commencez à générer des inscriptions en quelques clics. 100% personnalisable.'
    },
    {
        icon: '✅',
        title: 'Contrôle d\'Accès',
        description: 'Prenez le contrôle de vos entrées et points d\'accès. Déployez un nombre illimité de points de contrôle en temps réel.'
    },
    {
        icon: '👥',
        title: 'Accueil Optimisé',
        description: 'Interface simple et performante pour identifier et badger. Concentrez-vous sur la qualité de l\'accueil de vos visiteurs.'
    },
    {
        icon: '☁️',
        title: 'Hébergement Sécurisé',
        description: 'Infrastructure fiable et performante. Système de stockage sécurisé de forte capacité en mode SaaS.'
    },
    {
        icon: '🔗',
        title: 'Intégrations Sociales',
        description: 'Votre événement interagit avec les principaux médias sociaux. Diffusez et recevez automatiquement des flux d\'information.'
    }
];

export default function FeaturesGrid() {
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-fade-in-up');
                    }
                });
            },
            { threshold: 0.1 }
        );

        const cards = sectionRef.current?.querySelectorAll('.feature-card');
        cards?.forEach((card) => observer.observe(card));

        return () => observer.disconnect();
    }, []);

    return (
        <section id="fonctionnalites" className="relative py-24 overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-slate-950"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_70%)]"></div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={sectionRef}>
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
                        <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                            Une interface unique pour piloter votre activité
                        </span>
                    </h2>
                    <p className="text-lg text-slate-400 max-w-3xl mx-auto">
                        Découvrez toutes les fonctionnalités qui font d&apos;Event2One la solution de référence pour vos événements professionnels
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="feature-card opacity-0 group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:-translate-y-2 hover:shadow-xl hover:shadow-teal-500/20"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            {/* Gradient Overlay on Hover */}
                            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/0 to-cyan-500/0 group-hover:from-teal-500/5 group-hover:to-cyan-500/5 rounded-2xl transition-all duration-300"></div>

                            <div className="relative z-10">
                                {/* Icon */}
                                <div className="w-16 h-16 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-lg shadow-teal-500/30 group-hover:shadow-teal-500/50 group-hover:scale-110 transition-all duration-300">
                                    {feature.icon}
                                </div>

                                {/* Title */}
                                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-teal-300 transition-colors duration-300">
                                    {feature.title}
                                </h3>

                                {/* Description */}
                                <p className="text-slate-400 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

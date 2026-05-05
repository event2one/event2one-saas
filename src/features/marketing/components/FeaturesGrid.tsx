'use client';

import { useEffect, useRef, useState } from 'react';

const features = [
    {
        icon: '🎫',
        title: 'Billetterie Intelligente',
        description: 'Générez et gérez vos billets et badges PDF imprimables. Vos participants les reçoivent et les impriment directement chez eux.',
        gradient: 'from-blue-500 to-cyan-500'
    },
    {
        icon: '🌐',
        title: 'Site Web Clé en Main',
        description: 'Déployez votre site web dédié et commencez à générer des inscriptions en quelques clics. 100% personnalisable.',
        gradient: 'from-purple-500 to-pink-500'
    },
    {
        icon: '✅',
        title: 'Contrôle d\'Accès',
        description: 'Prenez le contrôle de vos entrées et points d\'accès. Déployez un nombre illimité de points de contrôle en temps réel.',
        gradient: 'from-emerald-500 to-teal-500'
    },
    {
        icon: '👥',
        title: 'Accueil Optimisé',
        description: 'Interface simple et performante pour identifier et badger. Concentrez-vous sur la qualité de l\'accueil de vos visiteurs.',
        gradient: 'from-orange-500 to-red-500'
    },
    {
        icon: '☁️',
        title: 'Hébergement Sécurisé',
        description: 'Infrastructure fiable et performante. Système de stockage sécurisé de forte capacité en mode SaaS.',
        gradient: 'from-indigo-500 to-purple-500'
    },
    {
        icon: '🔗',
        title: 'Intégrations Sociales',
        description: 'Votre événement interagit avec les principaux médias sociaux. Diffusez et recevez automatiquement des flux d\'information.',
        gradient: 'from-pink-500 to-rose-500'
    }
];

export default function FeaturesGrid() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setMousePosition({ x, y });
        
        // Update CSS custom properties for spotlight effect
        e.currentTarget.style.setProperty('--mouse-x', `${x}%`);
        e.currentTarget.style.setProperty('--mouse-y', `${y}%`);
    };

    return (
        <section id="fonctionnalites" className="relative py-32 overflow-hidden">
            {/* Advanced Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"></div>
            <div className="absolute inset-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-cyan-500/5 rounded-full blur-2xl animate-pulse delay-500"></div>
            </div>

            <div 
                className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 spotlight-container" 
                ref={sectionRef}
                onMouseMove={handleMouseMove}
            >
                {/* Section Header */}
                <div className="text-center mb-20">
                    <div className="inline-flex items-center justify-center px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full mb-6">
                        <span className="text-sm font-medium text-blue-400">✨ Fonctionnalités</span>
                    </div>
                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
                        <span className="bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent">
                            Une interface unique pour
                        </span>
                        <br />
                        <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                            piloter votre activité
                        </span>
                    </h2>
                    <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
                        Découvrez toutes les fonctionnalités qui font d&apos;Event2One la solution de référence pour vos événements professionnels
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="feature-card opacity-0 group relative"
                            style={{ animationDelay: `${index * 150}ms` }}
                        >
                            {/* N8N Style Card */}
                            <div className="glow-card relative h-full p-8 backdrop-blur-xl border-white/10 overflow-hidden">
                                {/* Subtle Pattern Overlay */}
                                <div className="absolute inset-0 opacity-5">
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px]"></div>
                                </div>

                                {/* Content */}
                                <div className="relative z-10">
                                    {/* Icon with gradient background */}
                                    <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-500`}>
                                        <span className="filter drop-shadow-sm">{feature.icon}</span>
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-xl font-bold text-white mb-4 group-hover:text-blue-100 transition-colors duration-300">
                                        {feature.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors duration-300">
                                        {feature.description}
                                    </p>

                                    {/* Bottom accent line */}
                                    <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${feature.gradient} w-0 group-hover:w-full transition-all duration-500 rounded-full`}></div>
                                </div>

                                {/* Hover glow effect */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-2xl`}></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom CTA Section */}
                <div className="text-center mt-20">
                    <div className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/20 rounded-2xl group cursor-pointer hover:from-blue-500/30 hover:to-purple-500/30 transition-all duration-300">
                        <span className="text-white font-semibold mr-2">Découvrir toutes nos fonctionnalités</span>
                        <svg className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </div>
                </div>
            </div>
        </section>
    );
}

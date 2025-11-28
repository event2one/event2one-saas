'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const slides = [
    {
        title: 'Bien plus qu\'une simple solution de billetterie',
        description: 'Managez simplement l\'ensemble de vos services à partir d\'une interface commune. Event2one est une plateforme technologique simple, polyvalente et intuitive de gestion d\'événements, salons, forums et rendez-vous d\'affaires.',
        image: 'https://www.mlg-consulting.com/manager_cc/docs/archives/eto_capture.png',
        cta: 'Les fonctionnalités',
        ctaLink: '#fonctionnalites'
    },
    {
        title: 'Réservez le meilleur accueil à vos visiteurs',
        description: 'Une interface simple et performante pour identifier et badger. Vos équipes se concentrent sur la qualité de l\'accueil et sur la satisfaction de vos visiteurs et participants.',
        image: 'https://www.mlg-consulting.com/manager_cc/docs/archives/e2o_accuei.png',
        cta: 'Contactez-nous',
        ctaLink: '#contact'
    },
    {
        title: 'Plus de 15 ans d\'expérience',
        description: 'Conçu en 2003 et développé en permanence depuis par et pour des organisateurs de manifestations professionnelles. Event2One est une solution flexible livrée clé en main, disponible rapidement et sans aucune connaissance technique requise. Nous installons, hébergeons, maintenons votre solution de gestion d\'événements professionnels.',
        image: 'https://www.mlg-consulting.com/manager_cc/docs/archives/e2o_Icon_400.png',
        cta: 'Contactez-nous',
        ctaLink: '#contact'
    },
    {
        title: 'Votre site web clé en main',
        description: 'Déployez votre site web dédié et commencez à générer des inscriptions en quelques clics. 100% personnalisable selon vos besoins et votre charte graphique.',
        image: 'https://www.mlg-consulting.com/manager_cc/docs/archives/mini_site.png',
        cta: 'Contactez-nous',
        ctaLink: '#contact'
    },
    {
        title: 'Vos badges et billets PDF imprimables',
        description: 'Vos participants reçoivent un badge électronique et l\'impriment directement chez eux. Simplifiez la logistique et réduisez vos coûts d\'impression.',
        image: 'https://www.mlg-consulting.com/manager_cc/docs/archives/badge_pdf.png',
        cta: 'Contactez-nous',
        ctaLink: '#contact'
    },
    {
        title: 'Prenez le contrôle de vos entrées',
        description: 'Déployez très simplement un nombre illimité de points de contrôle. Vous savez en temps réel qui rentre, qui sort. Sécurisez vos événements efficacement.',
        image: 'https://www.mlg-consulting.com/manager_cc/docs/archives/e2o_control.png',
        cta: 'Contactez-nous',
        ctaLink: '#contact'
    },
    {
        title: 'Hébergement sécurisé',
        description: 'Une infrastructure fiable et performante. Un système de stockage sécurisé de forte capacité. SaaS : Software As A Service - Mode hébergé. EmS : Event Management Software - Progiciel de Gestion d\'événement.',
        image: 'https://www.mlg-consulting.com/manager_cc/docs/archives/eto_cloud2.png',
        cta: 'Contactez-nous',
        ctaLink: '#contact'
    },
    {
        title: 'Tout le monde réuni',
        description: 'Votre événement interagit avec les principaux médias sociaux. Diffusez et recevez automatiquement des flux d\'information en direction et en provenance de vos comptes existants.',
        image: 'https://www.mlg-consulting.com/manager_cc/docs/archives/eto_connector.png',
        cta: 'Contactez-nous',
        ctaLink: '#contact'
    }
];

export default function SolutionsCarousel() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    const totalSlides = slides.length;

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % totalSlides);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    };

    const goToSlide = (index: number) => {
        setCurrentSlide(index);
    };

    // Auto-advance carousel
    useEffect(() => {
        if (!isAutoPlaying) return;

        const interval = setInterval(nextSlide, 5000);
        return () => clearInterval(interval);
    }, [isAutoPlaying, currentSlide]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') {
                prevSlide();
                setIsAutoPlaying(false);
            } else if (e.key === 'ArrowRight') {
                nextSlide();
                setIsAutoPlaying(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <section
            id="solutions"
            className="relative py-24 overflow-hidden bg-black/20 border-y border-white/10"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
        >
            {/* Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.1),transparent_70%)]"></div>

            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
                        <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                            Nos Solutions en Détail
                        </span>
                    </h2>
                    <p className="text-lg text-slate-400">
                        Explorez toutes les possibilités offertes par Event2One
                    </p>
                </div>

                {/* Carousel Container */}
                <div className="relative">
                    {/* Slides */}
                    <div className="relative overflow-hidden rounded-2xl">
                        {slides.map((slide, index) => (
                            <div
                                key={index}
                                className={`transition-all duration-500 ${index === currentSlide
                                    ? 'opacity-100 relative'
                                    : 'opacity-0 absolute inset-0 pointer-events-none'
                                    }`}
                            >
                                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                                        {/* Text Content */}
                                        <div className="order-2 lg:order-1">
                                            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                                                {slide.title}
                                            </h3>
                                            <p className="text-slate-300 leading-relaxed mb-6">
                                                {slide.description}
                                            </p>
                                            <a
                                                href={slide.ctaLink}
                                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white rounded-lg font-semibold transition-all duration-300 shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 hover:-translate-y-1"
                                            >
                                                {slide.cta}
                                                <span>→</span>
                                            </a>
                                        </div>

                                        {/* Image */}
                                        <div className="order-1 lg:order-2">
                                            <div className="relative aspect-video rounded-xl overflow-hidden shadow-xl">
                                                <Image
                                                    src={slide.image}
                                                    alt={slide.title}
                                                    width={600}
                                                    height={400}
                                                    className="w-full h-full object-contain bg-slate-900/50"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Navigation Buttons */}
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white text-2xl transition-all duration-300 hover:scale-110 z-10"
                        aria-label="Précédent"
                    >
                        ‹
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white text-2xl transition-all duration-300 hover:scale-110 z-10"
                        aria-label="Suivant"
                    >
                        ›
                    </button>
                </div>

                {/* Indicators */}
                <div className="flex justify-center gap-2 mt-8">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`transition-all duration-300 rounded-full ${index === currentSlide
                                ? 'w-8 h-2 bg-gradient-to-r from-teal-500 to-cyan-500'
                                : 'w-2 h-2 bg-white/30 hover:bg-white/50'
                                }`}
                            aria-label={`Aller à la diapositive ${index + 1}`}
                        />
                    ))}
                </div>

                {/* Slide Counter */}
                <div className="text-center mt-4 text-slate-400 text-sm">
                    {currentSlide + 1} / {totalSlides}
                </div>
            </div>
        </section>
    );
}

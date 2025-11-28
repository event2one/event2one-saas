'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function MarketingNav() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        const element = document.getElementById(id);
        if (element) {
            e.preventDefault();
            const offset = 80;
            const elementPosition = element.offsetTop - offset;
            window.scrollTo({
                top: elementPosition,
                behavior: 'smooth'
            });
            setIsMobileMenuOpen(false);
        }
    };

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                ? 'bg-slate-950/95 backdrop-blur-md shadow-lg border-b border-white/10'
                : 'bg-slate-950/80 backdrop-blur-sm border-b border-white/5'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/marketing" className="text-2xl font-extrabold">
                        <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                            event2one
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <ul className="hidden md:flex items-center space-x-8">
                        <li>
                            <Link
                                href="/marketing#accueil"
                                onClick={(e) => scrollToSection(e, 'accueil')}
                                className="text-slate-300 hover:text-white transition-colors duration-200 font-medium relative group"
                            >
                                Accueil
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-teal-400 to-cyan-400 group-hover:w-full transition-all duration-300"></span>
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/marketing#fonctionnalites"
                                onClick={(e) => scrollToSection(e, 'fonctionnalites')}
                                className="text-slate-300 hover:text-white transition-colors duration-200 font-medium relative group"
                            >
                                Fonctionnalités
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-teal-400 to-cyan-400 group-hover:w-full transition-all duration-300"></span>
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/marketing#solutions"
                                onClick={(e) => scrollToSection(e, 'solutions')}
                                className="text-slate-300 hover:text-white transition-colors duration-200 font-medium relative group"
                            >
                                Solutions
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-teal-400 to-cyan-400 group-hover:w-full transition-all duration-300"></span>
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/marketing/pricing"
                                className="text-slate-300 hover:text-white transition-colors duration-200 font-medium relative group"
                            >
                                Tarification
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-teal-400 to-cyan-400 group-hover:w-full transition-all duration-300"></span>
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/marketing#experience"
                                onClick={(e) => scrollToSection(e, 'experience')}
                                className="text-slate-300 hover:text-white transition-colors duration-200 font-medium relative group"
                            >
                                Expérience
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-teal-400 to-cyan-400 group-hover:w-full transition-all duration-300"></span>
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/marketing#contact"
                                onClick={(e) => scrollToSection(e, 'contact')}
                                className="px-6 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 hover:-translate-y-0.5"
                            >
                                Contact
                            </Link>
                        </li>
                    </ul>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden text-white text-2xl focus:outline-none"
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? '✕' : '☰'}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-white/10">
                        <ul className="space-y-4">
                            <li>
                                <Link
                                    href="/marketing#accueil"
                                    onClick={(e) => scrollToSection(e, 'accueil')}
                                    className="block text-slate-300 hover:text-white transition-colors duration-200 font-medium"
                                >
                                    Accueil
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/marketing#fonctionnalites"
                                    onClick={(e) => scrollToSection(e, 'fonctionnalites')}
                                    className="block text-slate-300 hover:text-white transition-colors duration-200 font-medium"
                                >
                                    Fonctionnalités
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/marketing#solutions"
                                    onClick={(e) => scrollToSection(e, 'solutions')}
                                    className="block text-slate-300 hover:text-white transition-colors duration-200 font-medium"
                                >
                                    Solutions
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/marketing/pricing"
                                    className="block text-slate-300 hover:text-white transition-colors duration-200 font-medium"
                                >
                                    Tarification
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/marketing#experience"
                                    onClick={(e) => scrollToSection(e, 'experience')}
                                    className="block text-slate-300 hover:text-white transition-colors duration-200 font-medium"
                                >
                                    Expérience
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/marketing#contact"
                                    onClick={(e) => scrollToSection(e, 'contact')}
                                    className="block px-6 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg font-semibold text-center"
                                >
                                    Contact
                                </Link>
                            </li>
                        </ul>
                    </div>
                )}
            </div>
        </nav>
    );
}

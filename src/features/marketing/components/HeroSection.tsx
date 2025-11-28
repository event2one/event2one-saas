import Link from 'next/link';
import Image from 'next/image';

export default function HeroSection() {
    return (
        <section id="accueil" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-cyan-950 to-slate-950"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(94,234,212,0.15),transparent_50%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(6,182,212,0.1),transparent_50%)]"></div>

            {/* Animated Gradient Orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

            {/* Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                <div className="animate-fade-in-up">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight">
                        <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                            Bien plus qu&apos;une simple
                        </span>
                        <br />
                        <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                            solution de billetterie
                        </span>
                    </h1>

                    <p className="text-lg sm:text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed">
                        Managez simplement l&apos;ensemble de vos services à partir d&apos;une interface commune.
                        Une plateforme technologique simple, polyvalente et intuitive de gestion d&apos;événements.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                        <a
                            href="#fonctionnalites"
                            className="group px-8 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 hover:-translate-y-1 flex items-center justify-center gap-2"
                        >
                            Découvrir les fonctionnalités
                            <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                        </a>
                        <a
                            href="#contact"
                            className="px-8 py-4 bg-white/10 hover:bg-white/15 backdrop-blur-sm text-white rounded-xl font-semibold text-lg transition-all duration-300 border border-white/20 hover:border-white/30 hover:-translate-y-1"
                        >
                            Contactez-nous
                        </a>
                    </div>

                    {/* Hero Image */}
                    <div className="relative max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-2xl shadow-teal-500/20 border border-white/10 backdrop-blur-sm bg-white/5 p-2">
                        <div className="relative aspect-video rounded-xl overflow-hidden">
                            <Image
                                src="https://www.mlg-consulting.com/manager_cc/docs/archives/eto_capture.png"
                                alt="Interface Event2One"
                                width={1200}
                                height={675}
                                className="w-full h-full object-cover"
                                priority
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
                    <div className="w-1 h-3 bg-white/50 rounded-full"></div>
                </div>
            </div>
        </section>
    );
}

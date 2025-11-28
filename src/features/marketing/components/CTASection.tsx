export default function CTASection() {
    return (
        <section id="contact" className="relative py-24 overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-slate-950"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.15),transparent_70%)]"></div>

            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-gradient-to-br from-teal-600/20 to-cyan-600/20 backdrop-blur-sm border border-white/20 rounded-3xl p-12 text-center shadow-2xl shadow-teal-500/20">
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 rounded-3xl"></div>

                    <div className="relative z-10">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6">
                            <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                                Prêt à transformer vos événements ?
                            </span>
                        </h2>

                        <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                            Vous pouvez enfin vous concentrer sur votre cœur de métier, nous nous chargeons des outils pour vous.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="mailto:contact@event2one.com"
                                className="group px-8 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 hover:-translate-y-1 flex items-center justify-center gap-2"
                            >
                                Contactez-nous
                                <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                            </a>
                            <a
                                href="/marketing/pricing"
                                className="px-8 py-4 bg-white/10 hover:bg-white/15 backdrop-blur-sm text-white rounded-xl font-semibold text-lg transition-all duration-300 border border-white/20 hover:border-white/30 hover:-translate-y-1"
                            >
                                Voir les tarifs
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

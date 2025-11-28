export default function StatsSection() {
    const stats = [
        { number: '15+', label: 'Années d\'expérience' },
        { number: '100%', label: 'Clé en main' },
        { number: '24/7', label: 'Support disponible' },
        { number: '∞', label: 'Points de contrôle' }
    ];

    return (
        <section id="experience" className="relative py-24 overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-slate-950"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_70%)]"></div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
                        <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                            Une expertise reconnue
                        </span>
                    </h2>
                    <p className="text-lg text-slate-400 max-w-3xl mx-auto">
                        Notre expérience et notre vision à 360°, en terme d&apos;organisation de salons professionnels et notre expertise sont fondamentales dans la conception et les évolutions permanentes de la plateforme Event2One.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:-translate-y-2 hover:shadow-xl hover:shadow-teal-500/20"
                        >
                            <div className="text-5xl md:text-6xl font-black mb-3 bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300 inline-block">
                                {stat.number}
                            </div>
                            <div className="text-slate-300 font-medium text-lg">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

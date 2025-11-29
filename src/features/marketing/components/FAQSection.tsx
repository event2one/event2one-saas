'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const faqs = [
    {
        question: "Comment fonctionne la plateforme Event2One ?",
        answer: "Event2One est une solution tout-en-un pour la gestion de vos événements. De la création de site web à la gestion des inscriptions, en passant par le vote en direct et la diffusion, nous centralisons tous les outils dont vous avez besoin."
    },
    {
        question: "Puis-je personnaliser l'apparence de mes événements ?",
        answer: "Absolument ! Notre plateforme offre des options de personnalisation avancées pour que vos événements reflètent parfaitement votre image de marque. Couleurs, logos, mise en page... tout est configurable."
    },
    {
        question: "Quels types d'événements puis-je organiser ?",
        answer: "Event2One est conçu pour s'adapter à tous types d'événements : conférences, séminaires, webinaires, compétitions, festivals, et bien plus encore, qu'ils soient physiques, virtuels ou hybrides."
    },
    {
        question: "Proposez-vous un support technique ?",
        answer: "Oui, notre équipe de support est disponible pour vous accompagner à chaque étape. Nous proposons également une documentation complète et des tutoriels pour vous aider à tirer le meilleur parti de la plateforme."
    },
    {
        question: "Comment se passe la facturation ?",
        answer: "Nous proposons des plans tarifaires flexibles adaptés à vos besoins. Vous pouvez opter pour un abonnement mensuel ou annuel, ou payer à l'événement. Contactez-nous pour une offre personnalisée."
    }
];

export default function FAQSection() {
    const [activeIndex, setActiveIndex] = useState<number | null>(0);

    return (
        <section className="relative py-24 overflow-hidden" id="faq">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-slate-950"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl bg-[radial-gradient(circle_at_50%_0%,rgba(45,212,191,0.15),transparent_50%)]"></div>

            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6">
                        <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                            Questions Fréquentes
                        </span>
                    </h2>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        Tout ce que vous devez savoir pour commencer avec Event2One.
                    </p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className={`group rounded-2xl border transition-all duration-300 ${activeIndex === index
                                    ? 'bg-white/5 border-teal-500/30 shadow-lg shadow-teal-500/10'
                                    : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                                }`}
                        >
                            <button
                                onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                                className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left"
                            >
                                <span className={`text-lg font-semibold transition-colors duration-300 ${activeIndex === index ? 'text-teal-400' : 'text-slate-200 group-hover:text-white'
                                    }`}>
                                    {faq.question}
                                </span>
                                <span className={`flex-shrink-0 p-2 rounded-full transition-all duration-300 ${activeIndex === index
                                        ? 'bg-teal-500/20 text-teal-400 rotate-180'
                                        : 'bg-white/5 text-slate-400 group-hover:bg-white/10 group-hover:text-white'
                                    }`}>
                                    {activeIndex === index ? <Minus size={20} /> : <Plus size={20} />}
                                </span>
                            </button>

                            <AnimatePresence>
                                {activeIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-6 pb-6 pt-0 text-slate-400 leading-relaxed">
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

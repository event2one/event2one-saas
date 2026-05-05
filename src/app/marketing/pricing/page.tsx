import React from 'react';
import { Metadata } from 'next';
import { CheckCircle, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Tarification - Event2one',
    description: 'Choisissez le plan parfait pour votre événement. De la découverte gratuite aux solutions d\'entreprise sur mesure.',
};

export default function PricingPage() {
    const plans = [
        {
            title: 'Plan Découverte',
            subtitle: 'Idéal pour débuter et découvrir la puissance d\'Event2one',
            price: '0€',
            period: '/mois',
            metric: '150',
            metricLabel: 'Participants maximum\navec événements illimités',
            features: [
                'Max. 150 Participants',
                'Branding Event2one.com obligatoire',
                'Outils de Billetterie de Base',
                'Support Communautaire'
            ],
            ctaLabel: 'Démarrer l\'événement',
            ctaSubLabel: 'Gratuit pour toujours',
            ctaLink: '/signup',
            hosted: 'Hébergé par Event2one'
        },
        {
            title: 'Plan Équipe',
            subtitle: 'Pour les équipes professionnelles organisant des événements récurrents',
            price: '199€',
            period: '/mois et plus',
            metric: '1500',
            metricLabel: 'Participants maximum\navec fonctionnalités avancées',
            features: [
                'Jusqu\'à 1500 Participants',
                'Branding Personnalisé (Marque Blanche)',
                'Networking & Matchmaking',
                'Intégrations CRM de base',
                'Agent IA de Planification (MCP de base)'
            ],
            ctaLabel: 'S\'abonner / Essai Gratuit',
            ctaSubLabel: 'Essai gratuit 14 jours',
            ctaLink: '/signup?plan=team',
            hosted: 'Hébergé par Event2one',
            highlight: true
        },
        {
            title: 'Plan Organisationnel',
            subtitle: 'Pour les grandes organisations avec des besoins spécifiques',
            price: 'Sur Devis',
            period: '',
            metric: '∞',
            metricLabel: 'Participants illimités\navec solutions sur mesure',
            features: [
                'Participants Illimités',
                'App Mobile en Marque Blanche',
                'Accès Complet au MCP (Analyse Prédictive)',
                'Sécurité Avancée (SSO, Audit)',
                'Accords de Niveau de Service (SLA)'
            ],
            ctaLabel: 'Demander une Démo',
            ctaSubLabel: '',
            ctaLink: '/contact',
            hosted: 'Hébergé par Event2one ou Auto-hébergé'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-900">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-cyan-500/5 to-transparent rounded-full"></div>
            </div>

            <div className="relative z-10 pt-20 pb-32">
                {/* Header */}
                <div className="max-w-4xl mx-auto text-center px-4 mb-16">
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
                        Pricing
                    </h1>
                    <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                        Tous les plans incluent des utilisateurs illimités et toutes les intégrations.
                        <br />
                        Choisissez le plan parfait pour la gestion d'événements professionnels.
                    </p>
                    
                    {/* Billing Toggle */}
                    <div className="inline-flex items-center bg-white/5 backdrop-blur-sm rounded-full p-1 border border-white/10">
                        <button className="px-6 py-2 text-sm font-medium text-white bg-blue-500/20 rounded-full border border-blue-500/30">
                            Monthly
                        </button>
                        <button className="px-6 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors">
                            Annually (Save 17%)
                        </button>
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map((plan, index) => (
                        <div 
                            key={plan.title}
                            className={`relative group ${
                                plan.highlight 
                                    ? 'transform scale-105 z-20' 
                                    : 'hover:scale-105 transition-transform duration-300'
                            }`}
                        >
                            {/* Liquid Glass Card */}
                            <div className={`
                                relative h-full p-8 rounded-3xl border backdrop-blur-xl overflow-hidden
                                ${plan.highlight 
                                    ? 'bg-gradient-to-br from-blue-500/20 to-purple-600/20 border-blue-400/30 shadow-2xl shadow-blue-500/20' 
                                    : 'bg-white/5 border-white/10 hover:bg-white/10 transition-colors duration-300'
                                }
                            `}>
                                {/* Glow effect for highlighted card */}
                                {plan.highlight && (
                                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-400/20 to-purple-600/20 blur-xl -z-10"></div>
                                )}
                                
                                {/* Card Header */}
                                <div className="mb-8">
                                    <h3 className="text-2xl font-bold text-white mb-2">{plan.title}</h3>
                                    <p className="text-sm text-slate-400 leading-relaxed">{plan.subtitle}</p>
                                </div>

                                {/* Pricing */}
                                <div className="mb-8">
                                    <div className="flex items-baseline mb-2">
                                        <span className="text-4xl font-bold text-white">{plan.price}</span>
                                        {plan.period && (
                                            <span className="text-slate-400 ml-1">{plan.period}</span>
                                        )}
                                    </div>
                                    {plan.metric && (
                                        <div className="flex items-center gap-2 text-slate-300">
                                            <span className="text-2xl font-semibold">{plan.metric}</span>
                                            <div className="text-sm leading-tight whitespace-pre-line">
                                                {plan.metricLabel}
                                            </div>
                                        </div>
                                    )}
                                    {!plan.metric && plan.metricLabel && (
                                        <div className="text-sm text-slate-300 whitespace-pre-line">
                                            {plan.metricLabel}
                                        </div>
                                    )}
                                </div>

                                {/* CTA Button */}
                                <div className="mb-8">
                                    <a
                                        href={plan.ctaLink}
                                        className={`
                                            w-full inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold transition-all duration-300 group
                                            ${plan.highlight 
                                                ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/25' 
                                                : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                                            }
                                        `}
                                    >
                                        {plan.ctaLabel}
                                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </a>
                                    {plan.ctaSubLabel && (
                                        <p className="text-xs text-slate-400 text-center mt-2">{plan.ctaSubLabel}</p>
                                    )}
                                </div>

                                {/* Hosted Badge */}
                                <div className="flex items-center gap-2 text-xs text-slate-400 mb-6 pb-6 border-b border-white/10">
                                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                    {plan.hosted}
                                </div>

                                {/* Features */}
                                <div>
                                    <p className="text-sm font-medium text-slate-300 mb-4">
                                        {index === 0 ? 'Ce plan inclut :' : `Tout dans le plan ${plans[index-1]?.title}, plus :`}
                                    </p>
                                    <ul className="space-y-3">
                                        {plan.features.map((feature, featureIndex) => (
                                            <li key={featureIndex} className="flex items-start gap-3 text-sm text-slate-300">
                                                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Additional Info */}
                <div className="max-w-4xl mx-auto text-center mt-20 px-4">
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                        <h3 className="text-xl font-bold text-white mb-4">
                            Une solution complète pour tous vos événements
                        </h3>
                        <p className="text-slate-300">
                            De l'événement découverte gratuit aux solutions d'entreprise sur mesure, Event2one s'adapte à vos besoins et grandit avec votre organisation.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

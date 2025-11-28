import React from 'react';
import PricingCard from '@/components/PricingCard';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Tarification - Event2one',
    description: 'Choisissez le plan parfait pour votre événement. De la découverte gratuite aux solutions d\'entreprise sur mesure.',
};

export default function PricingPage() {
    const plans = [
        {
            title: 'Plan Découverte',
            price: '0 €/mois',
            features: [
                'Max. 150 Participants',
                'Branding Event2one.com obligatoire',
                'Outils de Billetterie de Base',
                'Support Communautaire',
            ],
            ctaLabel: 'Démarrer l\'événement',
            ctaLink: '/signup',
        },
        {
            title: 'Plan Équipe',
            price: '199 €/mois+',
            features: [
                'Jusqu\'à 1500 Participants',
                'Branding Personnalisé (Marque Blanche)',
                'Networking & Matchmaking',
                'Intégrations CRM de base',
                'Agent IA de Planification (MCP de base)',
            ],
            ctaLabel: 'S\'abonner / Essai Gratuit',
            ctaLink: '/signup?plan=team',
            highlight: true,
        },
        {
            title: 'Plan Organisationnel',
            price: 'Sur Devis',
            features: [
                'Participants Illimités',
                'App Mobile en Marque Blanche',
                'Accès Complet au MCP (Analyse Prédictive)',
                'Sécurité Avancée (SSO, Audit)',
                'Accords de Niveau de Service (SLA)',
            ],
            ctaLabel: 'Demander une Démo',
            ctaLink: '/contact',
        },
    ];

    return (
        <section className="py-24" id="pricing">
            <div className="max-w-6xl mx-auto px-4">
                <h1 className="text-4xl md:text-5xl font-extrabold text-center text-white mb-12">
                    Choisissez le plan parfait pour votre événement
                </h1>
                <p className="text-lg text-slate-300 text-center mb-16">
                    La gestion d'événement professionnel simplifiée.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((plan, idx) => (
                        <PricingCard
                            key={idx}
                            title={plan.title}
                            price={plan.price}
                            features={plan.features}
                            ctaLabel={plan.ctaLabel}
                            ctaLink={plan.ctaLink}
                            highlight={plan.highlight}
                        />
                    ))}
                </div>
                <div className="mt-12 text-center">
                    <a href="/compare" className="text-teal-400 hover:underline">
                        Comparez toutes les fonctionnalités
                    </a>
                </div>
            </div>
        </section>
    );
}

import React from 'react';

interface PricingCardProps {
    title: string;
    price: string;
    features: string[];
    ctaLabel: string;
    ctaLink: string;
    highlight?: boolean;
}

export default function PricingCard({
    title,
    price,
    features,
    ctaLabel,
    ctaLink,
    highlight = false,
}: PricingCardProps) {
    return (
        <div
            className={`flex flex-col p-8 rounded-3xl border-2 transition-shadow duration-300 ${highlight
                    ? 'border-teal-400 bg-gradient-to-br from-teal-600/20 to-cyan-600/20 shadow-xl shadow-teal-500/30'
                    : 'border-white/20 bg-white/5 backdrop-blur-sm'
                }`}
        >
            <h3 className="text-2xl font-bold mb-4 text-white">{title}</h3>
            <p className="text-4xl font-extrabold mb-6 text-white">{price}</p>
            <ul className="flex-1 mb-6 space-y-2 text-white/80">
                {features.map((feat, idx) => (
                    <li key={idx} className="flex items-center">
                        <svg
                            className="w-4 h-4 mr-2 text-teal-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feat}
                    </li>
                ))}
            </ul>
            <a
                href={ctaLink}
                className={`mt-auto px-6 py-3 text-center font-semibold rounded-xl transition-all duration-300 ${highlight
                        ? 'bg-teal-500 hover:bg-teal-600 text-white'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
            >
                {ctaLabel}
            </a>
        </div>
    );
}

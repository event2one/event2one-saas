import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, User, Building2, Clock } from 'lucide-react';

interface UserConnectionToastProps {
    id: string;
    name: string;
    company: string;
    timestamp: number;
    onDismiss: (id: string) => void;
}

export function UserConnectionToast({ id, name, company, timestamp, onDismiss }: UserConnectionToastProps) {
    // Auto-dismiss after 10 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss(id);
        }, 10000);

        return () => clearTimeout(timer);
    }, [id, onDismiss]);

    const formatTime = (ts: number) => {
        const date = new Date(ts);
        return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg shadow-2xl p-4 mb-3 min-w-[320px] max-w-[400px] border border-emerald-500/50"
        >
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-sm truncate">{name}</h4>
                        <button
                            onClick={() => onDismiss(id)}
                            className="flex-shrink-0 text-white/70 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-emerald-50 mb-1">
                        <Building2 className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{company}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-emerald-100">
                        <Clock className="w-3 h-3 flex-shrink-0" />
                        <span>{formatTime(timestamp)}</span>
                    </div>
                </div>
            </div>
            <div className="mt-2 pt-2 border-t border-white/20">
                <p className="text-xs text-emerald-50">Nouveau participant connecté</p>
            </div>
        </motion.div>
    );
}

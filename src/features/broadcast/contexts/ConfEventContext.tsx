'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { ConfEvent } from '@/features/broadcast/types';

// Extended ConfEvent interface to include id_jury_event if it exists in the API
export interface ConfEventContextData {
    id_conf_event: string;
    cel_titre: string;
    heure_debut: string;
    heure_fin: string;
    type?: {
        id_conf_event_type: string;
        conf_event_type_nom: string;
        picto: string;
        visuel: string;
        color: string;
    };
    id_jury_event?: number;
    id_event?: string;
}

interface ConfEventContextType {
    confEvent: ConfEventContextData | null;
    isLoading: boolean;
}

const ConfEventContext = createContext<ConfEventContextType | undefined>(undefined);

interface ConfEventProviderProps {
    children: ReactNode;
    confEvent: ConfEventContextData | null;
    isLoading?: boolean;
}

export function ConfEventProvider({ children, confEvent, isLoading = false }: ConfEventProviderProps) {
    return (
        <ConfEventContext.Provider value={{ confEvent, isLoading }}>
            {children}
        </ConfEventContext.Provider>
    );
}

export function useConfEvent() {
    const context = useContext(ConfEventContext);
    if (context === undefined) {
        throw new Error('useConfEvent must be used within a ConfEventProvider');
    }
    return context;
}

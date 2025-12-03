'use client';

// Better Auth Provider - will be implemented when database is connected
import React from 'react';

interface AuthProviderProps {
    children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
    // For now, just return children without session management
    // This will be updated to use Better Auth once database is connected
    return <>{children}</>;
}
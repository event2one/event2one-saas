// src/components/AdminLayout.tsx
import React, { ReactNode } from 'react';
import { ThemeToggle } from './ThemeToggle';

/**
 * Simple layout component used by the migrated admin pages.
 * It renders a header (you can replace with your own) and wraps the page content.
 */
const AdminLayout = ({ children }: { children: ReactNode }) => {
    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white">
            {/* Header – you can replace with a proper navigation bar */}
            <header className="bg-neutral-800 p-4 shadow-md flex items-center justify-between">
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
                <ThemeToggle />
            </header>
            <main className="p-4">{children}</main>
            {/* Footer – optional */}
            <footer className="bg-neutral-800 p-2 text-center text-sm">
                © {new Date().getFullYear()} Broadcast Manager
            </footer>
        </div>
    );
};

export default AdminLayout;

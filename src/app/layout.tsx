import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import AuthProvider from "@/components/AuthProvider";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "event2one",
  description: "Plateforme de gestion d'événements",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="antialiased flex flex-col min-h-screen">
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="flex-1">{children}</div>
            <footer className="border-t bg-background px-6 py-2 flex items-center justify-between">
              <span className="text-xs text-muted-foreground/50 select-none">event2one</span>
              <ThemeToggle />
            </footer>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

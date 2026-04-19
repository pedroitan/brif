import type { Metadata } from 'next';
import '@brif/ui/globals.css';
import { Providers } from '@/components/providers';

export const metadata: Metadata = {
  title: 'BRIF — Agência Demo',
  description: 'Plataforma de gestão de briefings com IA',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

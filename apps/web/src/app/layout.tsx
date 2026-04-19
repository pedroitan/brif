import type { Metadata } from 'next';
import { Outfit, Syne, JetBrains_Mono } from 'next/font/google';
import '@brif/ui/globals.css';
import { Providers } from '@/components/providers';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
  weight: ['400', '600', '700', '800'],
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'BRIF — Agência Demo',
  description: 'Plataforma de gestão de briefings com IA',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${outfit.variable} ${syne.variable} ${jetbrains.variable}`}
    >
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              :root {
                ${process.env.NEXT_PUBLIC_BRAND_COLOR ? `--brand-primary: ${process.env.NEXT_PUBLIC_BRAND_COLOR};` : ''}
                ${process.env.NEXT_PUBLIC_ACCENT_COLOR ? `--brand-accent: ${process.env.NEXT_PUBLIC_ACCENT_COLOR};` : ''}
              }
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

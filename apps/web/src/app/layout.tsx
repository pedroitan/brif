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

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  console.log('Brand color env:', process.env.NEXT_PUBLIC_BRAND_COLOR);
  console.log('Accent color env:', process.env.NEXT_PUBLIC_ACCENT_COLOR);
  console.log('BG color env:', process.env.NEXT_PUBLIC_BG_COLOR);
  
  const brandColor = process.env.NEXT_PUBLIC_BRAND_COLOR;
  const brandHsl = brandColor ? hexToHsl(brandColor) : null;
  
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
                ${process.env.NEXT_PUBLIC_BG_COLOR ? `--brand-bg: ${process.env.NEXT_PUBLIC_BG_COLOR};` : ''}
                ${process.env.NEXT_PUBLIC_BRAND_COLOR ? `--brif-navy: ${process.env.NEXT_PUBLIC_BRAND_COLOR};` : ''}
                ${process.env.NEXT_PUBLIC_BRAND_COLOR ? `--brif-navy-2: ${process.env.NEXT_PUBLIC_BRAND_COLOR};` : ''}
                ${process.env.NEXT_PUBLIC_BRAND_COLOR ? `--brif-navy-3: ${process.env.NEXT_PUBLIC_BRAND_COLOR};` : ''}
                ${process.env.NEXT_PUBLIC_BRAND_COLOR ? `--brif-teal: ${process.env.NEXT_PUBLIC_BRAND_COLOR};` : ''}
                ${process.env.NEXT_PUBLIC_BRAND_COLOR ? `--brif-teal-d: ${process.env.NEXT_PUBLIC_BRAND_COLOR};` : ''}
                ${process.env.NEXT_PUBLIC_BG_COLOR ? `--brif-teal-l: ${process.env.NEXT_PUBLIC_BG_COLOR};` : ''}
                ${process.env.NEXT_PUBLIC_ACCENT_COLOR ? `--brif-amber: ${process.env.NEXT_PUBLIC_ACCENT_COLOR};` : ''}
                ${process.env.NEXT_PUBLIC_BG_COLOR ? `--brif-amber-l: ${process.env.NEXT_PUBLIC_BG_COLOR};` : ''}
                ${process.env.NEXT_PUBLIC_BRAND_COLOR ? `--brif-ink: ${process.env.NEXT_PUBLIC_BRAND_COLOR};` : ''}
                ${process.env.NEXT_PUBLIC_BRAND_COLOR ? `--brif-muted: ${process.env.NEXT_PUBLIC_BRAND_COLOR};` : ''}
                ${process.env.NEXT_PUBLIC_BG_COLOR ? `--brif-surf: ${process.env.NEXT_PUBLIC_BG_COLOR};` : ''}
                ${process.env.NEXT_PUBLIC_BG_COLOR ? `--brif-surf-2: ${process.env.NEXT_PUBLIC_BG_COLOR};` : ''}
                ${brandHsl ? `--brand-primary-h: ${brandHsl.h};` : ''}
                ${brandHsl ? `--brand-primary-s: ${brandHsl.s}%;` : ''}
                ${brandHsl ? `--brand-primary-l: ${brandHsl.l}%;` : ''}
                /* Neutral colors for better legibility */
                --text-primary: #374151;
                --text-secondary: #6B7280;
                --text-muted: #9CA3AF;
                --bg-primary: #FFFFFF;
                --bg-secondary: #F9FAFB;
                --bg-tertiary: #F3F4F6;
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

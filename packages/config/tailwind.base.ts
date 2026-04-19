import type { Config } from 'tailwindcss';

/**
 * Base Tailwind config shared by all apps.
 * Each app extends this and adds its own `content` paths.
 */
export const baseConfig: Omit<Config, 'content'> = {
  darkMode: ['class'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // BRIF brand palette (direto dos wireframes)
        brif: {
          navy: '#0B1829',
          'navy-2': '#152238',
          'navy-3': '#1E3251',
          teal: 'var(--brand-primary, #0D9E78)',
          'teal-d': 'var(--brand-primary-d, #0A7D60)',
          'teal-l': 'var(--brand-primary-l, #E6F7F2)',
          amber: '#E09B2A',
          'amber-l': '#FEF6E4',
          red: '#DC3545',
          'red-l': '#FDECEA',
          blue: 'var(--brand-accent, #2D7DD2)',
          'blue-l': 'var(--brand-accent-l, #EBF3FC)',
          ink: '#1A2130',
          muted: '#6B7A8D',
          border: '#E2E8F0',
          'border-2': '#CBD5E0',
          surf: '#F8FAFC',
          'surf-2': '#F1F5F9',
        },
      },
      fontFamily: {
        sans: ['var(--font-outfit)', 'system-ui', 'sans-serif'],
        display: ['var(--font-syne)', 'var(--font-outfit)', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
};

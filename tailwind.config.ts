import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        /* DEEP MIDNIGHT + SECONDARY BACKGROUND */
        navy: {
          DEFAULT: '#070A10',
          soft: '#0D121A',
          line: '#1A2432',
        },
        /* BABY BLUE — primary interactive colour */
        baby: {
          DEFAULT: '#8ECBF2',
          deep: '#5BAEE0',
          dim: '#4A6B85',
        },
        /* SUNSHINE YELLOW — journey markers + highlights */
        sun: {
          DEFAULT: '#FFD34D',
          deep: '#E8B52B',
        },
        /* SOFT CORAL RED — very limited accent / CTA states */
        accent: {
          red: '#FF5C5C',
        },
        /* TYPE */
        offwhite: '#F4F6F8',
        muted: '#9DA9B7',
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        widest2: '0.32em',
      },
      animation: {
        'pulse-soft': 'pulseSoft 2.6s ease-in-out infinite',
        'drop-hint': 'dropHint 1.9s ease-in-out infinite',
        'marquee-slow': 'marqueeSlow 46s linear infinite',
        'marquee-rev': 'marqueeSlow 46s linear infinite reverse',
        'scan-line': 'scanLine 3.4s linear infinite',
        'blink': 'blink 1.1s steps(1) infinite',
        'spin-slow': 'spin 14s linear infinite',
      },
      keyframes: {
        pulseSoft: {
          '0%, 100%': { opacity: '0.45' },
          '50%': { opacity: '1' },
        },
        dropHint: {
          '0%, 100%': { transform: 'translateY(0)', opacity: '0.55' },
          '50%': { transform: 'translateY(9px)', opacity: '1' },
        },
        marqueeSlow: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        scanLine: {
          '0%': { top: '-12%' },
          '100%': { top: '108%' },
        },
        blink: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;

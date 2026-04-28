import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#002D56',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#7599BA',
          foreground: '#FFFFFF',
        },
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        muted: {
          DEFAULT: '#F5F5F5',
          foreground: '#737373',
        },
        accent: {
          DEFAULT: '#F1EEE9',
          foreground: '#0A0A0A',
        },
        destructive: {
          DEFAULT: '#DC2626',
          foreground: '#FFFFFF',
        },
        border: '#E5E5E5',
        input: '#E5E5E5',
        ring: '#002D56',
        slot: {
          available: '#F1EEE9',
          selected: '#7599BA',
          reserved: '#002D56',
          past: '#AAAAAA',
        },
      },
      borderRadius: {
        sm: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
      },
    },
  },
  plugins: [],
};

export default config;

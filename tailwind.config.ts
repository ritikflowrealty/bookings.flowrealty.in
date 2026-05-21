import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#0B0B0F',
          soft: '#111114',
          card: '#16161B',
          graphite: '#1F1F26',
        },
        neon: {
          purple: '#7B2EFF',
          magenta: '#D92EFF',
          pink: '#FF3C82',
          orange: '#FF6A00',
          blue: '#00AEEF',
        },
        ink: {
          DEFAULT: '#F5F5F5',
          muted: '#9CA0A8',
          dim: '#6B6F78',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Poppins', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'EB Garamond', 'Georgia', 'serif'],
        heading: ['"Aptos Narrow"', 'var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'neon-gradient':
          'linear-gradient(135deg, #7B2EFF 0%, #D92EFF 35%, #FF3C82 65%, #FF6A00 100%)',
        'grid-pattern':
          'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
      },
      boxShadow: {
        glow: '0 0 40px rgba(123, 46, 255, 0.35), 0 0 80px rgba(217, 46, 255, 0.15)',
        'glow-pink': '0 0 40px rgba(255, 60, 130, 0.35)',
        card: '0 30px 60px -20px rgba(0,0,0,0.7), 0 8px 24px -8px rgba(123,46,255,0.15)',
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        shimmer: 'shimmer 3s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;

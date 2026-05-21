/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          violet:  '#7C3AED',
          indigo:  '#6366F1',
          purple:  '#A78BFA',
          teal:    '#14B8A6',
          emerald: '#10B981',
          rose:    '#F43F5E',
        },
        glass: {
          white:  'rgba(255,255,255,0.12)',
          border: 'rgba(255,255,255,0.18)',
          dark:   'rgba(15,15,30,0.55)',
        },
        surface: 'var(--surface)',
        'surface-1': 'var(--surface-1)',
        'surface-2': 'var(--surface-2)',
        'surface-3': 'var(--surface-3)',
        'on-surface': 'var(--on-surface)',
        'on-surface-muted': 'var(--on-surface-muted)',
        outline: 'var(--outline)',
        'outline-strong': 'var(--outline-strong)',
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient':
          'linear-gradient(135deg, #0f0c29 0%, #1a1a4e 30%, #0d2136 60%, #0b3d2e 100%)',
        'card-gradient':
          'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(20,184,166,0.10) 100%)',
        'button-gradient':
          'linear-gradient(135deg, #7C3AED 0%, #6366F1 50%, #14B8A6 100%)',
        'glow-violet': 'radial-gradient(ellipse at center, rgba(124,58,237,0.4) 0%, transparent 70%)',
        'glow-teal':   'radial-gradient(ellipse at center, rgba(20,184,166,0.3) 0%, transparent 70%)',
      },
      boxShadow: {
        'glass':   '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
        'glow-sm': '0 0 20px rgba(124,58,237,0.4)',
        'glow-md': '0 0 40px rgba(124,58,237,0.3)',
        'glow-lg': '0 0 80px rgba(124,58,237,0.2)',
        'card':    '0 20px 60px rgba(0,0,0,0.4)',
        'btn':     '0 4px 24px rgba(124,58,237,0.5)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      animation: {
        'float':      'float 6s ease-in-out infinite',
        'float-slow': 'float 9s ease-in-out infinite',
        'fade-in':    'fadeIn 0.6s ease-out both',
        'fade-up':    'fadeUp 0.6s ease-out both',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'spin-slow':  'spin 8s linear infinite',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%':     { transform: 'translateY(-16px) rotate(1deg)' },
          '66%':     { transform: 'translateY(-8px) rotate(-1deg)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        glowPulse: {
          '0%,100%': { boxShadow: '0 0 20px rgba(124,58,237,0.4)' },
          '50%':     { boxShadow: '0 0 50px rgba(124,58,237,0.7), 0 0 80px rgba(99,102,241,0.3)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}

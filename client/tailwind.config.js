/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Aged Copper — primary restaurant accent
        copper: {
          50:  '#fdf8f0',
          100: '#f8ecd6',
          200: '#f0d4a8',
          300: '#e4b678',
          400: '#D4956A',   // copper-light
          500: '#B87333',   // copper
          600: '#9A5E28',
          700: '#7D4A1E',
          800: '#5E3615',
          900: '#3D220C',
        },
        // Legacy 'gold' alias — so existing code referencing gold-xxx still works
        gold: {
          50:  '#fdf8f0',
          100: '#f8ecd6',
          200: '#f0d4a8',
          300: '#e4b678',
          400: '#D4956A',
          500: '#B87333',
          600: '#9A5E28',
          700: '#7D4A1E',
          800: '#5E3615',
          900: '#3D220C',
        },
        // Ember orange (kitchen heat)
        ember: {
          400: '#F97D45',
          500: '#E8601C',
          600: '#C44E10',
        },
        // Soft jade (available / online)
        jade: {
          400: '#6EE7B7',
          500: '#34D399',
          600: '#10B981',
        },
        // Ivory cream text
        ivory: {
          DEFAULT: '#F5EDD8',
          muted:   '#C8B99A',
          dim:     '#7D6B55',
        },
        // Deep mahogany surfaces
        mahogany: {
          900: '#0D0A08',
          850: '#120E0B',
          800: '#1A1310',
          750: '#1E1510',
          700: '#231A15',
        },
        // Mapping surface to mahogany for existing code
        surface: {
          50:  '#fafaf8',
          100: '#f0ebe3',
          200: '#ddd0be',
          300: '#c5af93',
          800: '#231A15',
          850: '#1E1510',
          900: '#1A1310',
          950: '#0D0A08',
        },
        // Navy (kept for backwards compat)
        navy: {
          50:  '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d7fe',
          300: '#a5b8fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
      },
      fontFamily: {
        sans:    ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        cinzel:  ['Cinzel', 'serif'],
      },
      backgroundImage: {
        'hero-gradient':      'linear-gradient(135deg, #0D0A08 0%, #1A1310 40%, #231A15 70%, #120E0B 100%)',
        'copper-gradient':    'linear-gradient(135deg, #D4956A 0%, #B87333 50%, #7D4A1E 100%)',
        'card-gradient':      'linear-gradient(145deg, rgba(255,240,220,0.06) 0%, rgba(255,240,220,0.02) 100%)',
        'glass-gradient':     'linear-gradient(145deg, rgba(255,240,220,0.07) 0%, rgba(255,240,220,0.02) 100%)',
        // Legacy aliases
        'gold-gradient':      'linear-gradient(135deg, #D4956A 0%, #B87333 50%, #7D4A1E 100%)',
      },
      boxShadow: {
        'glass':      '0 8px 32px 0 rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,240,220,0.05)',
        'copper':     '0 4px 24px rgba(184,115,51,0.3)',
        'gold':       '0 4px 24px rgba(184,115,51,0.25)',
        'luxury':     '0 20px 60px -10px rgba(0,0,0,0.6), 0 8px 24px -8px rgba(0,0,0,0.4)',
        'card-hover': '0 25px 50px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(184,115,51,0.12)',
      },
      animation: {
        'fade-in':       'fadeIn 0.4s ease-out',
        'slide-up':      'slideUp 0.5s ease-out',
        'slide-in-right':'slideInRight 0.4s ease-out',
        'wave-in':       'waveIn 0.5s ease-out',
        'pulse-gold':    'pulseGold 2.2s ease-in-out infinite',
        'shimmer':       'shimmer 2s linear infinite',
        'float':         'float 3.5s ease-in-out infinite',
        'breathe':       'breathe 6s ease-in-out infinite',
        'live-pulse':    'livePulse 2.2s ease-in-out infinite',
        'rotate-slow':   'rotateSlow 12s linear infinite',
        'flicker':       'flicker 4s linear infinite',
        'text-shimmer':  'textShimmer 4s linear infinite',
      },
      keyframes: {
        fadeIn:       { '0%': { opacity: '0' },                           '100%': { opacity: '1' } },
        slideUp:      { '0%': { opacity: '0', transform: 'translateY(20px) scale(0.99)' }, '100%': { opacity: '1', transform: 'translateY(0) scale(1)' } },
        slideInRight: { '0%': { opacity: '0', transform: 'translateX(20px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        waveIn:       { '0%': { opacity: '0', transform: 'translateY(12px) rotateX(8deg)' }, '100%': { opacity: '1', transform: 'translateY(0) rotateX(0)' } },
        pulseGold:    { '0%,100%': { boxShadow: '0 0 0 0 rgba(184,115,51,0.35)' }, '50%': { boxShadow: '0 0 0 8px rgba(184,115,51,0)' } },
        shimmer:      { '0%': { backgroundPosition: '-200% center' }, '100%': { backgroundPosition: '200% center' } },
        textShimmer:  { '0%': { backgroundPosition: '0% center' }, '100%': { backgroundPosition: '200% center' } },
        float:        { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
        breathe:      { '0%,100%': { transform: 'scale(1)', opacity: '0.6' }, '50%': { transform: 'scale(1.04)', opacity: '1' } },
        livePulse:    { '0%,100%': { boxShadow: '0 0 0 0 rgba(52,211,153,0.4)', opacity: '1' }, '50%': { boxShadow: '0 0 0 6px rgba(52,211,153,0)', opacity: '0.85' } },
        rotateSlow:   { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } },
        flicker:      { '0%,19%,21%,23%,25%,54%,56%,100%': { opacity: '1' }, '20%,24%,55%': { opacity: '0.6' } },
      },
      backdropBlur: { xs: '2px', sm: '8px', md: '16px', lg: '24px' },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      transitionDuration: {
        400: '400ms',
      },
    },
  },
  plugins: [],
}

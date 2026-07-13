/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Primary — deep cassava-leaf green. Core brand + actions.
        primary: {
          50: '#F1F8F3',
          100: '#DCEEE1',
          200: '#B8DDC4',
          300: '#8AC79E',
          400: '#5CAD79',
          500: '#3B8F5B',
          600: '#297246',
          700: '#1E5631',
          800: '#173F25',
          900: '#102B19',
        },
        // Accent — harvest gold/maize. Highlights, badges, secondary CTAs.
        accent: {
          50: '#FFF8EC',
          100: '#FFEDC7',
          200: '#FFDA94',
          300: '#FDC35C',
          400: '#F5A82E',
          500: '#E8901A',
          600: '#C9740F',
          700: '#A25A0C',
        },
        // Soil — muted earth brown, used sparingly for warmth.
        soil: {
          100: '#F1E6DA',
          300: '#D8B896',
          500: '#9C6B47',
          600: '#7C5236',
          700: '#5E3E29',
        },
        danger: {
          50: '#FDF0EE',
          500: '#C4453A',
          600: '#A6362D',
        },
        ink: {
          900: '#16241C',
          700: '#2B3A31',
          600: '#4B5B52',
          400: '#7C8A81',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          sunk: '#F6F8F5',
          line: '#E5EAE3',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      boxShadow: {
        card: '0 1px 2px rgba(16, 43, 25, 0.04), 0 8px 24px -8px rgba(16, 43, 25, 0.10)',
        raised: '0 2px 8px rgba(16, 43, 25, 0.08), 0 16px 32px -12px rgba(16, 43, 25, 0.16)',
        glow: '0 0 0 4px rgba(59, 143, 91, 0.12)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.94)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.6s infinite linear',
        'fade-up': 'fade-up 0.4s ease-out both',
        'pop-in': 'pop-in 0.25s cubic-bezier(0.16, 1, 0.3, 1) both',
      },
    },
  },
  plugins: [],
}

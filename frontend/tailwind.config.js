module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Montserrat', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Deep Navy — primary brand colour
        indigo: {
          50:  '#eef2f6',
          100: '#d5dfe8',
          200: '#aabfd1',
          300: '#809fb9',
          400: '#567fa2',
          500: '#2b5f8b',
          600: '#1a2b3c', // PRIMARY deep navy
          700: '#142230', // hover / darker
          800: '#0e1924',
          900: '#080f18',
          950: '#040709',
        },
        // Sophisticated Gold — accent / CTA
        accent: {
          50:  '#fdf9ec',
          100: '#faf2cd',
          200: '#f5e49a',
          300: '#ecd661',
          400: '#d4af37', // ACCENT gold
          500: '#b8952a',
          600: '#9a7b1e',
          700: '#7a5f16',
          800: '#5c470f',
          900: '#3e2f08',
          950: '#1f1804',
        },
      },
      boxShadow: {
        card:       '0 4px 12px rgba(0,0,0,0.05)',
        'card-lg':  '0 8px 24px rgba(0,0,0,0.08)',
      },
      keyframes: {
        slideInRight: {
          '0%':   { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)',    opacity: '1' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        slideInRight: 'slideInRight 0.25s ease-out',
        fadeIn:       'fadeIn 0.2s ease-out',
      },
    },
  },
  plugins: [],
};

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        indigo: {
          50: '#f6f0f4',
          100: '#eddfe8',
          200: '#d9bdd0',
          300: '#c098b4',
          400: '#845e75',
          500: '#5c3e53',
          600: '#5c3e53',
          700: '#5c3e53',
          800: '#5c3e53',
          900: '#5c3e53',
          950: '#5c3e53',
          // 700: '#3a2634',
          // 800: '#2d1d28',
          // 900: '#1f141c',
          // 950: '#130c11',
        },
        accent: {
          50: '#fdf8ef',
          100: '#faefd9',
          200: '#f3ddb2',
          300: '#ebc98a',
          400: '#daa769',
          500: '#d09545',
          600: '#b87a2e',
          700: '#996027',
          800: '#7d4d25',
          900: '#674022',
          950: '#3a2010',
        },
      },
      keyframes: {
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        slideInRight: 'slideInRight 0.25s ease-out',
        fadeIn: 'fadeIn 0.2s ease-out',
      },
    },
  },
  plugins: [],
};

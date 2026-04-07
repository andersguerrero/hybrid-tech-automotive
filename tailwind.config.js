/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f7ff',
          100: '#b3e5fc',
          200: '#80d4fa',
          300: '#4fc3f7',
          400: '#29b6f6',
          500: '#00B4DB',
          600: '#0083B0',
          700: '#006699',
          800: '#004d73',
          900: '#003d5c',
        },
        secondary: {
          50: '#e8f5e8',
          100: '#c8e6c9',
          200: '#a5d6a7',
          300: '#81c784',
          400: '#66bb6a',
          500: '#00D4AA',
          600: '#00A86B',
          700: '#00875a',
          800: '#00664a',
          900: '#004d3a',
        },
        // Colores adicionales del logo
        hybrid: {
          blue: '#00B4DB',
          'blue-dark': '#0083B0',
          green: '#00D4AA',
          'green-dark': '#00A86B',
          'green-light': '#00E6B8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'system-ui', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

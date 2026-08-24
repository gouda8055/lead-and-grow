/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: '#1D3045',
        ivory: '#F7F5EF',
        sage: '#8FA58F',
        lavender: '#B9ADD8',
        sand: '#D8C7A5',
        forest: '#233B35',
      },
      fontFamily: {
        sans: [
          "'Helvetica Neue ME'",
          "'Helvetica Neue'",
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      transitionTimingFunction: {
        cinematic: 'cubic-bezier(0.16,1,0.3,1)',
      },
    },
  },
  plugins: [],
}

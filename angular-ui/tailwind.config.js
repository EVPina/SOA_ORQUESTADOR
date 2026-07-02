/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,ts}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#B71C1C',
          gold: '#D4A017',
          brown: '#2E221B',
          ivory: '#F8F7F2',
        },
      },
    },
  },
  plugins: [],
};

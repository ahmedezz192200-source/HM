/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: { primary: { DEFAULT: '#3DBABF', dark: '#2C9A9F' }, ink: '#1F2937' },
      fontFamily: { sans: ['Cairo', 'sans-serif'] },
      boxShadow: { soft: '0 3px 16px rgba(31,41,55,.06)' },
    },
  },
  plugins: [],
}

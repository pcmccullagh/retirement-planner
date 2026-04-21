/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: '#FAF8F4',
        'cream-dark': '#F2EEE6',
        gold: '#C9A84C',
        'gold-light': '#E8C97A',
        'gold-dark': '#A8892E',
        slate: {
          editorial: '#2C3E50',
        },
        sage: '#6B9E7A',
        'sage-light': '#EDF4EF',
        terracotta: '#C4704A',
        'terracotta-light': '#FAF0EB',
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 12px rgba(44, 62, 80, 0.06)',
        'card-hover': '0 4px 20px rgba(44, 62, 80, 0.10)',
      },
    },
  },
  plugins: [],
}

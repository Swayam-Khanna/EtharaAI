/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#ffffff', // High-contrast solid pure white
          600: '#f3f4f6', // Premium chrome/platinum highlight
          700: '#e5e7eb', // Border silver
          800: '#a1a1aa', // Muted ash
          900: '#52525b', // Charcoal
          950: '#171717', // Neutral dark base
        },
        dark: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#3f3f46',
          700: '#2d2d34',
          800: '#222226',
          900: '#0e0e11', // Dark card base
          950: '#050505'  // Near pitch black backing
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 15px rgba(255, 255, 255, 0.05)',
        'glow-lg': '0 0 25px rgba(255, 255, 255, 0.08)',
      }
    },
  },
  plugins: [],
}

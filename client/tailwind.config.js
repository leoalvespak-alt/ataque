/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Saira', 'Aptos', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Cores do tema escuro
        dark: {
          50: '#f8f9fa',
          100: '#e9ecef',
          200: '#dee2e6',
          300: '#ced4da',
          400: '#adb5bd',
          500: '#6c757d',
          600: '#495057',
          700: '#343a40',
          800: '#212529',
          900: '#1b1b1b',
        },
        // Cores vermelhas para o tema
        red: {
          500: '#8b0000',
          600: '#a00000',
          700: '#b00000',
        }
      },
      backgroundColor: {
        'dark-primary': '#1b1b1b',
        'dark-secondary': '#2a2a2a',
        'dark-tertiary': '#333333',
      },
      textColor: {
        'dark-primary': '#f2f2f2',
        'dark-secondary': '#cccccc',
        'dark-tertiary': '#888888',
      },
      borderColor: {
        'dark-primary': '#333333',
        'dark-secondary': '#8b0000',
      }
    },
  },
  plugins: [],
}

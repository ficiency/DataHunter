/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0066FF',
          hover: '#0052CC',
          light: '#3385FF',
        },
        pending: '#808080',
        scanning: '#0066FF',
        success: '#0066FF',
        error: '#FF0000',
        'bg-dark': '#FFFFFF',
        'bg-card': '#FAFAFA',
        'bg-hover': '#F5F5F5',
        'border-dark': '#E5E5E5',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}


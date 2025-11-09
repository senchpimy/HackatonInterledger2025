/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        black: '#000000',
        white: '#FFFFFF',
        gray: {
          50: '#F8F8F8',
          100: '#EBEBEB',
          200: '#D7D7D7',
          300: '#C0C0C0',
          400: '#A8A8A8',
          500: '#909090',
          600: '#787878',
          700: '#606060',
          800: '#484848',
          900: '#303030',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
  ],
}




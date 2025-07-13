/** @type {import('tailwindcss').Config} */
import { preset } from 'tailwindcss/browser'

export default {
  preset,
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tomato: '#F86247',
        bisque: '#FFE7C6', 
        caramel: '#F6D19A',
        iceberg: '#74B8CE'
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans JP', 'sans-serif'],
      },
      lineHeight: {
        relaxed: '1.7'
      }
    },
  },
  plugins: [],
}
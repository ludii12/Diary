/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: { center: true },
    extend: {
      colors: {
        forest: { 50:'#f0f5f2',100:'#dce8e0',200:'#b8d1c1',300:'#8bb5a0',400:'#5e937a',500:'#3d6b56',600:'#2D4A3E',700:'#243c32',800:'#1b2d26',900:'#121f1a' },
        warm: { 50:'#FFFDF7',100:'#FAF6F0',200:'#F0E8D8',300:'#E8C87A',400:'#D4A843',500:'#B8922E' },
        sage: { 300:'#A8B89E',400:'#8B9D83',500:'#6E8268' },
      },
      fontFamily: {
        serif: ['Noto Serif SC','serif'],
        sans: ['Noto Sans SC','sans-serif'],
      },
    },
  },
  plugins: [],
};
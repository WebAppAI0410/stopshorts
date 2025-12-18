/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // StopShorts Brand Colors
        primary: {
          DEFAULT: '#1E3A5F', // Deep Navy
          light: '#2E5A8F',
          dark: '#0E2A4F',
        },
        accent: {
          DEFAULT: '#00BFA5', // Teal
          light: '#33CCBB',
          dark: '#009F8A',
        },
        warning: {
          DEFAULT: '#FF6B6B', // Coral
          light: '#FF8A8A',
          dark: '#E55555',
        },
        success: {
          DEFAULT: '#4CAF50', // Green
          light: '#6BC96F',
          dark: '#3D9140',
        },
        background: {
          DEFAULT: '#F8F9FA',
          dark: '#1A1A2E',
        },
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
};

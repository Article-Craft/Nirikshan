/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Himal & Pagoda Palette
        'pagoda-wood': '#2E2418',       // Primary
        'terraced-pine': '#2C3B2A',     // Secondary
        'temple-brass': '#9C7A3C',      // Accent
        'himalayan-mist': '#F3EFE4',    // Background
        'weathered-stone': '#E4DCC8',   // Surface/Cards
        'slate-basalt': '#453F36',      // Body text
        'dust-beige': '#CFC4A8',        // Borders/dividers
        
        // Muted Editorial Status Colors
        status: {
          fulfilled: '#4F6B45',         // Rhododendron Leaf Green
          delayed: '#8C6A32',           // Turmeric Clay
          broken: '#6E4438',            // Charred Brick
        }
      },
      fontFamily: {
        // Strong serif for headings, clean sans-serif for body
        serif: ['Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

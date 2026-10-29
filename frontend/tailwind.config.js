/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        obsidian: '#171815',
        graphite: '#24251F',
        'graphite-light': '#2E3028',
        'warm-paper': '#F5F0E6',
        'pure-ink': '#20211D',
        lime: {
          DEFAULT: '#D5FF45',
          hover: '#C4ED36',
          muted: 'rgba(213, 255, 69, 0.12)',
        },
        tangerine: {
          DEFAULT: '#FF7547',
          hover: '#EE6334',
          muted: 'rgba(255, 117, 71, 0.12)',
        },
        sage: {
          DEFAULT: '#A9B49B',
          muted: 'rgba(169, 180, 155, 0.15)',
        },
        'soft-gray': '#8D8E84',
        'border-atelier': '#2D2E26',
        'border-light': '#3D4034',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}


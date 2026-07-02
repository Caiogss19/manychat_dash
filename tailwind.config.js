/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Palette validada (dataviz skill — light mode)
        surface: '#fcfcfb',
        plane: '#f9f9f7',
        ink: {
          DEFAULT: '#0b0b0b',
          secondary: '#52514e',
          muted: '#898781',
        },
        rule: {
          DEFAULT: '#e1e0d9',
          strong: '#c3c2b7',
        },
        // Categorical (slot 1..8)
        cat: {
          1: '#2a78d6', // blue
          2: '#1baf7a', // aqua
          3: '#eda100', // yellow
          4: '#008300', // green
          5: '#4a3aa7', // violet
          6: '#e34948', // red
          7: '#e87ba4', // magenta
          8: '#eb6834', // orange
        },
        // Status (nunca reciclar como série)
        status: {
          good: '#0ca30c',
          warning: '#fab219',
          serious: '#ec835a',
          critical: '#d03b3b',
        },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(11,11,11,0.04), 0 0 0 1px rgba(11,11,11,0.06)',
      },
    },
  },
  plugins: [],
}

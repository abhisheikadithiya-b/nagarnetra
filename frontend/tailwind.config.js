/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FAF8F5',
          100: '#F3EFEA',
          200: '#EAE4DC',
          300: '#DDD5C8',
        },
        navy: {
          900: '#0B0F17',
          850: '#0E1420',
          800: '#131B2A',
          700: '#1B263B',
          600: '#273852',
        },
        ink: {
          900: '#16191F',
          800: '#24292E',
          700: '#374151',
          500: '#6B7280',
        },
        carto: {
          road: '#2D3748',
          roadDark: '#475569',
          park: '#E2EBD8',
          parkDark: '#1E2D24',
          water: '#DCE8EC',
          waterDark: '#132433'
        }
      },
      fontFamily: {
        serif: ['Merriweather', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

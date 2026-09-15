/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // CampusCare Dusty Taupe + Charcoal Brown + Palm Leaf Core Palette
        campus: {
          taupe: '#9F8170',       // Primary Accent: Dusty Taupe
          taupeHover: '#8A6D5D',  // Darker Dusty Taupe for hover
          charcoal: '#3B3C36',    // Main Dark Text & Dark UI Sections: Charcoal Brown
          charcoalDark: '#292A26',// Primary Heading: Deep Charcoal
          charcoalBody: '#4A4943',// Body Text: Readable Dark Charcoal
          charcoalSub: '#68675F', // Secondary Text
          muted: '#77766F',       // Muted Text / Placeholders
          palm: '#8A9A5B',        // Secondary Accent: Palm Leaf Green
          palmHover: '#79884D',   // Darker Palm Leaf for hover
          bg: '#F7F5F0',          // Main Background: Warm Off-White
          card: '#FFFFFF',        // Card Background: Pure White
          softTaupe: '#F0EBE6',   // Soft Taupe Background
          softGreen: '#EEF1E7',   // Soft Green Background (AI/Success)
          border: '#DEDAD3',      // Neutral Warm Border
        },
        primary: {
          50: '#fbf9f8',
          100: '#f5f0ec',
          200: '#ebe1da',
          300: '#d9c7be',
          400: '#bc9f8e',
          500: '#9F8170', // Primary Accent: Dusty Taupe
          600: '#8A6D5D',
          700: '#735749',
          800: '#3B3C36', // Charcoal Brown
          900: '#292A26', // Deep Charcoal
          950: '#1a1b18',
        },
        brand: {
          taupe: '#9F8170',
          charcoal: '#3B3C36',
          palm: '#8A9A5B',
          bg: '#F7F5F0',
          card: '#FFFFFF',
          border: '#DEDAD3',
        },
        surface: {
          DEFAULT: '#F7F5F0',
          card: '#FFFFFF',
          elevated: '#F0EBE6',
          green: '#EEF1E7',
          border: '#DEDAD3',
          hover: '#EAE5DF',
        },
        content: {
          title: '#292A26',
          main: '#3B3C36',
          body: '#4A4943',
          secondary: '#68675F',
          muted: '#77766F',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Menlo', 'monospace']
      },
      boxShadow: {
        'taupe': '0 4px 14px rgba(159, 129, 112, 0.25)',
        'palm': '0 4px 14px rgba(138, 154, 91, 0.25)',
        'charcoal': '0 10px 25px rgba(59, 60, 54, 0.15)',
        'soft-card': '0 2px 10px rgba(59, 60, 54, 0.04)',
        'card-hover': '0 8px 24px rgba(59, 60, 54, 0.07), 0 0 12px rgba(159, 129, 112, 0.12)',
      },
    },
  },
  plugins: [],
}

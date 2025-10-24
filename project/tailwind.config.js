/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Couleurs Discord
        discord: {
          dark: '#36393f',
          darker: '#2f3136',
          darkest: '#202225',
          light: '#b9bbbe',
          lighter: '#dcddde',
          lightest: '#ffffff',
          accent: '#5865f2',
          'accent-hover': '#4752c4',
          green: '#3ba55c',
          red: '#ed4245',
          yellow: '#faa61a',
        },
      },
      fontFamily: {
        sans: ['Whitney', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
        display: ['Ginto', 'Whitney', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['Consolas', 'Monaco', 'Andale Mono', 'Ubuntu Mono', 'monospace'],
      },
      spacing: {
        'xxs': '0.25rem',  /* 4px */
        'xs': '0.5rem',    /* 8px */
        'sm': '0.75rem',   /* 12px */
        'md': '1rem',      /* 16px */
        'lg': '1.5rem',    /* 24px */
        'xl': '2rem',      /* 32px */
      },
      borderRadius: {
        'discord': '0.5rem',
        'discord-lg': '0.75rem',
      },
      boxShadow: {
        'discord': '0 8px 15px rgba(0, 0, 0, 0.2)',
        'discord-sm': '0 2px 10px rgba(0, 0, 0, 0.1)',
      },
      transitionTimingFunction: {
        'discord': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
};

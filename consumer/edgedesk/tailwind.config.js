/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        edge: {
          bg: '#0b0f17',
          panel: '#111827',
          border: '#1f2937',
          mute: '#9ca3af',
          accent: '#22d3ee',
          up: '#10b981',
          down: '#ef4444',
          warn: '#f59e0b',
        },
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
};

import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        x402: {
          primary: '#6366f1',    // indigo
          secondary: '#8b5cf6',  // violet
          accent: '#06b6d4',     // cyan
          dark: '#0f172a',       // slate-900
          light: '#f8fafc',      // slate-50
        }
      },
    },
  },
  plugins: [],
}
export default config

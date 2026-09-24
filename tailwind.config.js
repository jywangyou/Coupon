/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1f2329',
        muted: '#73777f',
        line: '#eceef1',
        brand: '#ff4d4f',
        brandDeep: '#d9363e',
        warm: '#fff7ed',
        mint: '#e9f8f0'
      },
      boxShadow: {
        soft: '0 8px 28px rgba(31,35,41,.08)',
        float: '0 16px 44px rgba(31,35,41,.14)'
      }
    }
  },
  plugins: []
}

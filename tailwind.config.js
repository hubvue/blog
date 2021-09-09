module.exports = {
  purge: ['./src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        primary: 'var(--textNormal)'
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}

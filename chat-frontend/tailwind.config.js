/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        customGreen: '#15b815',
        customDarkGreen : ' #13EC13',
        customDarkGrey : '#1a1a1a',
        customLighterGrey : '#676767',
        customLightGrey : '#676767',
        customLightGreen : '#44f84d',
        customDarkerGrey : "#181818",
        customAlmostBlack : "#101010",
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar'),
  ],
}

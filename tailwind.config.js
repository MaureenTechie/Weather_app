/* eslint-disable @typescript-eslint/no-require-imports */
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './app/**/*.{js, ts, jsx, tsx}',  // for app dir
        './pages/**/*.{js, ts, jsx, tsx}', // for pages dir
        './components/**/*.{js, ts, jsx, tsx}'
    ],
    theme: {
      extend: {},
    },
    plugins: [require("rippleui")],
  }
  
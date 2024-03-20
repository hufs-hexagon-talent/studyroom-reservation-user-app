/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    'node_modules/flowbite-react/lib/esm/**/*.js',
  ],
  theme: {
    extend: {},
    colors: {
      footermainbg: '#24262a',
      footerboxbg: '#395776',
      footertextcolor: '#cecece',
      footertextbrown: '#9f7c52',
    },
  },
  plugins: [require('flowbite/plugin')],
};

const flowbite = require("flowbite-react/tailwind");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    flowbite.content(),
  ],
  theme: {
    extend: {},
    colors: {
      footermainbg: '#24262a',
      footerboxbg: '#2f333e',
      footertextcolor: '#d5d6d8',
      footertextbrown: '#9f7c52',
      footerinnerborder: '#434548',
    },
  },
  plugins: [flowbite.plugin()],
};

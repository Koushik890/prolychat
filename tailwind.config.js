/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      spacing: {
        '4.5': '1.125rem', // 18px
      },
      width: {
        '4.5': '1.125rem', // 18px
      },
      height: {
        '4.5': '1.125rem', // 18px
      },
    },
  },
  plugins: [],
}


/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary-color': '#22355E',
        'second-color': '#F1F2E8',
        'green-color': '#28D582',
        'orange-color': '#FD7D55',
        'holiday-color': '#DE7665',
        'offline-color': '#F3CCAC',
        'weekend-color': '#B9C0E0',
        'cloud-color': '#F2F3F6',
        'border-color': '#22355EB2',
        'blue-color': '#55A8FD',
        'loading-color': '#132142cc',
        'red-color': '#E4345E',
        'outer-color': '#FFFFFF33',
        'gray-color': '#B5B5B5',
        'white-color': '#FFFFFF'
      },
    },
  },
  plugins: [],
};

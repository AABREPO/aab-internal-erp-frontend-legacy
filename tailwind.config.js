/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx,html}"],
  safelist: [
  "checked:after:content-['✔']",
  'checked:after:content-[\'✔\']',
  "checked:after:content-[\"✔\"]",
  "checked:after:content-[\"\\2714\"]",
  "checked:after:content-['\\2714']",
  "checked:bg-[#E2F9E1]",
  "checked:border-[#034638]",
  "checked:after:text-[#034638]",
  "checked:after:text-xs",
  "checked:after:font-bold",
  "checked:after:flex",
  "checked:after:justify-center",
  "checked:after:items-center"
],
  theme: {
    extend: {},
  },
  variants: {},
  plugins: [require('tailwind-scrollbar-hide')],
}


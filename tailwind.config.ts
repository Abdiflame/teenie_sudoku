import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Fredoka'", "'Nunito'", "sans-serif"],
        body: ["'Nunito'", "system-ui", "sans-serif"]
      },
      colors: {
        sky: {
          50: "#f0f6ff",
          100: "#ddebff",
          200: "#c2dbff",
          300: "#9fc6ff",
          400: "#7ab0ff",
          500: "#5798f5",
          600: "#3d7ad8",
          700: "#325fa7",
          800: "#2d4d83",
          900: "#2a416b"
        },
        candy: {
          pink: "#fcb6d4",
          yellow: "#ffe8a3",
          mint: "#b7f1d6",
          lilac: "#d9ccff"
        }
      },
      boxShadow: {
        card: "0 20px 60px rgba(87, 152, 245, 0.18)",
        soft: "0 10px 30px rgba(0,0,0,0.08)"
      },
      borderRadius: {
        blob: "32px"
      }
    }
  },
  plugins: []
};

export default config;

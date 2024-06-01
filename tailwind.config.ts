/** @type {import('tailwindcss').Config} */
import { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,html,css}"],
  theme: {
    extend: {
      colors: {
        darkblue: "#5865F2",
        dgray: "#363940",
        indigo: "#292841",
        darkblueh: "#4E55D0",
      },
    },
  },
  plugins: [],
};

export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#F3F3F5",     // ページ背景（薄グレー）
        ink: "#545454",        // 文字
        accent: "#D0BDFF",     // 指し色
        accentSoft: "#F4F0FF",
        accentDeep: "#6B53B8", // 濃い紫（タイトル・ボタン）
        muted: "#9B9B9B",
        line: "#ECECEF",
      },
      fontFamily: {
        display: ['"Zen Maru Gothic"', "sans-serif"],   // 丸ゴシック（やわらかい）
        sans: ['"Zen Kaku Gothic New"', "sans-serif"],  // 角ゴシック（本文）
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        grow: {
          "0%": { transform: "scaleX(0)" },
          "100%": { transform: "scaleX(1)" },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.5s ease-out both",
        grow: "grow 0.8s cubic-bezier(0.22,1,0.36,1) both",
      },
    },
  },
  plugins: [],
};

export default config;

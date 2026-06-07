import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "あなたに合う痩せ方診断",
  description:
    "10問・約60秒。タップで答えるだけ。あなたに合う痩せ方が、PFC（たんぱく質・脂質・炭水化物）の傾向から見えてきます。",
  openGraph: {
    title: "あなたに合う痩せ方診断",
    description: "10問・約60秒の痩せ方タイプ診断。",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@500;700&family=Zen+Kaku+Gothic+New:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans">{children}</body>
    </html>
  );
}

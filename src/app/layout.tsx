import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "あなたが“摂りすぎ”ている栄養素は？｜PFC診断",
  description:
    "10問・約60秒。タップで答えるだけ。ダイエットがうまくいかなかった本当の理由が、PFC（たんぱく質・脂質・糖質）から見えてきます。",
  openGraph: {
    title: "あなたが“摂りすぎ”ている栄養素は？",
    description: "10問・約60秒のPFC診断。",
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
          href="https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@500;600;700&family=Zen+Kaku+Gothic+New:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans">{children}</body>
    </html>
  );
}

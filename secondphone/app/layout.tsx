import type { Metadata } from "next";
import { Kanit } from "next/font/google";
import "./globals.css";

const kanit = Kanit({
  weight: ["400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  variable: "--font-kanit",
});

export const metadata: Metadata = {
  title: "SecondPhone - มือถือมือสอง สภาพดี ราคาถูก",
  description: "มือถือมือสอง รีวิวสภาพจริงทุกเครื่อง ซื้ออย่างมั่นใจ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={kanit.className}>
        {children}
      </body>
    </html>
  );
}

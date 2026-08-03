import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bible Word Daily | 字里经心",
  description:
    "Bible Word Daily（字里经心）— a daily Bible-themed word game with a short bilingual story behind every answer.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

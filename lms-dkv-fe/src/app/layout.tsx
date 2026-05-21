import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 
  {
    default: "DKV LMS",
    template: "%s | DKV LMS", // %s akan digantikan oleh title dari page/layout anak
  },
  description: "Sistem Manajemen Pembelajaran digital interaktif untuk Konsentrasi Keahlian Desain Komunikasi Visual (DKV)",
  keywords: ["LMS", "DKV", "Fotografi", "E-Learning", "Desain Grafis", "Pembelajaran Online"],
  authors: [{ name: "Tommy Poernomo" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      suppressHydrationWarning
    >
<body >
        {children}
      </body>
    </html>
  );
}

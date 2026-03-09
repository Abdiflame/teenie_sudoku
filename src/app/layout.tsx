import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({ subsets: ["latin"], display: "swap", variable: "--font-fredoka" });
const nunito = Nunito({ subsets: ["latin"], display: "swap", variable: "--font-nunito" });

export const metadata: Metadata = {
  title: "Teenie Sudoku",
  description: "Kid-friendly 4x4 Sudoku with pastel vibes and offline play.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Teenie Sudoku"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1.0,
  themeColor: "#fcb6d4"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${fredoka.variable} ${nunito.variable}`} suppressHydrationWarning>
      <body className="min-h-screen" suppressHydrationWarning>
        <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
          {children}
        </div>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icons/teenieping_avatar.ico" />
        <meta name="theme-color" content="#fcb6d4" />
      </body>
    </html>
  );
}

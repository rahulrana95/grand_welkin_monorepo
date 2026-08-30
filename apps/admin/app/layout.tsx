import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "@welkinbliss/ui/tokens.css";
import "./globals.css";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-playfair", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: { default: "WelkinBliss Admin", template: "%s · WelkinBliss Admin" },
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { readonly children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import { IBM_Plex_Mono, Public_Sans, Special_Elite } from "next/font/google";
import "./globals.css";

const publicSans = Public_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const specialElite = Special_Elite({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Notes",
  description: "A simple notes app",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${publicSans.variable} ${specialElite.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink font-sans">
        {children}
      </body>
    </html>
  );
}

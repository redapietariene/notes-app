import type { Metadata } from "next";
import { Public_Sans } from "next/font/google";
import { getServerTheme } from "@/utils/theme-server";
import "./globals.css";

const publicSans = Public_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Notes",
  description: "A simple notes app",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const theme = await getServerTheme();

  return (
    <html
      lang="en"
      className={`${publicSans.variable} h-full antialiased`}
      data-theme={theme ?? undefined}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink font-sans">
        {children}
      </body>
    </html>
  );
}

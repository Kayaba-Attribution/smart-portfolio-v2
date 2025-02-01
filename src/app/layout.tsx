import "@coinbase/onchainkit/styles.css";
import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { BottomNav } from "@/components/BottomNav";
import { Header } from "@/components/Header";
import { AnimatePresence } from "framer-motion"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "My PWA App",
  description: "Progressive Web Application built with Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={geistSans.variable}>
      <body 
        className="min-h-screen bg-background overflow-x-hidden overscroll-y-none"
        style={{ 
          position: 'fixed',
          width: '100%',
          height: '100%'
        }}
      >
        <Providers>
          <Header />
          <main className="h-[100dvh] pt-16 pb-20 overflow-y-auto">
            <AnimatePresence mode="wait">
              {children}
            </AnimatePresence>
          </main>
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}

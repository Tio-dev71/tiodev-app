import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LanguageProvider } from "@/components/providers/LanguageProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { AffiliateProvider } from "@/components/providers/AffiliateProvider";
import { Suspense } from "react";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Tiodev — Coding & Crypto",
    template: "%s | Tiodev",
  },
  description:
    "Nơi chứa đựng của tôi",
  keywords: ["coding", "crypto", "portfolio", "store"],
  authors: [{ name: "Tio" }],
  openGraph: {
    title: "Tiodev — Coding & Crypto",
    description: "Nơi chứa đựng của tôi",
    type: "website",
    locale: "vi_VN",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/tiodevlogofull.png",
    shortcut: "/tiodevlogofull.png",
    apple: "/tiodevlogofull.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="noise-bg font-sans">
        <AuthProvider>
          <LanguageProvider>
            <Header />
            <Suspense fallback={null}>
              <AffiliateProvider />
            </Suspense>
            <main className="min-h-screen">{children}</main>
            <Footer />
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

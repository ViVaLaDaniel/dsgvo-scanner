import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ProfessionalCookieBanner } from "@/components/layout/ProfessionalCookieBanner";
import { PaddleProvider } from "@/components/providers/PaddleProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DSGVO Scanner | Automatisches Website-Monitoring für DSB",
  description: "Sparen Sie 10h pro Woche. Automatisierte DSGVO-Audits für Agenturen und Datenschutzbeauftragte. White-Label Reports für Mandanten.",
  keywords: ["DSGVO", "GDPR", "Scanner", "Datenschutz", "DSB", "Audit", "Website Check", "Google Fonts Prüfung"],
  authors: [{ name: "Germani Team" }],
  metadataBase: new URL('https://dsgvo-scanner.de'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "DSGVO Scanner | Automatisches Website-Monitoring für DSB",
    description: "Automatisierte DSGVO-Audits für Agenturen und Datenschutzbeauftragte. Sparen Sie Zeit mit White-Label Reports.",
    url: "https://dsgvo-scanner.de",
    siteName: "DSGVO Scanner",
    locale: "de_DE",
    type: "website",
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'DSGVO Scanner Dashboard Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DSGVO Scanner',
    description: 'Automatisches Website-Monitoring für Datenschutzbeauftragte.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PaddleProvider>
          {children}
        </PaddleProvider>
        <ProfessionalCookieBanner />
      </body>
    </html>
  );
}

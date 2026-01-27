import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ProfessionalCookieBanner } from "@/components/layout/ProfessionalCookieBanner";

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
  description: "Sparen Sie 10h pro Woche. Automatisierte DSGVO-Audits für Agenturen und Datenschutzbeauftragte. White-Label Reports.",
  openGraph: {
    title: "DSGVO Scanner | Automatisches Website-Monitoring für DSB",
    description: "Sparen Sie 10h pro Woche. Automatisierte DSGVO-Audits für Agenturen und Datenschutzbeauftragte. White-Label Reports.",
    url: "https://dsgvo-scanner.de",
    siteName: "DSGVO Scanner",
    locale: "de_DE",
    type: "website",
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
        {children}
        <ProfessionalCookieBanner />
      </body>
    </html>
  );
}

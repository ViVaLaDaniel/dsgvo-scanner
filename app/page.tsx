'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Globe, Trash2, Play, ExternalLink, ShieldCheck, ArrowRight, CheckCircle, Shield, Clock, AlertTriangle, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthModal } from '@/components/auth/AuthModal';
import { useSmoothScroll } from '@/lib/hooks/useSmoothScroll';
import { DashboardPreview } from '@/components/landing/DashboardPreview';
import { Testimonials } from '@/components/landing/Testimonials';
import { DemoModal } from '@/components/landing/DemoModal';

export default function HomePage() {
  const { scrollTo } = useSmoothScroll();
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authModal, setAuthModal] = useState<{isOpen: boolean, view: 'login' | 'register'}>({
    isOpen: false,
    view: 'login'
  });

  useEffect(() => {
    const handleScroll = () => {
      if (isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      window.addEventListener('scroll', handleScroll);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isMenuOpen]);

  const openAuth = (view: 'login' | 'register') => {
    setIsMenuOpen(false); // Close mobile menu when auth modal opens
    setAuthModal({ isOpen: true, view });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-slate-50 to-slate-100 flex flex-col">
      <AuthModal 
        isOpen={authModal.isOpen} 
        onClose={() => setAuthModal(prev => ({ ...prev, isOpen: false }))} 
        initialView={authModal.view}
      />
      <DemoModal 
        isOpen={isDemoOpen} 
        onClose={() => setIsDemoOpen(false)} 
      />
      
      {/* Structured Data (JSON-LD) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "DSGVO Scanner",
            "operatingSystem": "Web",
            "applicationCategory": "BusinessApplication",
            "description": "Automatisierte DSGVO-Audits für Agenturen und Datenschutzbeauftragte.",
            "offers": {
              "@type": "Offer",
              "price": "49.00",
              "priceCurrency": "EUR"
            }
          })
        }}
      />
      
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/70 backdrop-blur-md transition-all">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center max-w-7xl">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <div className="bg-blue-600 p-1.5 rounded-lg transition-transform group-hover:scale-110">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold tracking-tight text-slate-900">
                DSGVO<span className="text-blue-600">Scanner</span>
              </span>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <button 
              onClick={() => scrollTo('features')} 
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              Funktionen
            </button>
            <button 
              onClick={() => scrollTo('pricing')} 
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              Preise
            </button>
          </nav>
          <div className="hidden md:flex gap-4 items-center">
            <Button 
              variant="ghost" 
              onClick={() => openAuth('login')}
              className="font-bold text-slate-600 hover:text-blue-600"
            >
              Anmelden
            </Button>
            <Button 
              onClick={() => openAuth('register')}
              className="shadow-lg shadow-blue-500/20 font-bold px-6 bg-blue-600 hover:bg-blue-700 transition-all"
            >
              Kostenlos Testen
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="relative h-8 w-8 p-0"
              aria-label={isMenuOpen ? "Menü schließen" : "Hauptmenü öffnen"}
              aria-expanded={isMenuOpen}
            >
              <AnimatePresence initial={false} mode="wait">
                <motion.div
                  key={isMenuOpen ? 'x' : 'menu'}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </motion.div>
              </AnimatePresence>
            </Button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg overflow-hidden"
            >
              <div className="container mx-auto px-4 py-8 flex flex-col gap-6">
                <nav className="flex flex-col gap-6 text-lg font-medium text-slate-700">
                  <button 
                    onClick={() => { scrollTo('features'); setIsMenuOpen(false); }} 
                    className="hover:text-blue-600 transition-colors cursor-pointer text-left"
                  >
                    Funktionen
                  </button>
                  <button 
                    onClick={() => { scrollTo('pricing'); setIsMenuOpen(false); }} 
                    className="hover:text-blue-600 transition-colors cursor-pointer text-left"
                  >
                    Preise
                  </button>
                </nav>
                <div className="border-t pt-6 flex flex-col gap-4">
                  <Button 
                    variant="outline"
                    onClick={() => openAuth('login')}
                    className="font-bold w-full py-6"
                  >
                    Anmelden
                  </Button>
                  <Button 
                    onClick={() => openAuth('register')}
                    className="font-bold w-full py-6"
                  >
                    Kostenlos Testen
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 pt-24 pb-20 text-center max-w-5xl">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Neu: White-Label Reports für Agenturen
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-8 tracking-tight leading-[1.1]">
            DSGVO-Monitoring für<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              externe Datenschutzbeauftragte
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Überwachen Sie automatisch 50+ Mandanten-Websites und erhalten Sie 
            sofortige Benachrichtigungen bei DSGVO-Verstößen. Sparen Sie Zeit und minimieren Sie Haftungsrisiken.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              onClick={() => openAuth('register')}
              className="text-lg px-8 py-7 shadow-xl shadow-blue-500/30 hover:shadow-blue-500/40 transition-all group"
            >
              Jetzt testen (Dev Mode)
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => setIsDemoOpen(true)}
              className="text-lg px-8 py-7 bg-white dark:bg-slate-950"
            >
              Demo ansehen
            </Button>
          </div>

          <div className="mt-20">
            <DashboardPreview />
          </div>
          
          <div className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-medium text-slate-500">
            <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-green-500" /> Keine Kreditkarte erforderlich</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-green-500" /> Jederzeit kündbar</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-green-500" /> DSGVO compliant</span>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="container mx-auto px-4 py-24 max-w-7xl">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-slate-900 mb-4">Warum DSBs uns lieben</h3>
            <p className="text-slate-600 max-w-2xl mx-auto">Unsere Plattform wurde speziell für die Bedürfnisse von Datenschutzbeauftragten entwickelt, die viele Mandanten gleichzeitig betreuen.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="hover:border-blue-200 transition-all hover:shadow-xl hover:-translate-y-1 duration-300">
              <CardHeader>
                <div className="bg-blue-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
                  <Clock className="h-7 w-7 text-blue-600" />
                </div>
                <CardTitle className="text-xl">10h/Woche sparen</CardTitle>
                <CardDescription className="text-base pt-2">
                  Automatisierte Scans statt manuelle Checks. Verbringen Sie weniger Zeit mit Routineaufgaben.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-slate-600 font-medium">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                    <span>Wöchentliche Scans aller Websites</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                    <span>Sofortige E-Mail-Benachrichtigungen</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                    <span>Automatische PDF-Reports</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:border-blue-200 transition-all hover:shadow-xl hover:-translate-y-1 duration-300">
              <CardHeader>
                <div className="bg-blue-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
                  <Shield className="h-7 w-7 text-blue-600" />
                </div>
                <CardTitle className="text-xl">100% DSGVO-konform</CardTitle>
                <CardDescription className="text-base pt-2">
                  Maximale Datensicherheit. Ihre Daten verlassen niemals deutschen Boden.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-slate-600 font-medium">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                    <span>Hetzner Rechenzentrum Nürnberg</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                    <span>Keine Datenübermittlung in Drittstaaten</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                    <span>AV-Vertrag inklusive</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:border-blue-200 transition-all hover:shadow-xl hover:-translate-y-1 duration-300">
              <CardHeader>
                <div className="bg-blue-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
                  <AlertTriangle className="h-7 w-7 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Präzise Checks</CardTitle>
                <CardDescription className="text-base pt-2">
                  Wir prüfen genau auf die Dinge, die heute wirklich abgemahnt werden.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-slate-600 font-medium">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                    <span>Google Fonts & US-CDN Einbindungen</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                    <span>Tracking Cookies ohne Consent</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                    <span>Impressum-Vollständigkeit</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Mid-Page CTA */}
        <section className="bg-blue-600 py-12">
          <div className="container mx-auto px-4 max-w-7xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-white space-y-2 text-center md:text-left">
              <h3 className="text-2xl font-bold">Bereit, Zeit und Haftungsrisiken zu minimieren?</h3>
              <p className="text-blue-100 font-medium opacity-90">Starten Sie jetzt mit Ihrer ersten Mandanten-Website — 100% kostenlos.</p>
            </div>
            <Button 
              size="lg" 
              onClick={() => openAuth('register')}
              className="bg-white text-blue-600 hover:bg-white/90 font-black px-10 h-14 shadow-2xl shadow-blue-900/20"
            >
              Gratis Account erstellen
            </Button>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="container mx-auto px-4 py-24 bg-slate-50 border-y border-slate-200">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-4xl font-bold text-center mb-4 text-slate-900">Einfache Preise für DSB</h3>
            <p className="text-center text-slate-600 mb-16 max-w-2xl mx-auto">Wählen Sie das passende Paket für Ihr Portfolio. Keine versteckten Kosten.</p>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <Card className="flex flex-col h-full bg-white transition-all duration-300 hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Starter</CardTitle>
                  <div className="flex items-baseline gap-1 mt-4">
                    <span className="text-4xl font-extrabold">49€</span>
                    <span className="text-slate-500 font-medium">/ Monat</span>
                  </div>
                  <CardDescription className="pt-2">Perfekt für Freelance-DSBs mit kleinem Portfolio.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="h-px bg-slate-100 mb-6" />
                  <ul className="space-y-4 text-sm font-medium">
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-blue-600 shrink-0" />
                      <span>Bis zu 10 Websites</span>
                    </li>
                    <li className="flex items-center gap-3 text-slate-400">
                      <div className="h-5 w-5" />
                      <span>Wöchentliche Scans</span>
                    </li>
                    <li className="flex items-center gap-3 text-slate-400">
                      <div className="h-5 w-5" />
                      <span>E-Mail Alerts</span>
                    </li>
                  </ul>
                </CardContent>
                <div className="p-6 pt-0">
                  <Button 
                    variant="outline" 
                    onClick={() => openAuth('register')}
                    className="w-full py-6 font-bold"
                  >
                    Plan wählen
                  </Button>
                </div>
              </Card>

              <Card className="flex flex-col h-full border-blue-500 border-2 relative scale-105 shadow-2xl z-10 bg-white">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                  Beliebteste Wahl
                </div>
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Professional</CardTitle>
                  <div className="flex items-baseline gap-1 mt-4">
                    <span className="text-4xl font-extrabold text-blue-600">149€</span>
                    <span className="text-slate-500 font-medium">/ Monat</span>
                  </div>
                  <CardDescription className="pt-2">Für wachsende Agenturen und Berater.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="h-px bg-slate-100 mb-6" />
                  <ul className="space-y-4 text-sm font-medium">
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-blue-600 shrink-0" />
                      <span>Bis zu 50 Websites</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-blue-600 shrink-0" />
                      <span>White-Label PDF Reports</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-blue-600 shrink-0" />
                      <span>API-Zugang (Beta)</span>
                    </li>
                    <li className="flex items-center gap-3 text-slate-400">
                      <div className="h-5 w-5" />
                      <span>Prioritäts-Support</span>
                    </li>
                  </ul>
                </CardContent>
                <div className="p-6 pt-0">
                  <Button 
                    onClick={() => openAuth('register')}
                    className="w-full py-6 font-bold shadow-lg shadow-blue-500/20"
                  >
                    Jetzt durchstarten
                  </Button>
                </div>
              </Card>

              <Card className="flex flex-col h-full bg-white transition-all duration-300 hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Business</CardTitle>
                  <div className="flex items-baseline gap-1 mt-4">
                    <span className="text-4xl font-extrabold">399€</span>
                    <span className="text-slate-500 font-medium">/ Monat</span>
                  </div>
                  <CardDescription className="pt-2">Für große Kanzleien mit hunderten Mandanten.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="h-px bg-slate-100 mb-6" />
                  <ul className="space-y-4 text-sm font-medium">
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-blue-600 shrink-0" />
                      <span>Bis zu 200 Websites</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-blue-600 shrink-0" />
                      <span>Dedicated Account Manager</span>
                    </li>
                    <li className="flex items-center gap-3 text-slate-400">
                      <div className="h-5 w-5" />
                      <span>Individuelle Anpassungen</span>
                    </li>
                  </ul>
                </CardContent>
                <div className="p-6 pt-0">
                  <Button 
                    variant="outline" 
                    onClick={() => openAuth('register')}
                    className="w-full py-6 font-bold"
                  >
                    Kontakt aufnehmen
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </section>

        <Testimonials />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
            <div className="flex items-center gap-2">
              <div className="bg-slate-900 p-1.5 rounded-lg">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">DSGVO Scanner</span>
            </div>
            <div className="flex flex-wrap justify-center gap-x-10 gap-y-4 text-sm font-medium text-slate-500">
              <Link href="/impressum" className="hover:text-blue-600 transition-colors">Impressum</Link>
              <Link href="/datenschutz" className="hover:text-blue-600 transition-colors">Datenschutz</Link>
              <Link href="/agb" className="hover:text-blue-600 transition-colors">AGB</Link>
              <Link href="/kontakt" className="hover:text-blue-600 transition-colors">Kontakt</Link>
            </div>
          </div>
          <div className="text-center pt-8 border-t border-slate-100 text-slate-400 text-xs">
            <p>© 2026 DSGVO Scanner. Alle Rechte vorbehalten. Made with ❤️ in Germany 🇩🇪</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

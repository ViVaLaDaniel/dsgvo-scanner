import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Shield, ArrowLeft } from 'lucide-react';

export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="border-b bg-white/70 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center max-w-7xl">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              DSGVO<span className="text-blue-600">Scanner</span>
            </h1>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 font-bold text-slate-600">
              <ArrowLeft className="h-4 w-4" /> Zurück zur Startseite
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-16 max-w-3xl">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
          <h2 className="text-3xl font-black text-slate-900 mb-8 tracking-tight">Impressum</h2>
          
          <div className="prose prose-slate max-w-none space-y-8">
            <section>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Angaben gemäß § 5 TMG</h3>
              <p className="text-slate-600">
                Germani Project / DSGVO Scanner<br />
                Musterstraße 123<br />
                12345 Musterstadt
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Vertreten durch</h3>
              <p className="text-slate-600">Daniel Mustername</p>
            </section>

            <section>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Kontakt</h3>
              <p className="text-slate-600">
                Telefon: +49 (0) 123 456789<br />
                E-Mail: support@dsgvo-scanner.de
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Umsatzsteuer-ID</h3>
              <p className="text-slate-600">
                Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:<br />
                DE 123 456 789
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Redaktionell verantwortlich</h3>
              <p className="text-slate-600">Daniel Mustername</p>
            </section>

            <section>
              <h3 className="text-lg font-bold text-slate-900 mb-2">EU-Streitschlichtung</h3>
              <p className="text-slate-600">
                Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: 
                <a href="https://ec.europa.eu/consumers/odr/" className="text-blue-600 hover:underline ml-1" target="_blank" rel="noopener noreferrer">
                  https://ec.europa.eu/consumers/odr/
                </a>.<br />
                Unsere E-Mail-Adresse finden Sie oben im Impressum.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Verbraucher-streitbeilegung/Universal-schlichtungsstelle</h3>
              <p className="text-slate-600">
                Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
              </p>
            </section>
          </div>
        </div>
      </main>

      <footer className="py-8 text-center text-slate-400 text-sm">
        <p>© 2026 DSGVO Scanner. Alle Rechte vorbehalten.</p>
      </footer>
    </div>
  );
}

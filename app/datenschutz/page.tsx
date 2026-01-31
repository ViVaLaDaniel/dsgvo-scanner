import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Shield, ArrowLeft } from 'lucide-react';

export default function DatenschutzPage() {
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
          <h2 className="text-3xl font-black text-slate-900 mb-8 tracking-tight">Datenschutzerklärung</h2>
          
          <div className="prose prose-slate max-w-none space-y-8">
            <section>
              <h3 className="text-xl font-bold text-slate-900 mb-4">1. Datenschutz auf einen Blick</h3>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Allgemeine Hinweise</h4>
              <p className="text-slate-600 leading-relaxed">
                Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-bold text-slate-900 mb-4">2. Hosting und Server</h3>
              <p className="text-slate-600 leading-relaxed">
                Unsere Server befinden sich ausschließlich in Deutschland (Region Frankfurt, Vercel/Supabase), was ein höchstmögliches Maß an Datensicherheit garantiert.
              </p>
              <p className="text-slate-600 font-bold mt-4">Genutzte Dienste (Sub-processors):</p>
              <ul className="list-disc list-inside text-slate-600 space-y-1">
                <li><strong>Vercel</strong> (Hosting & Edge Network)</li>
                <li><strong>Supabase</strong> (Database - Region Frankfurt/EU)</li>
                <li><strong>Paddle</strong> (Merchant of Record & Payments)</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-bold text-slate-900 mb-4">3. Allgemeine Hinweise und Pflichtinformationen</h3>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Datenschutz</h4>
              <p className="text-slate-600 leading-relaxed">
                Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend den gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-bold text-slate-900 mb-4">4. Datenerfassung auf dieser Website</h3>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Cookies</h4>
              <p className="text-slate-600 leading-relaxed">
                Unsere Internetseiten verwenden so genannte „Cookies“. Cookies sind kleine Datenpakete und richten auf Ihrem Endgerät keinen Schaden an. Sie dienen dazu, unser Angebot nutzerfreundlicher, effektiver und sicherer zu machen.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-bold text-slate-900 mb-4">5. Plugins und Tools</h3>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Google Fonts</h4>
              <p className="text-slate-600 leading-relaxed">
                Diese Seite nutzt zur einheitlichen Darstellung von Schriftarten so genannte Google Fonts, die von Google bereitgestellt werden. Beim Aufruf einer Seite lädt Ihr Browser die benötigten Web Fonts in ihren Browsercache, um Texte und Schriftarten korrekt anzuzeigen.
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

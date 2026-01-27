'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Settings, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CookieSettings {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
}

export function ProfessionalCookieBanner() {
  const [show, setShow] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<CookieSettings>({
    essential: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const saveConsent = (newSettings: CookieSettings) => {
    localStorage.setItem('cookie-consent', JSON.stringify(newSettings));
    setShow(false);
  };

  const handleAcceptAll = () => {
    const allIn = { essential: true, analytics: true, marketing: true };
    setSettings(allIn);
    saveConsent(allIn);
  };

  const handleRejectAll = () => {
    const min = { essential: true, analytics: false, marketing: false };
    setSettings(min);
    saveConsent(min);
  };

  const handleSaveSettings = () => {
    saveConsent(settings);
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <div className="fixed bottom-0 left-0 right-0 z-[200] p-4 md:p-8 flex justify-center pointer-events-none">
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="w-full max-w-4xl bg-white/80 backdrop-blur-2xl border border-white/20 rounded-[2rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] pointer-events-auto overflow-hidden"
        >
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Left Side: Icon & Info */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600/10 p-2.5 rounded-xl">
                    <Shield className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Privatsphäre-Einstellungen</h3>
                </div>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  Wir verwenden Cookies, um Ihre Erfahrung so angenehm und sicher wie möglich zu gestalten. 
                  Sie können wählen, welche Arten von Daten Sie zulassen möchten. Details finden Sie in unserer 
                  <a href="/datenschutz" className="text-blue-600 hover:underline ml-1">Datenschutzerklärung</a>.
                </p>
              </div>

              {/* Right Side: Primary Actions */}
              {!showSettings && (
                <div className="flex flex-col sm:flex-row items-center gap-3 self-center">
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowSettings(true)}
                    className="font-bold text-slate-500 hover:text-slate-900 px-6 h-12"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Einstellungen
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleRejectAll}
                    className="font-bold border-slate-200 text-slate-700 h-12 px-8 hover:bg-slate-50"
                  >
                    Alle ablehnen
                  </Button>
                  <Button 
                    onClick={handleAcceptAll}
                    className="font-bold bg-slate-900 text-white hover:bg-black h-12 px-8 shadow-xl shadow-slate-900/10"
                  >
                    Alle akzeptieren
                  </Button>
                </div>
              )}
            </div>

            {/* Expanded Settings */}
            <AnimatePresence mode="wait">
              {showSettings && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-8 pt-8 border-t border-slate-100"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Essential */}
                    <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 opacity-70">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-slate-900">Notwendig</span>
                        <div className="h-5 w-5 bg-green-500 rounded-full flex items-center justify-center">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 font-medium font-medium leading-relaxed">Technisch erforderlich für die Kernfunktionen der Website.</p>
                    </div>

                    {/* Analytics */}
                    <button 
                      onClick={() => setSettings(s => ({ ...s, analytics: !s.analytics }))}
                      className={cn(
                        "p-4 rounded-2xl border transition-all text-left",
                        settings.analytics ? "bg-blue-50/50 border-blue-200" : "bg-white border-slate-100 hover:border-slate-200"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-slate-900">Analyse</span>
                        <div className={cn(
                          "h-5 w-5 rounded-md flex items-center justify-center transition-colors",
                          settings.analytics ? "bg-blue-600" : "bg-slate-200"
                        )}>
                          {settings.analytics && <Check className="h-3 w-3 text-white" />}
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">Hilft uns zu verstehen, wie Nutzer mit der Website interagieren.</p>
                    </button>

                    {/* Marketing */}
                    <button 
                      onClick={() => setSettings(s => ({ ...s, marketing: !s.marketing }))}
                      className={cn(
                        "p-4 rounded-2xl border transition-all text-left",
                        settings.marketing ? "bg-blue-50/50 border-blue-200" : "bg-white border-slate-100 hover:border-slate-200"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-slate-900">Marketing</span>
                        <div className={cn(
                          "h-5 w-5 rounded-md flex items-center justify-center transition-colors",
                          settings.marketing ? "bg-blue-600" : "bg-slate-200"
                        )}>
                          {settings.marketing && <Check className="h-3 w-3 text-white" />}
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">Wird verwendet, um personalisierte Werbung anzuzeigen.</p>
                    </button>
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button 
                      variant="ghost" 
                      onClick={() => setShowSettings(false)}
                      className="font-bold text-slate-500"
                    >
                      Abbrechen
                    </Button>
                    <Button 
                      onClick={handleSaveSettings}
                      className="font-bold bg-blue-600 hover:bg-blue-700 text-white px-8"
                    >
                      Auswahl speichern
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ShieldCheck, X, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Check if consent already exists
    const consent = localStorage.getItem('dsgvo-consent');
    if (!consent) {
      setTimeout(() => {
        setIsVisible(true);
        setIsAnimating(true);
      }, 1000);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('dsgvo-consent', JSON.stringify({
      essential: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString()
    }));
    hideBanner();
  };

  const handleDeclineAll = () => {
    localStorage.setItem('dsgvo-consent', JSON.stringify({
      essential: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString()
    }));
    hideBanner();
  };

  const hideBanner = () => {
    setIsAnimating(false);
    setTimeout(() => setIsVisible(false), 300);
  };

  if (!isVisible) return null;

  return (
    <div className={cn(
      "fixed bottom-6 left-6 right-6 z-50 transition-all duration-500 ease-in-out transform",
      isAnimating ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
    )}>
      <div className="max-w-4xl mx-auto bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          <div className="flex-shrink-0 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
            <ShieldCheck className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          
          <div className="flex-grow space-y-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Datenschutz-Einstellungen</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Wir verwenden Cookies, чтобы улучшить ваш опыт, анализировать трафик и обеспечивать безопасность. 
              Einige sind essenziell, другие помогают нам улучшать сервис. Вы можете изменить настройки в любое время.
              Подробности в нашей <Link href="/datenschutz" className="text-blue-600 hover:underline">Datenschutzerklärung</Link>.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDeclineAll}
              className="flex-grow md:flex-grow-0 font-semibold border-slate-200"
            >
              Ablehnen
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex-grow md:flex-grow-0 font-semibold text-slate-500"
            >
              <Settings2 className="h-4 w-4 mr-2" />
              Anpassen
            </Button>
            <Button 
              size="sm" 
              onClick={handleAcceptAll}
              className="flex-grow md:flex-grow-0 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/25"
            >
              Alle akzeptieren
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

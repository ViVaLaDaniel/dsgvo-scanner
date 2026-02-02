'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Globe, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const slides = [
  {
    title: "Vollautomatische Scans",
    description: "Überwachen Sie alle Ihre Mandanten-Websites rund um die Uhr. Wir finden Google Fonts, unzulässige Cookies und US-CDNs.",
    icon: Globe,
    color: "blue",
    preview: (
      <div className="bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-1">
            <div className="h-4 w-32 bg-slate-800 rounded animate-pulse" />
            <div className="h-3 w-20 bg-slate-800 rounded animate-pulse" />
          </div>
          <div className="h-10 w-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
            <Globe className="h-5 w-5 text-blue-500" />
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-4 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
              <div className="h-8 w-8 bg-slate-700 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/2 bg-slate-700 rounded" />
                <div className="h-2 w-1/4 bg-slate-700 rounded" />
              </div>
              <div className="h-6 w-16 bg-blue-600/20 rounded text-[10px] text-blue-400 font-bold flex items-center justify-center uppercase">Scanning</div>
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    title: "Sofortige Alarmierung",
    description: "Sobald ein Verstoß erkannt wird, erhalten Sie und Ihr Mandant (optional) eine detaillierte Benachrichtigung.",
    icon: AlertCircle,
    color: "red",
    preview: (
      <div className="bg-white rounded-2xl p-6 shadow-2xl border border-slate-100">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-12 w-12 bg-red-100 rounded-2xl flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900">Kritischer Verstoß</h4>
            <p className="text-xs text-slate-500 font-medium italic">Vor 2 Minuten erkannt</p>
          </div>
        </div>
        <div className="p-4 bg-red-50 rounded-xl border border-red-100 space-y-3 mb-4">
          <div className="text-xs text-red-800 font-bold flex items-center gap-2">
            <div className="h-1.5 w-1.5 bg-red-600 rounded-full animate-ping" />
            Google Fonts lokal nicht geladen
          </div>
          <div className="h-2 w-full bg-red-200 rounded-full overflow-hidden">
            <div className="h-full w-3/4 bg-red-600 rounded-full" />
          </div>
        </div>
        <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <span>ID: #SCAN-9921</span>
          <span className="text-red-600">Handlungsbedarf</span>
        </div>
      </div>
    )
  },
  {
    title: "White-Label Berichte",
    description: "Erstellen Sie professionelle PDF-Reports in Ihrem Design. Per Klick bereit für den Versand an Ihre Mandanten.",
    icon: CheckCircle2,
    color: "green",
    preview: (
      <div className="bg-slate-50 rounded-2xl p-6 shadow-2xl border border-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -mr-16 -mt-16" />
        <div className="space-y-6 relative">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-slate-900" />
            <div className="h-4 w-24 bg-slate-900 rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-8 w-full bg-white border border-slate-200 rounded-lg flex items-center px-4 justify-between">
              <span className="text-[10px] font-bold text-slate-500">Konformitätsrate</span>
              <span className="text-xs font-black text-green-600">98%</span>
            </div>
            <div className="h-8 w-full bg-white border border-slate-200 rounded-lg flex items-center px-4 justify-between">
              <span className="text-[10px] font-bold text-slate-500">Gesicherte Seiten</span>
              <span className="text-xs font-black text-slate-900">42</span>
            </div>
          </div>
          <div className="h-10 w-full bg-slate-900 rounded-xl flex items-center justify-center text-white text-xs font-bold gap-2">
            PDF Exportieren
            <ArrowRight className="h-3 w-3" />
          </div>
        </div>
      </div>
    )
  }
];

export function DashboardPreview() {
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="grid lg:grid-cols-2 gap-12 items-center bg-white/40 backdrop-blur-md p-8 md:p-12 rounded-[2.5rem] border border-white/40 shadow-2xl">
      {/* Text Context */}
      <div className="space-y-8">
        <div className="space-y-2">
          <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest">Live Preview</h3>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Ihre Kommandozentrale <br /> für den Datenschutz
          </h2>
        </div>

        <div className="space-y-4">
          {slides.map((slide, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              onMouseEnter={() => setActiveTab(idx)}
              className={cn(
                "w-full text-left p-6 rounded-2xl transition-all duration-500 flex gap-5 group",
                activeTab === idx 
                  ? "bg-white shadow-xl shadow-blue-500/5 border border-blue-100 translate-x-3" 
                  : "hover:bg-white/50 grayscale opacity-40 hover:opacity-100 hover:grayscale-0"
              )}
            >
              <div className={cn(
                "h-12 w-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-500 shadow-inner",
                activeTab === idx ? "bg-blue-600 text-white scale-110" : "bg-slate-100 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600"
              )}>
                <slide.icon className="h-6 w-6" />
              </div>
              <div>
                <h4 className={cn(
                  "font-bold text-lg mb-1 transition-colors",
                  activeTab === idx ? "text-slate-900" : "text-slate-500"
                )}>
                  {slide.title}
                </h4>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  {slide.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Visual Preview */}
      <div className="relative flex items-center justify-center perspective-1000">
        {/* Animated Orbs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-400/10 blur-[100px] rounded-full -z-10 animate-pulse" />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.9, rotateY: -10, y: 20 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, rotateY: 10, y: -20 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="w-full max-w-[450px]"
          >
            {slides[activeTab].preview}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

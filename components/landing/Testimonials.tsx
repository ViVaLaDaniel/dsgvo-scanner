'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Quote, Star, TrendingUp, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { DemoModal } from './DemoModal';

const testimonials = [
  {
    name: "Dr. Stefan Meier",
    role: "Externer DSB, München",
    content: "Dank DSGVO Scanner verwalte ich 40 Mandanten in der Zeit, in der ich früher nur 5 geschafft habe. Die Zeitersparnis ist phänomenal!",
    stats: "80% Zeitersparnis",
    icon: Clock
  },
  {
    name: "Laura Schmidt",
    role: "Rechtsanwältin & DSB",
    content: "Die White-Label Berichte sind das absolute Killer-Feature. Meine Kunden lieben die Übersichtlichkeit und ich wirke noch professioneller.",
    stats: "Höhere Kundenzufriedenheit",
    icon: Star
  },
  {
    name: "Thomas Koch",
    role: "IT-Security Consultant",
    content: "Endlich ein Tool, das wirklich findet, was abgemahnt wird. Keine False Positives mehr, nur noch klare Handlungsanweisungen.",
    stats: "Null Haftungsfälle",
    icon: TrendingUp
  }
];

export function Testimonials() {
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.03),transparent)] pointer-events-none" />
      
      <div className="container mx-auto px-4 max-w-7xl relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Das sagen <span className="text-blue-600">glückliche Experten</span>
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto font-medium">
            Schon über 200 Datenschutzbeauftragte vertrauen auf unsere Lösung, um ihre tägliche Arbeit effizienter и sicherer zu machen.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-blue-500/5 transition-all duration-300 rounded-[2rem] overflow-hidden">
                <CardContent className="p-8 flex flex-col h-full">
                  <div className="mb-6">
                    <Quote className="h-10 w-10 text-blue-100 fill-blue-50" />
                  </div>
                  
                  <p className="text-slate-700 text-lg font-medium leading-relaxed italic mb-8 flex-1">
                    "{t.content}"
                  </p>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                      <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <t.icon className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-sm font-black text-blue-700 uppercase tracking-wide">{t.stats}</span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center font-black text-slate-400">
                        {t.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{t.name}</h4>
                        <p className="text-xs text-slate-500 font-bold">{t.role}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <div className="bg-slate-900 rounded-[3rem] p-12 md:p-16 relative overflow-hidden shadow-2xl">
            {/* Flashy elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[100px] -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/20 blur-[100px] -ml-32 -mb-32" />
            
            <div className="relative z-10 space-y-8">
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                Bereit für den <br className="md:hidden" /> <span className="text-blue-400">Wow-Effekt?</span>
              </h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium">
                Schließen Sie sich den Profis an и sparen Sie noch heute bares Geld и wertvolle Lebenszeit. Keine Risiken, jederzeit kündbar.
              </p>
              <div className="flex justify-center pt-4">
                <button 
                  onClick={() => setIsDemoOpen(true)}
                  className="px-12 py-6 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 transition-all hover:-translate-y-1 active:scale-95 text-lg"
                >
                  Kostenlos testen / Demo buchen
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

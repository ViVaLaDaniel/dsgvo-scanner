'use client';

import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Send, CheckCircle2 } from 'lucide-react';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DemoModal({ isOpen, onClose }: DemoModalProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    console.log('Demo Request:', formData);

    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        onClose();
      }, 3000);
    }, 1500);
  };

  return (
    <Dialog 
      isOpen={isOpen} 
      onClose={onClose}
      title={isSubmitted ? "" : "Demo anfordern"}
      description={isSubmitted ? "" : "Erleben Sie den DSGVO Scanner live. Hinterlassen Sie Ihre Daten und wir melden uns innerhalb von 24h."}
    >
      {isSubmitted ? (
        <div className="py-12 flex flex-col items-center text-center space-y-4">
          <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-black text-slate-900">Anfrage gesendet!</h3>
          <p className="text-slate-500 font-medium max-w-xs">
            Vielen Dank! Ein Experte wird sich in Kürze bei Ihnen melden, um einen Termin zu vereinbaren.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-slate-900 font-bold">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="demo-name" className="text-xs font-black uppercase tracking-tight text-slate-500 ml-1">Name</Label>
              <Input 
                id="demo-name"
                required
                placeholder="Stefan Meier" 
                className="rounded-xl border-slate-200 focus:ring-blue-500 h-11 bg-white/50"
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, name: e.target.value})}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="demo-company" className="text-xs font-black uppercase tracking-tight text-slate-500 ml-1">Firma</Label>
              <Input 
                id="demo-company"
                required
                placeholder="Meier Consulting" 
                className="rounded-xl border-slate-200 focus:ring-blue-500 h-11 bg-white/50"
                value={formData.company}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, company: e.target.value})}
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="demo-email" className="text-xs font-black uppercase tracking-tight text-slate-500 ml-1">E-Mail Adresse</Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden="true" />
              <Input 
                id="demo-email"
                required
                type="email"
                placeholder="stefan@meier.de" 
                className="pl-10 rounded-xl border-slate-200 focus:ring-blue-500 h-11 bg-white/50"
                value={formData.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, email: e.target.value})}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="demo-message" className="text-xs font-black uppercase tracking-tight text-slate-500 ml-1">Nachricht (Optional)</Label>
            <Textarea 
              id="demo-message"
              placeholder="Ich interessiere mich für die White-Label Reports..." 
              className="rounded-xl border-slate-200 focus:ring-blue-500 min-h-[100px] bg-white/50 resize-none"
              value={formData.message}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({...formData, message: e.target.value})}
              disabled={isLoading}
            />
          </div>

          <Button 
            type="submit"
            isLoading={isLoading}
            className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 font-black shadow-lg shadow-blue-500/20 mt-4 group"
          >
            Jetzt Demo anfragen
            {!isLoading && <Send className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />}
          </Button>

          <p className="text-[10px] text-center text-slate-400 font-medium px-4">
            Mit Absenden dieses Formulars erklären Sie sich mit unserer Datenschutzerklärung einverstanden.
          </p>
        </form>
      )}
    </Dialog>
  );
}

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Send, Loader2 } from 'lucide-react';

interface SendReportModalProps {
  scanId: string;
  websiteUrl: string;
  clientName: string;
}

export function SendReportModal({ scanId, websiteUrl, clientName }: SendReportModalProps) {
  const [email, setEmail] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSend() {
    if (!email) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/send-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scanId,
          email,
          clientName,
          websiteUrl,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to send email');

      alert('Bericht wurde erfolgreich an ' + email + ' gesendet! 📧');
      setIsOpen(false);
    } catch (error: any) {
      console.error('Email send error:', error);
      alert('Fehler beim Senden: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Button variant="outline" className="font-bold gap-2" onClick={() => setIsOpen(true)}>
        <Mail className="h-4 w-4" />
        Per E-Mail senden
      </Button>

      <Dialog 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)}
        title="Bericht versenden"
        description="Senden Sie diesen DSGVO-Bericht direkt an Ihren Kunden."
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-900 font-black uppercase text-[10px] tracking-widest">
              Empfänger-Email
            </Label>
            <Input
              id="email"
              placeholder="kunde@beispiel.de"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl border-slate-200 focus:ring-blue-500"
            />
            <p className="text-[10px] text-slate-400 font-medium italic">
              Der Bericht wird im Namen Ihres Agentur-Profils versendet.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              onClick={handleSend} 
              disabled={!email || isLoading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-12 rounded-xl shadow-lg gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
              Bericht jetzt senden
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setIsOpen(false)}
              className="w-full text-slate-500 font-bold"
            >
              Abbrechen
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}

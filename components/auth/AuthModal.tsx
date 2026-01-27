'use client';

import * as React from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: 'login' | 'register';
}

export function AuthModal({ isOpen, onClose, initialView = 'login' }: AuthModalProps) {
  const [view, setView] = React.useState<'login' | 'register'>(initialView);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Reset errors when switching views
  React.useEffect(() => {
    setError('');
  }, [view]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (view === 'login') {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (loginError) throw loginError;
        router.refresh();
        onClose();
        router.push('/dashboard');
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          }
        });
        if (signUpError) throw signUpError;
        alert('Registrierung erfolgreich! Bitte prüfen Sie Ihre E-Mails zur Bestätigung.');
        setView('login');
      }
    } catch (err: any) {
      setError(err.message || 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={view === 'login' ? 'Willkommen zurück' : 'Account erstellen'}
      description={view === 'login' ? 'Melden Sie sich an, um Ihre Scans zu verwalten.' : 'Starten Sie noch heute mit Ihrem kostenlosen Monitoring.'}
      className="max-w-md"
    >
      <div className="space-y-6 pt-2">
        {/* View Switcher */}
        <div className="flex p-1 bg-slate-100/50 rounded-xl">
          <button
            onClick={() => setView('login')}
            className={cn(
              "flex-1 py-2 text-sm font-bold rounded-lg transition-all",
              view === 'login' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Anmelden
          </button>
          <button
            onClick={() => setView('register')}
            className={cn(
              "flex-1 py-2 text-sm font-bold rounded-lg transition-all",
              view === 'register' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Registrieren
          </button>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {error && (
            <Alert variant="destructive" className="bg-red-50 border-red-100 text-red-600">
              <AlertDescription className="font-bold">{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">E-Mail Adresse</label>
            <Input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white/50 border-slate-200 focus:ring-blue-500/20"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Passwort</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-white/50 border-slate-200 focus:ring-blue-500/20"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full font-bold h-12 shadow-lg shadow-blue-500/20 bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              view === 'login' ? 'Anmelden' : 'Kostenlos registrieren'
            )}
          </Button>
        </form>

        <p className="text-center text-xs text-slate-400 font-medium">
          Mit der Anmeldung akzeptieren Sie unsere <br />
          <a href="/agb" className="text-blue-500 hover:underline">AGB</a> и <a href="/datenschutz" className="text-blue-500 hover:underline">Datenschutzerklärung</a>.
        </p>
      </div>
    </Dialog>
  );
}

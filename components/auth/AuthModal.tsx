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
import { Eye, EyeOff } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: 'login' | 'register';
}

export function AuthModal({ isOpen, onClose, initialView = 'login' }: AuthModalProps) {
  const [view, setView] = React.useState<'login' | 'register'>(initialView);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [formData, setFormData] = React.useState({
    email: '',
    password: '',
    name: '',
    company: ''
  });
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Sync initial view when modal re-opens
  React.useEffect(() => {
    if (isOpen) {
      setView(initialView);
      setIsSubmitted(false);
      setError('');
      setShowPassword(false);
    }
  }, [isOpen, initialView]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (view === 'login') {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        });
        if (loginError) throw loginError;
        router.refresh();
        onClose();
        router.push('/dashboard');
      } else {
        // Registration Request Simulation
        console.log('Registration Request:', formData);
        setIsSubmitted(true);
        setTimeout(() => {
          setIsSubmitted(false);
          onClose();
          setView('login');
        }, 4000);
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
      title={isSubmitted ? "" : (view === 'login' ? 'Willkommen zurück' : 'Account anfragen')}
      description={isSubmitted ? "" : (view === 'login' ? 'Melden Sie sich an, um Ihre Scans zu verwalten.' : 'Hinterlassen Sie Ihre Daten für den Zugang zur Testversion.')}
      className="max-w-md"
    >
      <div className="space-y-6 pt-2">
        {!isSubmitted && (
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
        )}

        <AnimatePresence mode="wait">
          {isSubmitted ? (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 flex flex-col items-center text-center space-y-4"
            >
              <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <motion.div
                  initial={{ rotate: -45, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                >
                  <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              </div>
              <h3 className="text-2xl font-black text-slate-900">Anfrage gesendet!</h3>
              <p className="text-slate-500 font-medium max-w-xs">
                Vielen Dank! Wir haben Ihre Daten erhalten und werden Ihnen die Zugangsdaten in Kürze per E-Mail zusenden.
              </p>
            </motion.div>
          ) : (
            <motion.form 
              key={view}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleAuth} 
              className="space-y-4"
            >
              {error && (
                <Alert variant="destructive" className="bg-red-50 border-red-100 text-red-600">
                  <AlertDescription className="font-bold">{error}</AlertDescription>
                </Alert>
              )}

              {view === 'register' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="register-name" className="text-sm font-bold text-slate-700">Vorname</label>
                    <Input
                      id="register-name"
                      placeholder="Stefan"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                      className="bg-white/50 border-slate-200 focus:ring-blue-500/20 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="register-company" className="text-sm font-bold text-slate-700">Unternehmen</label>
                    <Input
                      id="register-company"
                      placeholder="Meier GmbH"
                      value={formData.company}
                      onChange={(e) => setFormData({...formData, company: e.target.value})}
                      required
                      className="bg-white/50 border-slate-200 focus:ring-blue-500/20 rounded-xl"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="auth-email" className="text-sm font-bold text-slate-700">E-Mail Adresse</label>
                <Input
                  id="auth-email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  className="bg-white/50 border-slate-200 focus:ring-blue-500/20 rounded-xl"
                />
              </div>

              {view === 'login' && (
                <div className="space-y-2">
                  <label htmlFor="login-password" className="text-sm font-bold text-slate-700">Passwort</label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required
                      className="bg-white/50 border-slate-200 focus:ring-blue-500/20 rounded-xl pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md"
                      aria-label={showPassword ? "Passwort verbergen" : "Passwort anzeigen"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                isLoading={loading}
                className="w-full font-bold h-12 shadow-lg shadow-blue-500/20 bg-blue-600 hover:bg-blue-700 rounded-xl mt-4"
              >
                {view === 'login' ? 'Anmelden' : 'Zugang anfordern'}
              </Button>
            </motion.form>
          )}
        </AnimatePresence>

        {!isSubmitted && (
          <p className="text-center text-xs text-slate-400 font-medium">
            Mit Absenden akzeptieren Sie unsere <br />
            <a href="/agb" className="text-blue-500 hover:underline">AGB</a> und <a href="/datenschutz" className="text-blue-500 hover:underline">Datenschutzerklärung</a>.
          </p>
        )}
      </div>
    </Dialog>
  );
}

'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createClient } from '@/lib/supabase/client';
import { Shield, Eye, EyeOff } from 'lucide-react';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planFromUrl = searchParams.get('plan') || 'starter';
  const supabase = createClient();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    company_name: '',
    plan: planFromUrl
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.passwordConfirm) {
      setError('Passwörter stimmen nicht überein');
      setLoading(false);
      return;
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            company_name: formData.company_name,
            plan: formData.plan,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) throw signUpError;

      if (data?.session) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setSubmitted(true);
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Registrierung fehlgeschlagen');
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Card className="w-full max-w-md shadow-xl border-slate-200/60 backdrop-blur-sm bg-white/95">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center mb-2">
            <div className="bg-green-100 p-4 rounded-full">
              <Shield className="h-10 w-10 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">E-Mail bestätigen</CardTitle>
          <CardDescription className="text-slate-600 font-medium">
            Wir haben einen Bestätigungslink an <strong className="text-blue-600">{formData.email}</strong> gesendet. 
            Bitte klicken Sie auf den Link, um Ihr Konto zu aktivieren.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-xs text-blue-800 leading-relaxed font-medium">
            <strong>Hinweis:</strong> Falls Sie keine E-Mail erhalten haben, prüfen Sie bitte Ihren Spam-Ordner.
          </div>
          <Link href="/login" className="block w-full">
            <Button variant="outline" className="w-full py-6 font-bold">
              Zurück zum Login
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md shadow-xl border-slate-200/60 backdrop-blur-sm bg-white/95">
      <CardHeader className="text-center space-y-2">
        <div className="flex justify-center mb-2">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
            <Shield className="h-10 w-10 text-white" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">Kostenfrei registrieren</CardTitle>
        <CardDescription className="text-slate-500 font-medium">
          14 Tage kostenlos testen. Keine Kreditkarte erforderlich.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive" className="bg-destructive/5 text-destructive border-destructive/20">
              <AlertDescription className="font-medium">{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label htmlFor="company" className="text-sm font-semibold text-slate-700">
              Firmenname
            </label>
            <Input
              id="company"
              type="text"
              placeholder="Ihre DSB-Agentur GmbH"
              value={formData.company_name}
              onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              required
              className="bg-slate-50 border-slate-200 focus:bg-white transition-all"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-semibold text-slate-700">
              E-Mail
            </label>
            <Input
              id="email"
              type="email"
              placeholder="ihr@email.de"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="bg-slate-50 border-slate-200 focus:bg-white transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold text-slate-700">
                Passwort
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={8}
                  className="bg-slate-50 border-slate-200 focus:bg-white transition-all pr-10"
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

            <div className="space-y-2">
              <label htmlFor="passwordConfirm" className="text-sm font-semibold text-slate-700">
                Bestätigen
              </label>
              <div className="relative">
                <Input
                  id="passwordConfirm"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.passwordConfirm}
                  onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
                  required
                  minLength={8}
                  className="bg-slate-50 border-slate-200 focus:bg-white transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md"
                  aria-label={showConfirmPassword ? "Passwort Bestätigung verbergen" : "Passwort Bestätigung anzeigen"}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="plan" className="text-sm font-semibold text-slate-700">
              Ausgewählter Plan
            </label>
            <select
              id="plan"
              value={formData.plan}
              onChange={(e) => setFormData({ ...formData, plan: e.target.value as any })}
              className="w-full rounded-md border border-slate-200 bg-slate-50 p-2 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer hover:bg-white"
            >
              <option value="starter">Starter (49€/Monat - 10 Websites)</option>
              <option value="professional">Professional (149€/Monat - 50 Websites)</option>
              <option value="business">Business (399€/Monat - 200 Websites)</option>
            </select>
          </div>

          <Button type="submit" className="w-full py-6 font-bold text-lg shadow-lg shadow-blue-500/20 transition-all active:scale-95" isLoading={loading}>
            Konto erstellen
          </Button>

          <div className="pt-2 text-center text-sm text-slate-600 font-medium">
            Bereits registriert?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 transition-colors font-bold underline-offset-4 hover:underline">
              Jetzt anmelden
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4 font-sans">
      <Suspense fallback={<div>Laden...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}

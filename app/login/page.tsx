'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createClient } from '@/lib/supabase/client';
import { Shield } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError('E-Mail или Passwort ist falsch');
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  };

  const handleTestLogin = () => {
    // Set a cookie that will be checked in middleware and dashboard
    document.cookie = 'test-session=true; path=/; max-age=3600'; // 1 hour
    router.push('/dashboard');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4 font-sans">
      <Card className="w-full max-w-md shadow-xl border-slate-200/60 backdrop-blur-sm bg-white/95">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
              <Shield className="h-10 w-10 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">Anmelden</CardTitle>
          <CardDescription className="text-slate-500 font-medium">
            Melden Sie sich bei Ihrem DSGVO Scanner Konto an
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
              <label htmlFor="email" className="text-sm font-semibold text-slate-700">
                E-Mail
              </label>
              <Input
                id="email"
                type="email"
                placeholder="ihr@email.de"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-slate-50 border-slate-200 focus:bg-white transition-all"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold text-slate-700">
                Passwort
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-slate-50 border-slate-200 focus:bg-white transition-all"
              />
            </div>

            <Button type="submit" className="w-full py-6 font-bold text-lg shadow-lg shadow-blue-500/20" disabled={loading}>
              {loading ? 'Wird geladen...' : 'Anmelden'}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500 font-bold tracking-widest">Dev Mode</span>
              </div>
            </div>

            <Button 
              type="button" 
              variant="outline" 
              className="w-full py-6 font-bold text-lg border-blue-200 text-blue-600 hover:bg-blue-50 transition-all border-2"
              onClick={handleTestLogin}
            >
              Test-Login (Ohne Supabase)
            </Button>

            <div className="pt-2 text-center text-sm text-slate-600 font-medium">
              Noch kein Konto?{' '}
              <Link href="/register" className="text-blue-600 hover:text-blue-700 transition-colors font-bold underline-offset-4 hover:underline">
                Jetzt registrieren
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
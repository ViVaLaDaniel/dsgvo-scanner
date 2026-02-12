'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createClient } from '@/lib/supabase/client';
import { Shield, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      setError('E-Mail oder Passwort ist falsch');
      setLoading(false);
      return;
    }

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
              <Label htmlFor="email" className="text-sm font-semibold text-slate-700">
                E-Mail
              </Label>
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
              <Label htmlFor="password" className="text-sm font-semibold text-slate-700">
                Passwort
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-slate-50 border-slate-200 focus:bg-white transition-all pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full w-10 text-slate-500 hover:text-slate-700"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Passwort verbergen" : "Passwort anzeigen"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full py-6 font-bold text-lg shadow-lg shadow-blue-500/20" isLoading={loading}>
              Anmelden
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
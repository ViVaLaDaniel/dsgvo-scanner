'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Shield, User, Building, CreditCard, Save } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { UserProfile } from '@/types/supabase';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [branding, setBranding] = useState({
    logo_url: '',
    primary_color: '#2563eb', // Default blue-600
    report_footer: 'Professionelles DSGVO-Monitoring'
  });
  const [loading, setLoading] = useState(false);
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    async function loadProfile() {
      const isTestSession = document.cookie.includes('test-session=true');
      
      // Load branding settings from sessionStorage
      const savedBranding = sessionStorage.getItem('user-branding');
      if (savedBranding) {
        setBranding(JSON.parse(savedBranding));
      }

      if (isTestSession) {
        setProfile({
          company_name: 'Dev Tester GmbH',
          email: 'test@example.com',
          website_limit: 50,
          plan: 'professional'
        } as any);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('user_profiles').select('*').eq('id', user.id).single();
        if (data) setProfile(data);
      }
    }
    loadProfile();
  }, [supabase]);

  const handleSave = () => {
    setLoading(true);
    
    // Save branding to sessionStorage
    sessionStorage.setItem('user-branding', JSON.stringify(branding));

    setTimeout(() => {
      setLoading(false);
      alert('Einstellungen успешно сохранены! ✅');
    }, 800);
  };

  const colors = [
    { name: 'Standard Blau', value: '#2563eb' },
    { name: 'Smaragd Grün', value: '#059669' },
    { name: 'Indigo', value: '#4f46e5' },
    { name: 'Schiefer', value: '#334155' },
    { name: 'Purpur', value: '#7c3aed' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Einstellungen</h2>
        <p className="text-slate-500 font-medium mt-1">Verwalten Sie Ihr Konto и Ihre Branding-Präferenzen</p>
      </div>

      <div className="grid gap-8 max-w-4xl">
        {/* 1. Profile Section */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="border-b bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <User className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">Profil-Informationen</CardTitle>
                <CardDescription className="font-medium">Ihre persönlichen Details</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Building className="h-4 w-4 text-slate-400" /> Unternehmensname
                </label>
                <Input 
                  defaultValue={profile?.company_name || ''} 
                  onChange={(e) => setProfile(p => p ? { ...p, company_name: e.target.value } : null)}
                  className="bg-white border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">E-Mail Adresse</label>
                <Input 
                  defaultValue={(profile as any)?.email || 'dev@vivada.de'} 
                  disabled 
                  className="bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Branding & White-Label Section */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="border-b bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-100 rounded-lg text-pink-600">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">Брендинг и White-Label</CardTitle>
                <CardDescription className="font-medium">Настройте внешний вид ваших отчетов</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-8">
            <div className="grid gap-8 md:grid-cols-2">
              {/* Logo URL */}
              <div className="space-y-4 text-nowrap">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Logo-URL (für Berichte)</label>
                  <Input 
                    placeholder="https://ihre-website.de/logo.png"
                    value={branding.logo_url}
                    onChange={(e) => setBranding({ ...branding, logo_url: e.target.value })}
                    className="bg-white border-slate-200"
                  />
                  <p className="text-[10px] text-slate-400 font-medium italic">Empfohlen: Transparentes PNG, ca. 400x120px</p>
                </div>

                {/* Report Footer */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Bericht-Fußzeile</label>
                  <Input 
                    placeholder="Eigener Text im Footer..."
                    value={branding.report_footer}
                    onChange={(e) => setBranding({ ...branding, report_footer: e.target.value })}
                    className="bg-white border-slate-200"
                  />
                </div>
              </div>

              {/* Color Scheme */}
              <div className="space-y-4">
                <label className="text-sm font-bold text-slate-700">Primärfarbe der Berichte</label>
                <div className="flex flex-wrap gap-3">
                  {colors.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => setBranding({ ...branding, primary_color: c.value })}
                      className={cn(
                        "h-10 w-10 rounded-xl border-2 transition-all p-0.5",
                        branding.primary_color === c.value ? "border-slate-900 scale-110 shadow-lg" : "border-transparent"
                      )}
                    >
                      <div className="h-full w-full rounded-lg" style={{ backgroundColor: c.value }} />
                    </button>
                  ))}
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mt-4">
                  <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-2">Vorschau</p>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-24 rounded-full" style={{ backgroundColor: branding.primary_color }} />
                    <div className="h-3 w-8 rounded-full" style={{ backgroundColor: branding.primary_color, opacity: 0.3 }} />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. Plan & Abrechnung Section */}
        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="border-b bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">Plan & Abrechnung</CardTitle>
                <CardDescription className="font-medium">Verwalten Sie Ihr Abonnement</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 bg-slate-900 rounded-2xl text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full -mr-16 -mt-16 blur-3xl" />
              <div>
                <Badge className="bg-indigo-500 text-white border-none uppercase text-[10px] font-black px-3 py-1 mb-3">
                  {profile?.plan?.toUpperCase() || 'PROFESSIONAL'}
                </Badge>
                <h4 className="text-2xl font-black">{profile?.website_limit || 50} Websites</h4>
                <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-widest">Inklusive White-Label Reports</p>
              </div>
              <Button className="bg-white text-slate-900 hover:bg-slate-100 font-bold px-8 shadow-xl shadow-white/5 no-print">
                Plan ändern
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={loading} className="bg-blue-600 hover:bg-blue-700 font-bold px-10 h-12 shadow-lg shadow-blue-500/20 gap-2">
            {loading ? 'Wird gespeichert...' : (
              <>
                <Save className="h-4 w-4" />
                Einstellungen speichern
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

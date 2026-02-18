'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Shield, User, Building, CreditCard, Save, Upload, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PricingSection } from '@/components/dashboard/PricingSection';
import { useSettings } from '@/lib/hooks/useSettings';

export default function SettingsPage() {
  const { 
    profile, 
    agency, 
    isLoading, 
    isSaving, 
    saveSettings, 
    uploadLogo 
  } = useSettings();

  const [localProfile, setLocalProfile] = useState(profile);
  const [localAgency, setLocalAgency] = useState(agency);
  const [uploading, setUploading] = useState(false);
  const [showPricing, setShowPricing] = useState(false);

  // Sync local state when data loads
  useEffect(() => {
    if (profile) setLocalProfile(profile);
    if (agency) setLocalAgency(agency);
  }, [profile, agency]);

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Datei ist zu groß. Maximum ist 2MB.');
      return;
    }

    setUploading(true);
    try {
      const url = await uploadLogo(file);
      setLocalAgency(prev => ({ ...prev, logo_url: url }));
    } catch (err: any) {
      alert('Fehler beim Hochladen: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!localProfile) return;
    const result = await saveSettings(localProfile, localAgency);
    if (result.success) {
      alert('Einstellungen erfolgreich gespeichert! ✅');
    } else {
      alert('Fehler beim Speichern: ' + result.error);
    }
  };

  const colors = [
    { name: 'Standard Blau', value: '#2563eb' },
    { name: 'Smaragd Grün', value: '#059669' },
    { name: 'Indigo', value: '#4f46e5' },
    { name: 'Schiefer', value: '#334155' },
    { name: 'Purpur', value: '#7c3aed' },
  ];

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 w-48 bg-slate-100 rounded" />
        <div className="grid gap-8 max-w-4xl">
          <Card className="h-48 border-slate-100" />
          <Card className="h-64 border-slate-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Einstellungen</h2>
        <p className="text-slate-500 font-medium mt-1">Verwalten Sie Ihr Konto und Ihre Branding-Präferenzen</p>
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
                  value={localProfile?.company_name || ''} 
                  onChange={(e) => setLocalProfile(p => p ? { ...p, company_name: e.target.value } : null)}
                  className="bg-white border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">E-Mail Adresse</label>
                <Input 
                  value={(localProfile as any)?.email || ''} 
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
                <CardTitle className="text-lg font-bold">Branding und White-Label</CardTitle>
                <CardDescription className="font-medium">Passen Sie das Erscheinungsbild Ihrer Berichte an</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-8">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Agentur-Logo</label>
                  <div className="flex flex-col gap-4">
                    {localAgency.logo_url ? (
                      <div className="relative group w-fit">
                        <div className="h-24 px-6 py-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-sm overflow-hidden min-w-[200px]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={localAgency.logo_url} 
                            alt="Agency Logo" 
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                        <button 
                          onClick={() => setLocalAgency({ ...localAgency, logo_url: '' })}
                          aria-label="Remove logo"
                          className="absolute -top-2 -right-2 p-1.5 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors shadow-sm opacity-0 group-hover:opacity-100"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div 
                        onClick={() => document.getElementById('logo-upload')?.click()}
                        className="h-24 px-6 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-all group"
                      >
                        {uploading ? (
                          <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
                        ) : (
                          <Upload className="h-6 w-6 text-slate-400 group-hover:text-blue-500" />
                        )}
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-blue-600">
                          {uploading ? 'Wird hochgeladen...' : 'Logo hochladen'}
                        </p>
                      </div>
                    )}
                    <input 
                      id="logo-upload"
                      type="file" 
                      accept="image/*"
                      className="hidden"
                      onChange={handleUploadLogo}
                      disabled={uploading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Bericht-Fußzeile</label>
                  <Input 
                    placeholder="Eigener Text im Footer..."
                    value={localAgency.report_footer || ''}
                    onChange={(e) => setLocalAgency({ ...localAgency, report_footer: e.target.value })}
                    className="bg-white border-slate-200"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold text-slate-700">Primärfarbe der Berichte</label>
                <div className="flex flex-wrap gap-3">
                  {colors.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => setLocalAgency({ ...localAgency, brand_color: c.value })}
                      aria-label={`Select color ${c.name}`}
                      className={cn(
                        "h-10 w-10 rounded-xl border-2 transition-all p-0.5",
                        localAgency.brand_color === c.value ? "border-slate-900 scale-110 shadow-lg" : "border-transparent"
                      )}
                    >
                      <div className="h-full w-full rounded-lg" style={{ backgroundColor: c.value }} />
                    </button>
                  ))}
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mt-4">
                  <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-2">Vorschau</p>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-24 rounded-full" style={{ backgroundColor: localAgency.brand_color }} />
                    <div className="h-3 w-8 rounded-full" style={{ backgroundColor: localAgency.brand_color, opacity: 0.3 }} />
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
                  {localProfile?.plan?.toUpperCase() || 'STARTER'}
                </Badge>
                <h4 className="text-2xl font-black">{localProfile?.website_limit || 10} Websites</h4>
                <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-widest">Inklusive White-Label Reports</p>
              </div>
              <Button 
                onClick={() => setShowPricing(!showPricing)}
                className="bg-white text-slate-900 hover:bg-slate-100 font-bold px-8 shadow-xl shadow-white/5"
              >
                {showPricing ? 'Abbrechen' : 'Plan ändern'}
              </Button>
            </div>
            {showPricing && (
              <div className="mt-8 animate-in slide-in-from-top-4 duration-500">
                <PricingSection />
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 font-bold px-10 h-12 shadow-lg shadow-blue-500/20 gap-2">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Einstellungen speichern
          </Button>
        </div>
      </div>
    </div>
  );
}

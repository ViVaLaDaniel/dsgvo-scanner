'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createClient } from '@/lib/supabase/client';
import { Plus, Globe, Trash2, Play, ExternalLink, ShieldCheck, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog } from '@/components/ui/dialog';
import { useWebsites } from '@/lib/hooks/useWebsites';
import { useScanner } from '@/lib/hooks/useScanner';

const websiteSchema = z.object({
  url: z.string().url({ message: 'Ungültige URL. Bitte mit http:// oder https:// eingeben.' }),
  client_name: z.string().min(2, { message: 'Mandantename muss mindestens 2 Zeichen lang sein.' }).max(100)
});

type WebsiteFormValues = z.infer<typeof websiteSchema>;

export default function WebsitesPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [showAddForm, setShowAddForm] = useState(false);
  const [addError, setAddError] = useState('');

  // Custom Hooks
  const { 
    websites, 
    profile, 
    latestScans, 
    isLoading: isLoadingData, 
    refresh: refreshData, 
    deleteWebsite 
  } = useWebsites();

  const { 
    startScan, 
    isScanning, 
    error: scanError 
  } = useScanner();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<WebsiteFormValues>({
    resolver: zodResolver(websiteSchema),
    defaultValues: { url: '', client_name: '' }
  });

  const onSubmit = async (values: WebsiteFormValues) => {
    setAddError('');
    if (!profile) return;

    if (websites.length >= profile.website_limit) {
      setAddError(`Limit erreicht (${profile.website_limit}). Bitte Account upgraden.`);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const url = new URL(values.url);
      const { error: insertError } = await supabase.from('websites').insert({
        url: values.url,
        domain: url.hostname,
        client_name: values.client_name,
        owner_id: user.id,
        scan_frequency: 'weekly',
        status: 'active'
      });

      if (insertError) throw insertError;

      reset();
      setShowAddForm(false);
      refreshData();
    } catch (err: any) {
      setAddError(err.message || 'Fehler beim Hinzufügen');
    }
  };

  const handleAction = async (websiteId: string, scanId?: string) => {
    if (scanId) {
      router.push(`/dashboard/scans/${scanId}`);
    } else {
      await startScan(websiteId);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Möchten Sie diese Website wirklich dauerhaft löschen? Alle zugehörigen Scans werden ebenfalls entfernt.')) {
      await deleteWebsite(id);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Websites</h2>
          <p className="text-slate-500 font-medium mt-1">
            {websites.length} von {profile?.website_limit || 0} Websites aktiv
          </p>
        </div>
        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          className={cn("font-bold shadow-lg transition-all", showAddForm ? "bg-slate-800" : "shadow-blue-500/20")}
        >
          <Plus className={cn("h-4 w-4 transition-transform", showAddForm && "rotate-45")} />
          {showAddForm ? 'Abbrechen' : 'Website hinzufügen'}
        </Button>
      </div>

      {scanError && (
        <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-700 animate-in slide-in-from-top-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="font-bold">
            Fehler beim Scannen: {scanError}
          </AlertDescription>
        </Alert>
      )}

      {/* Add Website Dialog */}
      <Dialog
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        title="Neue Website hinzufügen"
        description="Geben Sie die Details Ihres Mandanten ein"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {addError && (
            <Alert variant="destructive" className="bg-red-50 border-red-100 text-red-600">
              <AlertDescription className="font-bold text-xs">{addError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="website-url" className="text-sm font-bold text-slate-700">Website URL</Label>
              <Input
                id="website-url"
                {...register('url')}
                placeholder="https://example.com"
                className={cn("bg-white border-slate-200", errors.url && "border-red-500")}
              />
              {errors.url && <p className="text-red-500 text-[10px] font-bold">{errors.url.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="client-name" className="text-sm font-bold text-slate-700">Mandantenname</Label>
              <Input
                id="client-name"
                {...register('client_name')}
                placeholder="Mustermann GmbH"
                className={cn("bg-white border-slate-200", errors.client_name && "border-red-500")}
              />
              {errors.client_name && <p className="text-red-500 text-[10px] font-bold">{errors.client_name.message}</p>}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" isLoading={isSubmitting} className="flex-1 font-bold shadow-lg shadow-blue-500/20">
              Hinzufügen
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowAddForm(false)} className="flex-1 font-bold">
              Abbrechen
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Websites List */}
      <div className="grid gap-6">
        {isLoadingData ? (
          Array(2).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse border-slate-100 p-6">
              <div className="flex items-center gap-6">
                <div className="h-14 w-14 bg-slate-100 rounded-2xl" />
                <div className="space-y-2 flex-1">
                  <div className="h-5 w-48 bg-slate-100 rounded" />
                  <div className="h-4 w-32 bg-slate-50 rounded" />
                </div>
                <div className="h-10 w-32 bg-slate-100 rounded-lg" />
              </div>
            </Card>
          ))
        ) : websites.length === 0 ? (
          <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
            <CardContent className="text-center py-20">
              <div className="bg-slate-200 p-4 rounded-full w-fit mx-auto mb-4">
                 <Globe className="h-10 w-10 text-slate-400" />
              </div>
              <p className="text-slate-900 font-bold text-lg">Noch keine Websites hinzugefügt</p>
              <p className="text-sm text-slate-500 mt-2 font-medium">Verwalten Sie hier Ihre Mandanten.</p>
            </CardContent>
          </Card>
        ) : (
          websites.map((website) => {
            const scan = latestScans.find((s: any) => s.website_id === website.id);
            const score = scan?.risk_score ?? null;

            return (
              <Card 
                key={website.id} 
                className={cn(
                  "group transition-all duration-300 border-slate-200 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5",
                  scan ? "cursor-pointer" : "cursor-default"
                )}
                onClick={() => scan && handleAction(website.id, scan.id)}
              >
                <CardContent className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-6">
                  <div className="flex items-center gap-5">
                    <div className={cn(
                      "h-14 w-14 rounded-2xl flex items-center justify-center shadow-sm border transition-all duration-500",
                      score !== null ? (score < 70 ? "bg-red-50 text-red-600 border-red-100" : "bg-blue-50 text-blue-600 border-blue-100") : "bg-slate-50 text-slate-400 border-slate-100"
                    )}>
                      <Globe className={cn("h-7 w-7 transition-all duration-500", scan && "group-hover:scale-110")} />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-lg group-hover:text-blue-600 transition-colors uppercase tracking-tight">{website.client_name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-sm font-bold text-slate-400">{website.domain}</span>
                        <a 
                          href={website.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-slate-300 hover:text-blue-500 transition-colors"
                          aria-label="Website besuchen"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-6">
                    {score !== null && (
                      <div className="flex flex-col items-center">
                        <div className={cn("text-2xl font-black", score < 70 ? "text-red-500" : "text-blue-600")}>
                          {score}%
                        </div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">DSGVO Score</div>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <Button 
                        size="sm" 
                        variant={scan ? "outline" : "default"}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction(website.id, scan?.id);
                        }}
                        isLoading={isScanning === website.id}
                        className={cn(
                          "font-bold h-10 px-6",
                          !scan && "bg-blue-600 shadow-lg shadow-blue-500/20"
                        )}
                      >
                        {isScanning === website.id ? 'Scannen...' : scan ? (
                          <>
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Bericht
                          </>
                        ) : (
                          <>
                            <Play className="h-3.5 w-3.5 fill-current" />
                            Jetzt scannen
                          </>
                        )}
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(website.id);
                        }}
                        className="text-slate-300 hover:text-red-600 hover:bg-red-50 h-10 w-10 p-0"
                        aria-label="Website löschen"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

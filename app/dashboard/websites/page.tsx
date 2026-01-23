'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createClient } from '@/lib/supabase/client';
import { Website, UserProfile } from '@/types/supabase';
import { Plus, Globe, Trash2, Play, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function WebsitesPage() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    url: '',
    client_name: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [supabase] = useState(() => createClient());

  const loadData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Load profile
    const { data: profileData } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileData) setProfile(profileData);

    // Load websites
    const { data: websitesData } = await supabase
      .from('websites')
      .select('*')
      .order('created_at', { ascending: false });

    if (websitesData) setWebsites(websitesData);
  }, [supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !profile) return;

    // Check limit
    if (websites.length >= profile.website_limit) {
      setError(`Sie haben Ihr Limit von ${profile.website_limit} Websites erreicht. Upgraden Sie Ihren Plan.`);
      setLoading(false);
      return;
    }

    try {
      // Extract domain from URL
      const url = new URL(formData.url);
      const domain = url.hostname;

      const { error: insertError } = await supabase.from('websites').insert({
        url: formData.url,
        domain: domain,
        client_name: formData.client_name,
        owner_id: user.id,
        scan_frequency: 'weekly',
        status: 'active'
      });

      if (insertError) throw insertError;

      setFormData({ url: '', client_name: '' });
      setShowAddForm(false);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Fehler beim Hinzufügen');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Website wirklich löschen?')) return;

    try {
      const { error: deleteError } = await supabase
        .from('websites')
        .delete()
        .eq('id', id);
      
      if (deleteError) throw deleteError;
      loadData();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleScanNow = async (websiteId: string) => {
    try {
      const { error: scanError } = await supabase.from('scans').insert({
        website_id: websiteId,
        status: 'pending',
        violations_count: 0,
        risk_score: 0
      });

      if (scanError) throw scanError;

      alert('Scan wurde gestartet! (In Produktion würde hier ein Backend-Worker starten)');
    } catch (err) {
      console.error('Scan failed:', err);
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
          <Plus className={cn("h-4 w-4 mr-2 transition-transform", showAddForm && "rotate-45")} />
          {showAddForm ? 'Abbrechen' : 'Website hinzufügen'}
        </Button>
      </div>

      {/* Add Website Form */}
      {showAddForm && (
        <Card className="border-blue-100 bg-blue-50/30 shadow-xl shadow-blue-500/5 animate-in slide-in-from-top-4 duration-300">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Neue Website hinzufügen</CardTitle>
            <CardDescription className="font-medium">
              Fügen Sie die URL и den Mandantennamen hinzu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="bg-destructive/5 border-destructive/20 text-destructive">
                  <AlertDescription className="font-bold">{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Website URL</label>
                  <Input
                    type="url"
                    placeholder="https://example.com"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    required
                    className="bg-white border-slate-200 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Mandantenname</label>
                  <Input
                    type="text"
                    placeholder="Mustermann GmbH"
                    value={formData.client_name}
                    onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                    required
                    className="bg-white border-slate-200 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={loading} className="font-bold px-8 shadow-lg shadow-blue-500/20">
                  {loading ? 'Wird hinzugefügt...' : 'Hinzufügen'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)} className="font-bold border-slate-200">
                  Abbrechen
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Websites List */}
      <div className="grid gap-6 md:grid-cols-1 overflow-hidden">
        {websites.length === 0 ? (
          <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
            <CardContent className="text-center py-20">
              <div className="bg-slate-200 p-4 rounded-full w-fit mx-auto mb-4">
                 <Globe className="h-10 w-10 text-slate-400" />
              </div>
              <p className="text-slate-900 font-bold text-lg">Noch keine Websites hinzugefügt</p>
              <p className="text-sm text-slate-500 mt-2 font-medium">
                Klicken Sie auf &quot;Website hinzufügen&quot; um Ihren ersten Mandanten zu verwalten
              </p>
            </CardContent>
          </Card>
        ) : (
          websites.map((website) => (
            <Card key={website.id} className="group hover:shadow-lg hover:border-blue-200 transition-all duration-300">
              <CardContent className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-6">
                <div className="flex items-center gap-5">
                  <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                    <Globe className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-lg">{website.client_name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <a 
                        href={website.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm font-bold text-blue-600 hover:text-blue-700 underline-offset-4 hover:underline flex items-center gap-1"
                      >
                        {website.domain} <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 mt-1.5 uppercase tracking-widest">
                      Hinzugefügt am {new Date(website.created_at).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Badge className={cn(
                    "font-bold uppercase tracking-widest px-3 py-1 text-[10px] shadow-sm",
                    website.status === 'active' ? "bg-green-50 text-green-700 border-green-200" : "bg-slate-100 text-slate-500 border-slate-200"
                  )}>
                    {website.status === 'active' ? 'Aktiv' : website.status}
                  </Badge>
                  
                  <div className="h-8 w-px bg-slate-100 mx-1 hidden md:block" />
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleScanNow(website.id)}
                    className="font-bold border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all h-10 px-4"
                  >
                    <Play className="h-3.5 w-3.5 mr-2 fill-current" />
                    Jetzt scannen
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => handleDelete(website.id)}
                    className="text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all h-10 w-10 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
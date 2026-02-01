'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { UserProfile, Agency } from '@/types/supabase';

export function useSettings() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [agency, setAgency] = useState<Partial<Agency>>({
    logo_url: '',
    brand_color: '#2563eb',
    report_footer: 'Professionelles DSGVO-Monitoring'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [supabase] = useState(() => createClient());

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [
        { data: profileData },
        { data: agencyData }
      ] = await Promise.all([
        supabase.from('user_profiles').select('*').eq('id', user.id).single(),
        supabase.from('agencies').select('*').eq('owner_id', user.id).single()
      ]);

      if (profileData) setProfile(profileData);
      if (agencyData) setAgency(agencyData);
    } catch (err) {
      console.error('useSettings load error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const saveSettings = async (newProfile: any, newAgency: any) => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Nicht authentifiziert');

      // Update Agency Branding
      const { error: agencyError } = await supabase
        .from('agencies')
        .upsert({
          owner_id: user.id,
          name: newProfile.company_name || 'Agentur',
          logo_url: newAgency.logo_url,
          brand_color: newAgency.brand_color,
          report_footer: newAgency.report_footer,
          updated_at: new Date().toISOString()
        });

      if (agencyError) throw agencyError;

      // Update User Profile (e.g. company name)
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          company_name: newProfile.company_name,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Update local state
      setProfile(newProfile);
      setAgency(newAgency);
      
      return { success: true };
    } catch (err: any) {
      console.error('useSettings save error:', err);
      return { success: false, error: err.message };
    } finally {
      setIsSaving(false);
    }
  };

  const uploadLogo = async (file: File) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Nicht authentifiziert');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/logo-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('agency-logos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('agency-logos')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (err: any) {
      console.error('Logo upload error:', err);
      throw err;
    }
  };

  return {
    profile,
    agency,
    isLoading,
    isSaving,
    saveSettings,
    uploadLogo,
    refresh: loadData
  };
}

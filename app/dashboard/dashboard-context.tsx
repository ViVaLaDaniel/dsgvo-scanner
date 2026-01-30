'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { UserProfile } from '@/types/supabase';
import { User } from '@supabase/supabase-js';

interface DashboardContextType {
  user: User | null;
  profile: UserProfile | null;
  websiteCount: number;
  isLoading: boolean;
  refreshData: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [websiteCount, setWebsiteCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [supabase] = useState(() => createClient());
  const router = useRouter();
  const pathname = usePathname();

  const loadData = useCallback(async () => {
    try {
      // 1. Get User
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      if (!currentUser) {
        router.push('/login');
        return;
      }

      setUser(currentUser);

      // 2. Get Profile
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (profileData) setProfile(profileData);

      // 3. Get Website Count
      const { count } = await supabase
        .from('websites')
        .select('*', { count: 'exact', head: true });

      setWebsiteCount(count || 0);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, router]);

  useEffect(() => {
    loadData();
  }, [loadData, pathname]); // Re-fetch on route change if needed, or remove pathname if global cache is desired

  const value = {
    user,
    profile,
    websiteCount,
    isLoading,
    refreshData: loadData
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}

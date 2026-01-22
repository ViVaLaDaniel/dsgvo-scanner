'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Shield, LayoutDashboard, Globe, Settings, LogOut, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { UserProfile } from '@/types/supabase';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (data) setProfile(data);
    }
    loadProfile();
  }, [supabase, router]);

  const navItems = [
    { href: '/dashboard', label: 'Übersicht', icon: LayoutDashboard },
    { href: '/dashboard/websites', label: 'Websites', icon: Globe },
    { href: '/dashboard/settings', label: 'Einstellungen', icon: Settings },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 hidden h-full w-64 border-r bg-white flex flex-col z-40 lg:flex text-slate-900">
        <div className="flex h-16 items-center border-b px-6 gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg shadow-blue-500/20">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">DSGVO<span className="text-blue-600 font-extrabold">Scan</span></span>
        </div>

        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                  isActive 
                    ? "bg-blue-50 font-bold text-blue-700" 
                    : "font-semibold text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t p-4 mt-auto">
          <div className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-xl mb-4">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs shadow-sm shadow-blue-500/10">
              {profile?.company_name?.substring(0, 2).toUpperCase() || '??'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-xs font-bold text-slate-900 leading-none">{profile?.company_name || 'Lädt...'}</p>
              <p className="truncate text-[10px] text-slate-500 mt-1 font-medium">{profile?.plan ? profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1) : ''} Plan</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className="w-full justify-start gap-3 text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors font-bold px-3"
          >
            <LogOut className="h-4 w-4" />
            Abmelden
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white/80 backdrop-blur-md px-6 lg:px-8">
          <h1 className="text-lg font-bold text-slate-900 lg:hidden flex items-center gap-2">
             <Shield className="h-5 w-5 text-blue-600" /> DSGVO Scan
          </h1>
          <div className="hidden lg:block" /> {/* Placeholder for layout balance */}
          
          <div className="flex items-center gap-4">
            <button className="relative rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all group">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" />
            </button>
            <div className="h-8 w-px bg-slate-200 mx-1" />
            <button className="flex items-center gap-2 rounded-full bg-slate-100 p-1 pr-3 hover:bg-slate-200 transition-all">
              <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] text-white font-bold leading-none">
                {profile?.company_name?.substring(0, 2).toUpperCase() || '??'}
              </div>
              <span className="text-xs font-bold text-slate-700">Konto</span>
            </button>
          </div>
        </header>

        <main className="p-6 lg:p-8 animate-in fade-in duration-500">
          {children}
        </main>
      </div>
    </div>
  );
}
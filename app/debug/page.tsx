'use client';

import { useEffect, useState } from 'react';
import { usePaddle } from '@/components/providers/PaddleProvider';

export default function DebugPage() {
  const { paddle } = usePaddle();
  const [envStatus, setEnvStatus] = useState<any>({});
  const [browserInfo, setBrowserInfo] = useState<string>('');

  useEffect(() => {
    setEnvStatus({
      paddleEnv: process.env.NEXT_PUBLIC_PADDLE_ENV,
      paddleToken: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN ? 'Present (Hidden)' : 'MISSING',
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Present' : 'MISSING',
      paddleLoaded: !!paddle,
    });
    setBrowserInfo(navigator.userAgent);
  }, [paddle]);

  return (
    <div className="p-8 max-w-2xl mx-auto font-mono text-sm">
      <h1 className="text-2xl font-bold mb-6 text-red-600">🕵️ System Diagnostics</h1>
      
      <div className="space-y-6">
        <section className="border p-4 rounded bg-slate-50">
          <h2 className="font-bold mb-2">Environment Variables</h2>
          <pre>{JSON.stringify(envStatus, null, 2)}</pre>
        </section>

        <section className="border p-4 rounded bg-slate-50">
          <h2 className="font-bold mb-2">Paddle Status</h2>
          <div className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded-full ${paddle ? 'bg-green-500' : 'bg-red-500'}`} />
            <span>{paddle ? 'Initialized Ready' : 'Not Initialized (Check AdBlock / Keys)'}</span>
          </div>
        </section>

        <section className="border p-4 rounded bg-slate-50">
          <h2 className="font-bold mb-2">Browser Info</h2>
          <p>{browserInfo}</p>
        </section>
      </div>

      <p className="mt-8 text-slate-500">
        Note: This page is for debugging purposes only. Delete before final launch.
      </p>
    </div>
  );
}

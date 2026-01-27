import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle } from 'lucide-react';

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-10 rounded-3xl shadow-xl border border-slate-100">
        <div className="flex justify-center">
          <div className="bg-red-50 p-4 rounded-full">
            <AlertTriangle className="h-12 w-12 text-red-600" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">Authentifizierungsfehler</h1>
          <p className="text-slate-500">
            Der Bestätigungscode ist ungültig или abgelaufen. Bitte versuchen Sie sich erneut anzumelden или fordern Sie einen neuen Link an.
          </p>
        </div>

        <div className="pt-4 flex flex-col gap-3">
          <Link href="/login" className="w-full">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 font-bold py-6">
              Zum Login
            </Button>
          </Link>
          <Link href="/" className="w-full">
            <Button variant="ghost" className="w-full text-slate-500 font-bold">
              Zur Startseite
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

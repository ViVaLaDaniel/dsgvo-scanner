
import { Card } from '@/components/ui/card';

export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse pb-20">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 bg-slate-100 rounded-lg" />
        <div className="h-12 w-64 bg-slate-100 rounded" />
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 h-48 border-slate-100 shadow-sm" />
        <Card className="h-48 border-slate-100 shadow-sm" />
      </div>
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-100 rounded" />
        {[1, 2].map(i => <Card key={i} className="h-40 border-slate-100 shadow-sm" />)}
      </div>
    </div>
  );
}

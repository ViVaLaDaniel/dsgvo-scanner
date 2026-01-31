'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Shield, Rocket, Building } from 'lucide-react';
import { usePaddle } from '@/components/providers/PaddleProvider';
import { createClient } from '@/lib/supabase/client';

const PLANS = [
  {
    name: 'Starter',
    priceId: 'pri_01kgawpyk6qvsthth775tkv641',
    price: '49€',
    description: 'Perfekt für Freelance-DSBs.',
    features: ['10 Websites', 'Wöchentliche Scans', 'E-Mail Alerts'],
    icon: Shield,
    color: 'blue'
  },
  {
    name: 'Professional',
    priceId: 'pri_01kgawtfz7k3n9emy2kwn2z292',
    price: '149€',
    description: 'Für wachsende Agenturen.',
    features: ['50 Websites', 'White-Label PDF Reports', 'API-Zugang (Beta)'],
    icon: Rocket,
    color: 'indigo'
  },
  {
    name: 'Business',
    priceId: 'pri_01kgawx9m0d9zd3znpw7003abb',
    price: '399€',
    description: 'Für große Kanzleien.',
    features: ['200 Websites', 'Dedicated Account Manager', 'Individuelle Anpassungen'],
    icon: Building,
    color: 'slate'
  }
];

export function PricingSection() {
  const { paddle } = usePaddle();
  const [loading, setLoading] = useState<string | null>(null);
  const [supabase] = useState(() => createClient());

  const handleSubscribe = async (priceId: string) => {
    if (!paddle) return;
    setLoading(priceId);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert('Bitte melden Sie sich erst an.');
        setLoading(null);
        return;
      }

      paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        customer: {
          email: user.email!,
        },
        customData: {
          userId: user.id
        }
      });
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {PLANS.map((plan) => (
        <Card key={plan.name} className="flex flex-col h-full hover:shadow-lg transition-all border-slate-200">
          <CardHeader>
            <div className={`p-2 w-fit rounded-lg bg-${plan.color}-100 text-${plan.color}-600 mb-4`}>
              <plan.icon className="h-6 w-6" />
            </div>
            <CardTitle>{plan.name}</CardTitle>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-3xl font-bold">{plan.price}</span>
              <span className="text-slate-500 text-sm">/ Monat</span>
            </div>
            <CardDescription className="mt-2">{plan.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-4">
            <div className="h-px bg-slate-100" />
            <ul className="space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm font-medium">
                  <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
          <div className="p-6 pt-0">
            <Button 
              className="w-full font-bold" 
              variant={plan.name === 'Professional' ? 'default' : 'outline'}
              onClick={() => handleSubscribe(plan.priceId)}
              disabled={loading === plan.priceId}
            >
              {loading === plan.priceId ? 'Wird geladen...' : 'Plan wählen'}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}

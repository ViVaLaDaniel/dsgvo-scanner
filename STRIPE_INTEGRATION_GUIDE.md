# 💳 STRIPE INTEGRATION GUIDE - НЕМЕЦКИЙ РЫНОК

**Версия:** 1.0  
**Дата:** 31 января 2026  
**Целевой рынок:** Германия (DACH region)

---

## 🎯 ЦЕЛЬ

Интегрировать Stripe для приема платежей от немецких B2B клиентов (DSB, агентства) с поддержкой:
- SEPA Direct Debit (главный метод оплаты в Германии)
- Credit Cards (Visa, Mastercard, Amex)
- Немецкие счета (Rechnung) с VAT 19%
- Subscription management
- Customer Portal

---

## 💰 ТАРИФНЫЕ ПЛАНЫ

### План 1: STARTER
**Цена:** €29/месяц (без VAT)  
**Включено:**
- 50 scans/месяц
- 5 mandants
- Basic PDF отчеты
- Email support

**Stripe Price ID:** `price_starter_monthly`

---

### План 2: PROFESSIONAL (⭐ RECOMMENDED)
**Цена:** €79/месяц (без VAT)  
**Включено:**
- 200 scans/месяц
- Unlimited mandants
- White-label PDF отчеты
- Priority email support
- API access

**Stripe Price ID:** `price_professional_monthly`

---

### План 3: ENTERPRISE
**Цена:** €199/месяц (без VAT)  
**Включено:**
- Unlimited scans
- Unlimited mandants
- White-label branding
- Dedicated account manager
- SLA 99.9%
- Custom contract

**Stripe Price ID:** `price_enterprise_monthly`

---

## 🇩🇪 НЕМЕЦКИЕ ТРЕБОВАНИЯ

### 1. VAT (Umsatzsteuer) - 19%
**Важно:** В Германии B2B продажи облагаются 19% VAT.

**Правила:**
- Если клиент - немецкая компания с VAT ID → показываем цену **без VAT**, потом добавляем 19%
- Если клиент - частное лицо → показываем цену **с VAT**
- Если клиент из другой EU страны с valid VAT ID → reverse charge (0% VAT)

**Пример:**
```
Professional Plan:
- Базовая цена: €79
- VAT (19%): €15.01
- ИТОГО: €94.01/месяц
```

---

### 2. Rechnung (Invoice) Requirements
**Обязательные элементы счета по немецкому закону:**

```
Rechnungsnummer: INV-2026-001
Rechnungsdatum: 31.01.2026

VON (Absender):
─────────────────
[Ваша компания]
Musterstraße 123
10115 Berlin, Deutschland
USt-IdNr.: DE123456789
Steuernummer: 12/345/67890

AN (Empfänger):
───────────────
[Kunde]
Kundenstraße 456
80331 München, Deutschland
USt-IdNr.: DE987654321

LEISTUNGSZEITRAUM: 01.02.2026 - 28.02.2026

┌────────────────────────────────────────────┬──────────┬────────┬──────────┐
│ Beschreibung                               │ Menge    │ Preis  │ Gesamt   │
├────────────────────────────────────────────┼──────────┼────────┼──────────┤
│ DSGVO Scanner - Professional Plan          │ 1        │ €79.00 │ €79.00   │
│ Leistungszeitraum: 01.02.2026 - 28.02.2026│          │        │          │
└────────────────────────────────────────────┴──────────┴────────┴──────────┘

Netto-Betrag:                                           €79.00
Umsatzsteuer (19%):                                     €15.01
                                                        ───────
GESAMTBETRAG:                                          €94.01

Zahlungsbedingungen: Sofort fällig
Zahlungsweise: SEPA-Lastschrift

Vielen Dank für Ihr Vertrauen!

Bei Fragen erreichen Sie uns unter: support@dsgvo-scanner.com
```

**Важно:** Rechnung должна быть в PDF формате и отправлена по email сразу после оплаты.

---

### 3. SEPA Direct Debit (Lastschrift)
**Почему critical:** 70% немецких B2B предпочитают SEPA вместо карт.

**Преимущества SEPA:**
- Нет fees для клиента (только вы платите Stripe 0.35€ + 0.8%)
- Привычно для немецких компаний
- Автоматическое списание (не нужно вводить карту каждый раз)

**Недостаток:**
- Первое списание идет 5-7 рабочих дней
- Можно оспорить в течение 8 недель

---

## 🔧 ТЕХНИЧЕСКАЯ РЕАЛИЗАЦИЯ

### Step 1: Stripe Account Setup

1. **Создать Stripe Account:**
   - Перейти на [stripe.com](https://stripe.com/de)
   - Выбрать "Deutschland" как country
   - Заполнить business details (нужен German business address)

2. **Activate Payment Methods:**
   ```bash
   # В Stripe Dashboard
   Settings → Payment methods →
   ✅ Cards (Visa, Mastercard, Amex)
   ✅ SEPA Direct Debit
   ✅ SOFORT (optional, instant bank transfer)
   ```

3. **Tax Settings:**
   ```bash
   Settings → Tax Settings →
   ✅ Enable automatic tax calculation
   ✅ Add default tax rate: 19% (Germany VAT)
   ```

---

### Step 2: Install Dependencies

```bash
npm install stripe @stripe/stripe-js
```

```json
// package.json
{
  "dependencies": {
    "stripe": "^14.0.0",
    "@stripe/stripe-js": "^2.4.0"
  }
}
```

---

### Step 3: Environment Variables

```bash
# .env.local
STRIPE_PUBLIC_KEY=pk_test_51...
STRIPE_SECRET_KEY=sk_test_51...
STRIPE_WEBHOOK_SECRET=whsec_...

# Products
STRIPE_PRICE_STARTER=price_starter_monthly
STRIPE_PRICE_PROFESSIONAL=price_professional_monthly
STRIPE_PRICE_ENTERPRISE=price_enterprise_monthly
```

---

### Step 4: Create Products in Stripe

```bash
# Через Stripe CLI (или Dashboard)

stripe products create \
  --name="DSGVO Scanner - Starter" \
  --description="50 scans/month, 5 mandants"

stripe prices create \
  --product=prod_xxx \
  --currency=eur \
  --unit-amount=2900 \
  --recurring[interval]=month \
  --tax-behavior=exclusive
```

**⚠️ Важно:** `tax-behavior=exclusive` означает, что цена указана БЕЗ VAT (19% добавится автоматически).

---

### Step 5: Stripe Client Setup

```typescript
// lib/stripe/client.ts
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

export const PLANS = {
  starter: {
    priceId: process.env.STRIPE_PRICE_STARTER!,
    name: 'Starter',
    price: 29,
    scans: 50,
    mandants: 5,
  },
  professional: {
    priceId: process.env.STRIPE_PRICE_PROFESSIONAL!,
    name: 'Professional',
    price: 79,
    scans: 200,
    mandants: -1, // unlimited
  },
  enterprise: {
    priceId: process.env.STRIPE_PRICE_ENTERPRISE!,
    name: 'Enterprise',
    price: 199,
    scans: -1, // unlimited
    mandants: -1,
  },
} as const;
```

---

### Step 6: Checkout Session API

```typescript
// app/api/stripe/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stripe, PLANS } from '@/lib/stripe/client';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    const { planId } = body; // 'starter' | 'professional' | 'enterprise'
    
    if (!planId || !(planId in PLANS)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }
    
    const plan = PLANS[planId as keyof typeof PLANS];
    
    // Check if user already has subscription
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();
    
    if (existingSubscription) {
      return NextResponse.json(
        { error: 'Active subscription already exists' },
        { status: 400 }
      );
    }
    
    // Get or create Stripe customer
    let customerId: string;
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();
    
    if (profile?.stripe_customer_id) {
      customerId = profile.stripe_customer_id;
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });
      
      customerId = customer.id;
      
      // Save to database
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }
    
    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card', 'sepa_debit'], // ✅ SEPA!
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      success_url: `${req.headers.get('origin')}/dashboard?success=true`,
      cancel_url: `${req.headers.get('origin')}/pricing?canceled=true`,
      metadata: {
        user_id: user.id,
        plan_id: planId,
      },
      // ✅ Немецкая локализация
      locale: 'de',
      // ✅ Автоматический VAT
      automatic_tax: {
        enabled: true,
      },
      // ✅ Collect VAT ID from business customers
      tax_id_collection: {
        enabled: true,
      },
      // ✅ Billing address collection для Rechnung
      billing_address_collection: 'required',
      // ✅ Allow promotional codes
      allow_promotion_codes: true,
    });
    
    return NextResponse.json({ url: session.url });
    
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

---

### Step 7: Webhook Handler

```typescript
// app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/client';
import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = headers().get('stripe-signature')!;
  
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }
  
  const supabase = await createClient();
  
  // Handle events
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Get subscription
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );
      
      // Save to database
      await supabase.from('subscriptions').insert({
        user_id: session.metadata?.user_id,
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: subscription.id,
        stripe_price_id: subscription.items.data[0].price.id,
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
      });
      
      // ✅ Send welcome email with Rechnung
      await sendInvoiceEmail(subscription, session);
      
      break;
    }
    
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      
      await supabase
        .from('subscriptions')
        .update({
          status: subscription.status,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
        })
        .eq('stripe_subscription_id', subscription.id);
      
      break;
    }
    
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      
      await supabase
        .from('subscriptions')
        .update({ status: 'canceled' })
        .eq('stripe_subscription_id', subscription.id);
      
      break;
    }
    
    case 'invoice.paid': {
      const invoice = event.data.object as Stripe.Invoice;
      
      // ✅ Generate and send Rechnung
      await generateRechnung(invoice);
      
      break;
    }
    
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      
      // ✅ Send payment failed email
      await sendPaymentFailedEmail(invoice);
      
      break;
    }
  }
  
  return NextResponse.json({ received: true });
}
```

---

### Step 8: Customer Portal

```typescript
// app/api/stripe/portal/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/client';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get Stripe customer ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();
    
    if (!profile?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      );
    }
    
    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${req.headers.get('origin')}/dashboard/billing`,
      locale: 'de', // ✅ German
    });
    
    return NextResponse.json({ url: session.url });
    
  } catch (error: any) {
    console.error('Portal error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

---

### Step 9: Frontend Checkout Component

```typescript
// components/pricing-card.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

interface PricingCardProps {
  planId: 'starter' | 'professional' | 'enterprise';
  name: string;
  price: number;
  features: string[];
}

export function PricingCard({ planId, name, price, features }: PricingCardProps) {
  const [loading, setLoading] = useState(false);
  
  const handleCheckout = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });
      
      const { url, error } = await response.json();
      
      if (error) {
        alert(error);
        return;
      }
      
      // Redirect to Stripe Checkout
      window.location.href = url;
      
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Fehler beim Checkout. Bitte versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate price with VAT
  const priceWithVAT = (price * 1.19).toFixed(2);
  
  return (
    <Card className="p-6">
      <h3 className="text-2xl font-bold">{name}</h3>
      
      <div className="mt-4">
        <span className="text-4xl font-bold">€{price}</span>
        <span className="text-gray-500">/Monat</span>
        <p className="text-sm text-gray-500 mt-1">
          zzgl. 19% USt. (€{priceWithVAT} brutto)
        </p>
      </div>
      
      <ul className="mt-6 space-y-2">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center">
            <span className="mr-2">✓</span>
            {feature}
          </li>
        ))}
      </ul>
      
      <Button
        className="w-full mt-6"
        onClick={handleCheckout}
        disabled={loading}
      >
        {loading ? 'Lädt...' : 'Jetzt starten'}
      </Button>
    </Card>
  );
}
```

---

### Step 10: Rechnung Generator

```typescript
// lib/invoice/generator.ts
import PDFDocument from 'pdfkit';
import { stripe } from '@/lib/stripe/client';

interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: Date;
  customerName: string;
  customerAddress: string;
  customerVATId?: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  subtotal: number;
  vat: number;
  total: number;
}

export async function generateRechnung(
  stripeInvoice: Stripe.Invoice
): Promise<Buffer> {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const chunks: Buffer[] = [];
  
  doc.on('data', (chunk) => chunks.push(chunk));
  
  // Header
  doc
    .fontSize(20)
    .text('RECHNUNG', 50, 50);
  
  doc
    .fontSize(10)
    .text(`Rechnungsnummer: ${stripeInvoice.number}`, 50, 80)
    .text(`Rechnungsdatum: ${new Date(stripeInvoice.created * 1000).toLocaleDateString('de-DE')}`, 50, 95);
  
  // Sender
  doc
    .fontSize(10)
    .text('VON:', 50, 130)
    .text('DSGVO Scanner GmbH', 50, 145)
    .text('Musterstraße 123', 50, 160)
    .text('10115 Berlin, Deutschland', 50, 175)
    .text('USt-IdNr.: DE123456789', 50, 190);
  
  // Recipient
  const customer = await stripe.customers.retrieve(stripeInvoice.customer as string);
  
  doc
    .text('AN:', 350, 130)
    .text(customer.name || customer.email, 350, 145)
    .text(customer.address?.line1 || '', 350, 160)
    .text(`${customer.address?.postal_code || ''} ${customer.address?.city || ''}`, 350, 175);
  
  if (customer.tax_ids?.data?.[0]) {
    doc.text(`USt-IdNr.: ${customer.tax_ids.data[0].value}`, 350, 190);
  }
  
  // Line items table
  const tableTop = 250;
  
  doc
    .fontSize(10)
    .text('Beschreibung', 50, tableTop)
    .text('Menge', 300, tableTop)
    .text('Preis', 370, tableTop)
    .text('Gesamt', 470, tableTop);
  
  doc
    .moveTo(50, tableTop + 15)
    .lineTo(550, tableTop + 15)
    .stroke();
  
  let yPosition = tableTop + 25;
  
  for (const line of stripeInvoice.lines.data) {
    doc
      .text(line.description || '', 50, yPosition)
      .text('1', 300, yPosition)
      .text(`€${(line.amount / 100).toFixed(2)}`, 370, yPosition)
      .text(`€${(line.amount / 100).toFixed(2)}`, 470, yPosition);
    
    yPosition += 20;
  }
  
  // Totals
  doc
    .moveTo(50, yPosition)
    .lineTo(550, yPosition)
    .stroke();
  
  yPosition += 20;
  
  const subtotal = stripeInvoice.subtotal / 100;
  const vat = stripeInvoice.tax || 0;
  const total = stripeInvoice.total / 100;
  
  doc
    .text('Netto-Betrag:', 370, yPosition)
    .text(`€${subtotal.toFixed(2)}`, 470, yPosition);
  
  yPosition += 20;
  
  doc
    .text('Umsatzsteuer (19%):', 370, yPosition)
    .text(`€${(vat / 100).toFixed(2)}`, 470, yPosition);
  
  yPosition += 20;
  
  doc
    .fontSize(12)
    .text('GESAMTBETRAG:', 370, yPosition)
    .text(`€${total.toFixed(2)}`, 470, yPosition);
  
  // Payment terms
  yPosition += 40;
  
  doc
    .fontSize(10)
    .text('Zahlungsbedingungen: Sofort fällig', 50, yPosition)
    .text('Zahlungsweise: SEPA-Lastschrift', 50, yPosition + 15);
  
  // Footer
  doc
    .fontSize(8)
    .text('Vielen Dank für Ihr Vertrauen!', 50, 750, { align: 'center' })
    .text('Bei Fragen erreichen Sie uns unter: support@dsgvo-scanner.com', 50, 765, { align: 'center' });
  
  doc.end();
  
  return new Promise((resolve) => {
    doc.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
  });
}
```

---

## 📧 EMAIL NOTIFICATIONS

### Welcome Email with Invoice
```typescript
// lib/email/templates/welcome-invoice.ts
export const welcomeInvoiceTemplate = (data: {
  customerName: string;
  planName: string;
  invoiceUrl: string;
}) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6;">
  <h1>Willkommen bei DSGVO Scanner!</h1>
  
  <p>Hallo ${data.customerName},</p>
  
  <p>vielen Dank für Ihr Vertrauen! Ihr <strong>${data.planName}</strong> Abonnement ist jetzt aktiv.</p>
  
  <p>Ihre Rechnung finden Sie hier: <a href="${data.invoiceUrl}">Rechnung herunterladen</a></p>
  
  <h2>Nächste Schritte:</h2>
  <ol>
    <li>Erstellen Sie Ihren ersten Mandant</li>
    <li>Starten Sie Ihren ersten Scan</li>
    <li>Laden Sie den PDF-Report herunter</li>
  </ol>
  
  <p>Bei Fragen sind wir jederzeit für Sie da: <a href="mailto:support@dsgvo-scanner.com">support@dsgvo-scanner.com</a></p>
  
  <p>Viele Grüße,<br>Ihr DSGVO Scanner Team</p>
</body>
</html>
`;
```

---

## 🧪 TESTING

### Test Cards (Stripe Test Mode):
```
✅ Successful payment:
   4242 4242 4242 4242
   Any future date, any CVC

❌ Declined:
   4000 0000 0000 0002

⏱ Requires authentication (3D Secure):
   4000 0027 6000 3184
```

### Test SEPA:
```
✅ Successful:
   IBAN: DE89370400440532013000

❌ Disputed:
   IBAN: DE62370400440532013001
```

---

## 🚀 DEPLOYMENT CHECKLIST

### Pre-Launch:
- [ ] Stripe account verified (business details)
- [ ] Payment methods activated (Cards + SEPA)
- [ ] Products created in Stripe Dashboard
- [ ] Webhook endpoint configured
- [ ] Tax settings configured (19% VAT)
- [ ] Test all payment flows
- [ ] Generate test Rechnung
- [ ] Email templates ready

### Launch Day:
- [ ] Switch to Live mode (from Test mode)
- [ ] Update environment variables
- [ ] Test with real card (low amount)
- [ ] Monitor Stripe Dashboard for errors
- [ ] Check webhook logs

---

## 💡 BEST PRACTICES

### 1. Handle Payment Failures Gracefully:
```typescript
// Send email when payment fails
async function handlePaymentFailure(subscription: Stripe.Subscription) {
  // Grace period: 3 days
  const gracePeriodEnd = Date.now() + (3 * 24 * 60 * 60 * 1000);
  
  await sendEmail({
    to: customer.email,
    subject: 'Zahlung fehlgeschlagen - DSGVO Scanner',
    body: `
      Ihre Zahlung konnte leider nicht durchgeführt werden.
      Bitte aktualisieren Sie Ihre Zahlungsmethode bis zum ${new Date(gracePeriodEnd).toLocaleDateString('de-DE')}.
      
      [Link zum Customer Portal]
    `
  });
}
```

### 2. Prevent Duplicate Subscriptions:
```typescript
// Always check before creating new subscription
const existingSubscription = await supabase
  .from('subscriptions')
  .select()
  .eq('user_id', userId)
  .eq('status', 'active')
  .single();

if (existingSubscription) {
  throw new Error('Active subscription already exists');
}
```

### 3. Log All Stripe Events:
```typescript
// Audit trail
await supabase.from('stripe_events').insert({
  event_id: event.id,
  event_type: event.type,
  customer_id: event.data.object.customer,
  data: event.data.object,
  created_at: new Date().toISOString(),
});
```

---

## 💰 COSTS & FEES

### Stripe Fees (Germany):
- **Credit Cards:** 1.4% + €0.25 per transaction
- **SEPA Direct Debit:** 0.8% + €0.35 per transaction (⭐ cheaper!)
- **Subscription management:** Free
- **Customer Portal:** Free

**Example calculation (Professional Plan):**
```
Plan price: €79
VAT (19%): €15.01
Total: €94.01

Stripe fee (SEPA): 0.8% + €0.35 = €1.10
Your net revenue: €92.91
```

**Break-even:** 1 customer pays for ~0.85 Stripe fees

---

## 🎯 SUCCESS METRICS

Track these in your analytics:
- Conversion rate (free trial → paid)
- Churn rate (monthly)
- MRR (Monthly Recurring Revenue)
- Average plan (Starter vs Professional vs Enterprise)
- Payment method distribution (Card vs SEPA)
- Failed payment rate

**Target KPIs:**
- Conversion rate: >30%
- Churn rate: <10%
- Failed payments: <5%

---

## 📞 SUPPORT

### For Customers:
- **Email:** support@dsgvo-scanner.com
- **Response time:** <24 hours
- **Languages:** German, English

### For You (Stripe Support):
- **Email:** support@stripe.com
- **Dashboard:** stripe.com/dashboard
- **Docs:** stripe.com/docs

---

**Готово к интеграции! 💳**

Следующий шаг: Создать Stripe account и настроить первый product.

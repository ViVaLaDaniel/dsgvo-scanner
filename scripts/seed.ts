import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function seed() {
  console.log('🌱 Starting seed...');

  const email = 'admin@dsgvo-test.de';
  const password = 'password123';

  // 1. Create User
  console.log(`Creating user: ${email}...`);
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        company_name: 'Demo Agentur GmbH',
        plan: 'professional',
      },
    },
  });

  if (authError) {
    console.log('User creation check:', authError.message);
    // If user exists, try to sign in to get the ID
    if (authError.message.includes('already registered')) {
        console.log('User already exists, signing in...');
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (signInError) {
            console.error('Fatal: Could not sign in existing user:', signInError.message);
            return;
        }
        authData.user = signInData.user as any;
    } else {
        console.error('Fatal auth error:', authError);
        return;
    }
  }

  const userId = authData.user!.id;
  console.log(`User ID: ${userId}`);

  // 2. Wait a bit for the trigger to create the profile (if new)
  await new Promise(r => setTimeout(r, 2000));

  // 3. Create Websites
  console.log('Creating websites...');
  const websites = [
    {
      url: 'https://example-shop.de',
      domain: 'example-shop.de',
      client_name: 'Müller Bäckerei',
      owner_id: userId,
      status: 'active',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
    },
    {
      url: 'https://techno-start.io',
      domain: 'techno-start.io',
      client_name: 'TechnoStart UP',
      owner_id: userId,
      status: 'active',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    },
    {
      url: 'https://law-firm-schmidt.de',
      domain: 'law-firm-schmidt.de',
      client_name: 'Kanzlei Schmidt',
      owner_id: userId,
      status: 'error',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), // 10 days ago
    },
  ];

  for (const site of websites) {
    const { data: siteData, error: siteError } = await supabase
      .from('websites')
      .insert(site)
      .select()
      .single();

    if (siteError) {
      console.error(`Error creating website ${site.domain}:`, siteError.message);
      continue;
    }

    // 4. Create Scans for this website
    console.log(`Creating scans for ${site.domain}...`);
    
    // Create a "completed" scan
    await supabase.from('scans').insert({
      website_id: siteData.id,
      status: 'completed',
      violations_count: site.status === 'error' ? 3 : 0,
      risk_score: site.status === 'error' ? 85 : 10,
      created_at: new Date().toISOString(),
    });
  }

  console.log('✅ Seed completed successfully!');
  console.log('------------------------------------------------');
  console.log('LOGIN DATA:');
  console.log(`Email:    ${email}`);
  console.log(`Password: ${password}`);
  console.log('------------------------------------------------');
}

seed();

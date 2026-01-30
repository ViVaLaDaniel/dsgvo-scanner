const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// You need to add SUPABASE_SERVICE_ROLE_KEY to your .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY is missing in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTesters() {
  const password = 'ScannerTest2026';
  console.log(`Creating 10 testers with password: ${password}`);

  for (let i = 1; i <= 10; i++) {
    const email = `tester${i}@dsgvo-scanner.de`;

    const { data, error } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        company_name: `Test Agency ${i}`,
        plan: 'agency'
      }
    });

    if (error) {
      console.error(`Error creating ${email}:`, error.message);
    } else {
      console.log(`Successfully created: ${email}`);
    }
  }
}

createTesters();

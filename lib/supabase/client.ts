import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase environment variables are missing! Check .env.local or your deployment configuration.')
    // We throw a clear error to be caught by Next.js error boundary or try/catch blocks
    throw new Error('Supabase Client Configuration Error: Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

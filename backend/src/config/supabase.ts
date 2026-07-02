import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// We use the service role key in the backend to bypass RLS for administrative tasks
// like data syncing and cron jobs.
export let supabase: any = null;

if (supabaseUrl && supabaseServiceKey) {
  try {
    console.log('🔧 Initializing Supabase client...');
    // Create client with realtime completely disabled to avoid errors
    supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      realtime: {
        logLevel: 'silent', // Turn off all realtime logs
      }
    });
    console.log('✅ Supabase client initialized successfully!');
  } catch (e: any) {
    console.warn('⚠️ Could not initialize Supabase client:', e.message || e);
    supabase = null;
  }
} else {
  console.warn('⚠️ Missing Supabase credentials, client not initialized');
  console.log('Need both: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
}

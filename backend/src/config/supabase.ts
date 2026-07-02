import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// We use the service role key in the backend to bypass RLS for administrative tasks
// like data syncing and cron jobs.
export let supabase: any = null; // Use 'any' to avoid type errors

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (supabaseUrl && supabaseServiceKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('[Supabase] Client initialized successfully');
  } catch (e) {
    console.warn('[Supabase] Could not initialize client:', e);
    supabase = null;
  }
} else {
  console.warn('[Supabase] Missing credentials, client not initialized');
}

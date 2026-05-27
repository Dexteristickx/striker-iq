import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://mock.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'mock-service-key';

// We use the service role key in the backend to bypass RLS for administrative tasks
// like data syncing and cron jobs.
export const supabase = createClient(supabaseUrl, supabaseServiceKey);

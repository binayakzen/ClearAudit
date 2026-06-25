import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kddfzgtxgiedhbfzxpxg.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_QsdBLMhHKzTQCkDk8VcjEw_jj6gv90J';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


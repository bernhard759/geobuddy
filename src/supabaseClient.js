import { createClient } from '@supabase/supabase-js';

// Url and key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create client    
export const supabase = createClient(supabaseUrl, supabaseAnonKey);


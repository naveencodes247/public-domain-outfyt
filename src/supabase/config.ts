import { createClient } from '@supabase/supabase-js';

const getEnv = (key: string): string => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta && (import.meta as any).env?.[key]) {
      return (import.meta as any).env[key];
    }
  } catch {
    // Ignore error in environments without import.meta
  }
  try {
    if (typeof process !== 'undefined' && process && process.env?.[key]) {
      return process.env[key];
    }
  } catch {
    // Ignore error in environments without process.env
  }
  return '';
};

// Supabase project configuration for OutFyt.co.in
export const SUPABASE_URL = getEnv('VITE_SUPABASE_URL');

export const SUPABASE_ANON_KEY = getEnv('VITE_SUPABASE_ANON_KEY');

export const SUPABASE_STORAGE_BUCKET = getEnv('VITE_SUPABASE_STORAGE_BUCKET');

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

if (!isSupabaseConfigured) {
  throw new Error('Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in the build environment.');
}

// Client-side Supabase client initialized with anon public key only (service role is NEVER exposed to client)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

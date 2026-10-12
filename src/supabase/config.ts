import { createClient } from '@supabase/supabase-js';

const getEnv = (key: string, fallback: string): string => {
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
  return fallback;
};

// Supabase project configuration for OutFyt.co.in
export const SUPABASE_URL = getEnv('VITE_SUPABASE_URL', 'https://mkznvbwpdtxubjwggtfm.supabase.co');

export const SUPABASE_ANON_KEY = getEnv(
  'VITE_SUPABASE_ANON_KEY',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rem52YndwZHR4dWJqd2dndGZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE4MDY0MjcsImV4cCI6MjEwNzM4MjQyN30.AyiGSIuHFL-HHh4U1tndTiIRI2OTa57dpULpx0NKpj4'
);

export const SUPABASE_STORAGE_BUCKET = getEnv('VITE_SUPABASE_STORAGE_BUCKET', 'outfit-media');

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

// Client-side Supabase client initialized with anon public key only (service role is NEVER exposed to client)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://ezadrlmlnocyqztyavqd.supabase.co'; 
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6YWRybG1sbm9jeXF6dHlhdnFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyMzE4NjksImV4cCI6MjA4MTgwNzg2OX0.Kg-vMoT7LMJgGk64CuPP3ZvNgs_f7ZN2xew2VlHizqY';

const isConfigured = SUPABASE_URL && SUPABASE_URL.startsWith('http') && SUPABASE_ANON_KEY.length > 50;

export const supabase = isConfigured 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) 
  : null;

if (!isConfigured) {
  console.warn('⚠️ Supabase 配置缺失。');
}

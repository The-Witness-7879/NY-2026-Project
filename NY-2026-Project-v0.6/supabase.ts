import { createClient } from '@supabase/supabase-js';

// 在本地开发时可以使用硬编码（如你之前的代码），在 Vercel 部署时建议使用环境变量
// Fix: Use type casting to any on import.meta to bypass TypeScript error for accessing 'env' property
const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://ezadrlmlnocyqztyavqd.supabase.co'; 
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6YWRybG1sbm9jeXF6dHlhdnFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyMzE4NjksImV4cCI6MjA4MTgwNzg2OX0.Kg-vMoT7LMJgGk64CuPP3ZvNgs_f7ZN2xew2VlHizqY';

const isConfigured = SUPABASE_URL && SUPABASE_URL.startsWith('http') && SUPABASE_ANON_KEY.length > 50;

export const supabase = isConfigured 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) 
  : null;

if (!isConfigured) {
  console.warn('⚠️ Supabase 配置缺失。部署到 Vercel 时，请在 Dashboard 中添加 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY 环境变量。');
}
// Re-export from the main client to maintain compatibility
export { supabase } from '@/integrations/supabase/client';

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return true; // Always configured in Engleuphoria deployments
};

// Database Types (re-exported for compatibility)
export interface User {
  id: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface Lesson {
  id: string;
  title: string;
  content?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface Homework {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface Payment {
  id: string;
  amount: number;
  status: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}
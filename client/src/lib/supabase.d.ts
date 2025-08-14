declare module './supabase' {
  import { SupabaseClient } from '@supabase/supabase-js';
  
  export const supabase: SupabaseClient;
  export const db: any;
  export const app: any;
}

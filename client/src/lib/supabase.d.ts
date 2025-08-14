declare module './supabase' {
  import { SupabaseClient } from '@supabase/supabase-js';
  
  export const supabase: SupabaseClient;
  export const supabaseClient: SupabaseClient;
  export const db: any;
  export const auth: any;
  export const app: any;
  export default supabase;
}

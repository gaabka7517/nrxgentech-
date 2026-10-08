import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_SUPABASE_URL = 'nexgen_supabase_url';
const STORAGE_KEY_SUPABASE_ANON_KEY = 'nexgen_supabase_anon_key';

export function getStoredSupabaseConfig() {
  const envUrl =
    import.meta.env.VITE_SUPABASE_URL ||
    'https://sysvwhhltlokppdtdmbl.supabase.co';
  const envKey =
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    'sb_publishable_KPCyTRtOaf2eX1FfHIiqrg_jlwOZS8o';

  const localUrl = localStorage.getItem(STORAGE_KEY_SUPABASE_URL);
  const localKey = localStorage.getItem(STORAGE_KEY_SUPABASE_ANON_KEY);

  const url = (localUrl !== null && localUrl.trim() !== '') ? localUrl.trim() : envUrl.trim();
  const anonKey = (localKey !== null && localKey.trim() !== '') ? localKey.trim() : envKey.trim();

  return { url, anonKey, isConfigured: Boolean(url && anonKey && url.startsWith('http')) };
}

export function saveStoredSupabaseConfig(url: string, anonKey: string) {
  if (url) {
    localStorage.setItem(STORAGE_KEY_SUPABASE_URL, url.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY_SUPABASE_URL);
  }

  if (anonKey) {
    localStorage.setItem(STORAGE_KEY_SUPABASE_ANON_KEY, anonKey.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY_SUPABASE_ANON_KEY);
  }

  reinitSupabaseClient();
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!supabaseInstance) {
    const { url, anonKey, isConfigured } = getStoredSupabaseConfig();
    if (isConfigured) {
      try {
        supabaseInstance = createClient(url, anonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
          },
        });
      } catch (err) {
        console.warn('Failed to initialize Supabase client:', err);
        supabaseInstance = null;
      }
    }
  }
  return supabaseInstance;
}

export function reinitSupabaseClient() {
  supabaseInstance = null;
  return getSupabase();
}

export async function testSupabaseConnection(urlToTest?: string, keyToTest?: string): Promise<{ success: boolean; message: string }> {
  try {
    const url = urlToTest ?? getStoredSupabaseConfig().url;
    const key = keyToTest ?? getStoredSupabaseConfig().anonKey;

    if (!url || !key) {
      return { success: false, message: 'Supabase URL and Anon Key are required.' };
    }

    const testClient = createClient(url, key);
    const { error } = await testClient.from('courses').select('id').limit(1);

    if (error) {
      // If table doesn't exist yet, it's connected to Supabase project, but needs schema
      if (error.code === '42P01') {
        return {
          success: true,
          message: 'Connected to Supabase project! Please run the SQL schema in supabase/schema.sql to create tables.',
        };
      }
      return { success: false, message: `Supabase Error: ${error.message}` };
    }

    return { success: true, message: 'Successfully connected to Supabase database!' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Failed to connect to Supabase.' };
  }
}

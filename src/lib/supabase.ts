import { createClient } from '@supabase/supabase-js'

// Default demo values
const defaultSupabaseUrl = 'https://your-project.supabase.co'
const defaultSupabaseAnonKey = 'your-anon-key'
const defaultSupabaseServiceKey = 'your-service-key'

// Function to get credentials from localStorage or use defaults
export function getSupabaseCredentials() {
  if (typeof window === 'undefined') {
    return { 
      url: defaultSupabaseUrl, 
      anonKey: defaultSupabaseAnonKey,
      serviceKey: defaultSupabaseServiceKey
    }
  }
  
  const url = localStorage.getItem('supabase-url') || defaultSupabaseUrl
  const anonKey = localStorage.getItem('supabase-anon-key') || defaultSupabaseAnonKey
  const serviceKey = localStorage.getItem('supabase-service-key') || defaultSupabaseServiceKey
  
  return { url, anonKey, serviceKey }
}

// Function to get legacy key for backwards compatibility
export function getLegacyKey() {
  if (typeof window === 'undefined') {
    return defaultSupabaseAnonKey
  }
  return localStorage.getItem('supabase-key') || defaultSupabaseAnonKey
}

// Function to create Supabase client with anon key (default)
export function createSupabaseClient(useServiceKey = false) {
  const { url, anonKey, serviceKey } = getSupabaseCredentials()
  const key = useServiceKey ? serviceKey : anonKey
  return createClient(url, key)
}

// Function to create admin client with service key
export function createSupabaseAdminClient() {
  const { url, serviceKey } = getSupabaseCredentials()
  return createClient(url, serviceKey)
}

// Check if service key is available
export function hasServiceKey() {
  if (typeof window === 'undefined') return false
  const serviceKey = localStorage.getItem('supabase-service-key')
  return !!(serviceKey && serviceKey !== defaultSupabaseServiceKey)
}

// Default export for immediate use (using anon key)
export const supabase = createSupabaseClient() 
import { createClient } from '@supabase/supabase-js'

// Default demo values
const defaultSupabaseUrl = 'https://your-project.supabase.co'
const defaultSupabaseAnonKey = 'your-anon-key'
const defaultSupabaseServiceKey = 'your-service-key'

export type SupabaseKeyMode = 'legacy' | 'new'

export function getKeyMode(): SupabaseKeyMode {
  if (typeof window === 'undefined') return 'legacy'
  const mode = localStorage.getItem('supabase-key-mode')
  return mode === 'new' || mode === 'legacy' ? (mode as SupabaseKeyMode) : 'legacy'
}

export function getSupabaseCredentials() {
  if (typeof window === 'undefined') {
    return { 
      url: defaultSupabaseUrl, 
      anonKey: defaultSupabaseAnonKey,
      serviceKey: defaultSupabaseServiceKey
    }
  }

  const url = localStorage.getItem('supabase-url') || defaultSupabaseUrl
  const mode = getKeyMode()
  if (mode === 'new') {
    const publishableKey = localStorage.getItem('supabase-publishable-key') || defaultSupabaseAnonKey
    const secretKey = localStorage.getItem('supabase-secret-key') || defaultSupabaseServiceKey
    return { url, anonKey: publishableKey, serviceKey: secretKey }
  }
  const anonKey = localStorage.getItem('supabase-anon-key') || defaultSupabaseAnonKey
  const serviceKey = localStorage.getItem('supabase-service-key') || defaultSupabaseServiceKey
  
  return { url, anonKey, serviceKey }
}

export function getLegacyKey() {
  if (typeof window === 'undefined') {
    return defaultSupabaseAnonKey
  }
  return localStorage.getItem('supabase-key') || defaultSupabaseAnonKey
}

export function createSupabaseClient(useServiceKey = false) {
  const { url, anonKey, serviceKey } = getSupabaseCredentials()
  const key = useServiceKey ? serviceKey : anonKey
  return createClient(url, key)
}

export function createSupabaseAdminClient() {
  const { url, serviceKey } = getSupabaseCredentials()
  return createClient(url, serviceKey)
}

export function createSupabaseAnonClient() {
  const { url, anonKey } = getSupabaseCredentials()
  return createClient(url, anonKey)
}

export function hasServiceKey() {
  if (typeof window === 'undefined') return false
  const mode = getKeyMode()
  const key = mode === 'new'
    ? localStorage.getItem('supabase-secret-key')
    : localStorage.getItem('supabase-service-key')
  return !!(key && key !== defaultSupabaseServiceKey)
}

export function hasAnonKey() {
  if (typeof window === 'undefined') return false
  const mode = getKeyMode()
  const key = mode === 'new'
    ? localStorage.getItem('supabase-publishable-key')
    : localStorage.getItem('supabase-anon-key')
  return !!(key && key !== defaultSupabaseAnonKey)
}

export const supabase = createSupabaseClient() 
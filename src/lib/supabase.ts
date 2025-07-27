import { createClient } from '@supabase/supabase-js'

// Default demo values
const defaultSupabaseUrl = 'https://your-project.supabase.co'
const defaultSupabaseKey = 'your-anon-key'

// Function to get credentials from localStorage or use defaults
export function getSupabaseCredentials() {
  if (typeof window === 'undefined') {
    return { url: defaultSupabaseUrl, key: defaultSupabaseKey }
  }
  
  const url = localStorage.getItem('supabase-url') || defaultSupabaseUrl
  const key = localStorage.getItem('supabase-key') || defaultSupabaseKey
  
  return { url, key }
}

// Function to create Supabase client with current credentials
export function createSupabaseClient() {
  const { url, key } = getSupabaseCredentials()
  return createClient(url, key)
}

// Default export for immediate use
export const supabase = createSupabaseClient() 
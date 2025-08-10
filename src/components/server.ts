'use server'

import { createClient } from '@supabase/supabase-js'

type SupabaseCredentials = {
  url: string
  anonKey: string
  serviceKey: string
}

export const executeQueryServerAction = async (
  queryCode: string,
  useServiceKey: boolean,
  credentials: SupabaseCredentials
) => {
  const key = useServiceKey ? credentials.serviceKey : credentials.anonKey
  const supabaseClient = createClient(credentials.url, key)
  // Normalize the incoming code similar to client-side execution
  let code = queryCode.trim()
  if (code.startsWith('await ')) {
    code = code.substring(6)
  }
  if (code.startsWith('supabase')) {
    code = code.substring(8)
  }

  // Execute the built query against the server-side client and return the result
  // eslint-disable-next-line no-eval
  const result = await eval(`supabaseClient${code}`)
  return result
}

export const executeRpcServerAction = async (
  rpcCode: string,
  useServiceKey: boolean,
  credentials: SupabaseCredentials
) => {
  const key = useServiceKey ? credentials.serviceKey : credentials.anonKey
  const supabaseClient = createClient(credentials.url, key)
  const result = await supabaseClient.rpc(rpcCode)
  return result
}

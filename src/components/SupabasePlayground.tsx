"use client"

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { createSupabaseClient, supabase } from '@/lib/supabase'
import SupabaseSettingsDialog from '@/components/SupabaseSettingsDialog'
import SupabaseImpersonateDialog from '@/components/SupabaseImpersonateDialog'
import { Input } from './ui/input'
import { Braces, DatabaseZap, Loader2, Play, SquareFunction } from 'lucide-react'

export default function SupabasePlayground() {
  const [queryCode, setQueryCode] = useState('')
  
  const [rpcCode, setRpcCode] = useState('')
  
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // useEffect(() => {
  //   const updateCurrentUser = async() => {
  //     const { data: { session } } = await supabase.auth.getSession()
  //     setCurrentUser(session?.user || null)
  //   }
    
  //   // Initial session check
  //   updateCurrentUser()
    
  //   // Listen for auth state changes
  //   const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
  //     setCurrentUser(session?.user || null)
  //   })
    
  //   return () => subscription.unsubscribe()
  // }, [])

  const handleCredentialsChange = () => {
    setResults(null)
    setError(null)
  }

  const handleImpersonationChange = () => {
    setResults(null)
    setError(null)
  }

  const executeQuery = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Create a fresh Supabase client with current credentials
      const supabase = createSupabaseClient()
      
      // Remove 'await' from the beginning and 'supabase' reference for evaluation
      let code = queryCode.trim()
      if (code.startsWith('await ')) {
        code = code.substring(6)
      }
      if (code.startsWith('supabase')) {
        code = code.substring(8)
      }
      
      // Execute the query
      const result = await eval(`supabase${code}`)
      setResults(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const executeRpc = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Create a fresh Supabase client with current credentials
      const supabase = createSupabaseClient()
      
      // Remove 'await' from the beginning and 'supabase' reference for evaluation
      let code = rpcCode.trim()
      if (code.startsWith('await ')) {
        code = code.substring(6)
      }
      if (code.startsWith('supabase')) {
        code = code.substring(8)
      }

      const result = await eval(`supabase.rpc('${code}')`)
      setResults(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-shrink-0 max-w-4xl mx-auto w-full p-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Supabase JS Playground</h1>
            <p className="text-muted-foreground">
              Test your Supabase queries and RPC calls in real-time
            </p>
          </div>
          <div className="flex items-center gap-2">
            <SupabaseImpersonateDialog onImpersonationChange={handleImpersonationChange} />
            <SupabaseSettingsDialog onCredentialsChange={handleCredentialsChange} />
          </div>
        </div>
      </div>

      {/* Tabs Section - Fixed */}
      <div className="flex-shrink-0 max-w-4xl mx-auto w-full px-6">
        <Tabs defaultValue="query" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="query">
              <Braces className="size-4" />
              <p>Database Query</p>
            </TabsTrigger>
            <TabsTrigger value="rpc">
              <SquareFunction className="size-4" />
              <p>RPC Function</p>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="query" className="space-y-4 mt-4">
            <div>
              <label htmlFor="query-textarea" className="block text-sm font-medium mb-2">
                Supabase JS Query
              </label>
              <Textarea
                id="query-textarea"
                value={queryCode}
                onChange={(e) => setQueryCode(e.target.value)}
                placeholder="Enter your Supabase query here... Example: await supabase.from('characters').select()"
                className="font-mono text-sm min-h-32"
              />
            </div>
            <div className='flex justify-end'>
              <Button 
                onClick={executeQuery} 
                disabled={loading}
                className="w-fit"
              >
                {loading ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
                <p>{loading ? 'Running...' : 'Run Query'}</p>
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="rpc" className="space-y-4 mt-4">
            <div>
              <label htmlFor="rpc-textarea" className="block text-sm font-medium mb-2">
                RPC Function Call
              </label>
              <Input
                id="rpc-textarea"
                value={rpcCode}
                onChange={(e) => setRpcCode(e.target.value)}
                placeholder="Enter your RPC function here..."
                className="font-mono text-sm"
              />
            </div>
            <div className='flex justify-end'>
              <Button 
                onClick={executeRpc} 
                disabled={loading}
                className="w-fit flex items-center gap-2"
              >
                {loading ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
                <p>{loading ? 'Running...' : 'Run RPC'}</p>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="flex-1 max-w-4xl mx-auto w-full p-6 pt-4 flex flex-col min-h-0">
        <div className="border rounded-lg flex flex-col h-full">
          <div className="flex-shrink-0 p-4 border-b">
            <h3 className="text-lg font-semibold flex items-center gap-1">
              <DatabaseZap className="size-4" />
              <p>Results</p>
            </h3>
          </div>
          
          <div className="flex-1 p-4 overflow-auto">
            {loading && (
              <div className="text-muted-foreground">Executing...</div>
            )}
            
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                <div className="text-destructive text-sm font-medium">Error:</div>
                <pre className="text-destructive text-sm mt-1 whitespace-pre-wrap">{error}</pre>
              </div>
            )}
            
            {results && !loading && !error && (
              <div className="bg-muted/50 rounded-md p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium">Response:</div>
                  {results.data && Array.isArray(results.data) && (
                    <div className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-md">
                      {results.data.length} {results.data.length === 1 ? 'result' : 'results'}
                    </div>
                  )}
                  {results.count !== undefined && (
                    <div className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-md">
                      {results.count} {results.count === 1 ? 'result' : 'results'}
                    </div>
                  )}
                </div>
                <pre className="text-sm bg-background p-3 rounded border whitespace-pre-wrap break-words overflow-hidden">
                  {JSON.stringify(results, null, 2)}
                </pre>
              </div>
            )}
            
            {!results && !loading && !error && (
              <div className="text-muted-foreground text-sm">
                Run a query or RPC function to see results here
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 
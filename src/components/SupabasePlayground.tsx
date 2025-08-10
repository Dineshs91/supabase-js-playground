"use client"

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { createSupabaseClient, supabase, hasServiceKey, hasAnonKey, getKeyMode, getSupabaseCredentials } from '@/lib/supabase'
import SupabaseSettingsDialog from '@/components/SupabaseSettingsDialog'
import SupabaseImpersonateDialog from '@/components/SupabaseImpersonateDialog'
import { Braces, DatabaseZap, Loader2, Play, SquareFunction, X, Key, ShieldCheck } from 'lucide-react'
import { useHotkeys } from 'react-hotkeys-hook';
import { executeQueryServerAction, executeRpcServerAction } from './server'

// Dynamically import ReactJsonView to avoid SSR issues
const ReactJsonView = dynamic(() => import('@microlink/react-json-view'), {
  ssr: false,
  loading: () => <div className="text-muted-foreground text-sm">Loading JSON viewer...</div>
})

export default function SupabasePlayground() {
  const [queryCode, setQueryCode] = useState('')
  
  const [rpcCode, setRpcCode] = useState('')
  
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [useServiceKey, setUseServiceKey] = useState(false)
  const [serviceKeyAvailable, setServiceKeyAvailable] = useState(false)
  const [anonKeyAvailable, setAnonKeyAvailable] = useState(false)
  const [isImpersonating, setIsImpersonating] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [activeTab, setActiveTab] = useState('query')
  const [keyMode, setKeyMode] = useState<'legacy' | 'new'>(typeof window === 'undefined' ? 'legacy' : getKeyMode())

  useEffect(() => {
    setIsClient(true)

    const checkKeyAvailability = () => {
      setServiceKeyAvailable(hasServiceKey())
      setAnonKeyAvailable(hasAnonKey())
      setKeyMode(getKeyMode())
    }
    
    const checkImpersonationStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsImpersonating(!!session?.user)
    }
    
    checkKeyAvailability()
    checkImpersonationStatus()
    
    // Listen for auth state changes to detect impersonation
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsImpersonating(!!session?.user)
    })
    
    return () => subscription.unsubscribe()
  }, [])

  const shouldShowKeyToggle = serviceKeyAvailable && anonKeyAvailable && !isImpersonating

  const handleCredentialsChange = () => {
    setResults(null)
    setError(null)
    setServiceKeyAvailable(hasServiceKey())
    setAnonKeyAvailable(hasAnonKey())
    setKeyMode(getKeyMode())
  }

  const handleImpersonationChange = () => {
    setResults(null)
    setError(null)
  }

  const clearResults = () => {
    setResults(null)
    setError(null)
  }

  const executeQuery = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const supabaseClient = createSupabaseClient(useServiceKey)
      
      // Remove 'await' from the beginning and 'supabase' reference for evaluation
      let code = queryCode.trim()
      if (code.startsWith('await ')) {
        code = code.substring(6)
      }
      if (code.startsWith('supabase')) {
        code = code.substring(8)
      }
      
      // Execute the query
      const result = await eval(`supabaseClient${code}`)
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
      const supabaseClient = createSupabaseClient(useServiceKey)
      
      // Remove 'await' from the beginning and 'supabase' reference for evaluation
      let code = rpcCode.trim()
      if (code.startsWith('await ')) {
        code = code.substring(6)
      }
      if (code.startsWith('supabase')) {
        code = code.substring(8)
      }

      const result = await eval(`supabaseClient.rpc('${code}')`)
      setResults(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const runQuery = async () => {
    if (keyMode === 'legacy') {
      executeQuery()
    } else {
      setLoading(true)
      setError(null)
      try {
        const result = await executeQueryServerAction(
          queryCode,
          useServiceKey,
          getSupabaseCredentials()
        )
        setResults(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }
  }

  const runRpc = async () => {
    if (keyMode === 'legacy') {
      executeRpc()
    } else {
      setLoading(true)
      setError(null)
      try {
        const result = await executeRpcServerAction(
          rpcCode,
          useServiceKey,
          getSupabaseCredentials()
        )
        setResults(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }
  }

  // Add keyboard shortcuts for cmd/ctrl + enter
  useHotkeys('meta+enter, ctrl+enter', (event) => {
    event.preventDefault()
    if (loading) return // Don't execute if already loading

    console.log('keyMode', keyMode)

    if (activeTab === 'query') {
      runQuery()
    } else if (activeTab === 'rpc') {
      runRpc()
    }
  }, {
    enableOnFormTags: ['textarea']
  }, [activeTab, queryCode, rpcCode, useServiceKey, loading])

  return (
    <main className='h-screen py-4 flex flex-col'>
      <div className="w-full px-6 flex-shrink-0">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-0">
          <div>
            <h1 className='text-sm'><span className='text-xl font-bold'>Supabase</span> <span className='text-[#3fcf8e] font-bold text-xs'>JS Playground</span></h1>
            <p className="text-muted-foreground text-sm">
              Test your Supabase queries and RPC calls in real-time
            </p>
            <a className='w-fit mt-1 block' href="https://github.com/Dineshs91/supabase-js-playground" target="_blank">
              <svg className='size-4' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><g fill="#181616"><path fillRule="evenodd" clipRule="evenodd" d="M64 5.103c-33.347 0-60.388 27.035-60.388 60.388 0 26.682 17.303 49.317 41.297 57.303 3.017.56 4.125-1.31 4.125-2.905 0-1.44-.056-6.197-.082-11.243-16.8 3.653-20.345-7.125-20.345-7.125-2.747-6.98-6.705-8.836-6.705-8.836-5.48-3.748.413-3.67.413-3.67 6.063.425 9.257 6.223 9.257 6.223 5.386 9.23 14.127 6.562 17.573 5.02.542-3.903 2.107-6.568 3.834-8.076-13.413-1.525-27.514-6.704-27.514-29.843 0-6.593 2.36-11.98 6.223-16.21-.628-1.52-2.695-7.662.584-15.98 0 0 5.07-1.623 16.61 6.19C53.7 35 58.867 34.327 64 34.304c5.13.023 10.3.694 15.127 2.033 11.526-7.813 16.59-6.19 16.59-6.19 3.287 8.317 1.22 14.46.593 15.98 3.872 4.23 6.215 9.617 6.215 16.21 0 23.194-14.127 28.3-27.574 29.796 2.167 1.874 4.097 5.55 4.097 11.183 0 8.08-.07 14.583-.07 16.572 0 1.607 1.088 3.49 4.148 2.897 23.98-7.994 41.263-30.622 41.263-57.294C124.388 32.14 97.35 5.104 64 5.104z"/><path d="M26.484 91.806c-.133.3-.605.39-1.035.185-.44-.196-.685-.605-.543-.906.13-.31.603-.395 1.04-.188.44.197.69.61.537.91zm2.446 2.729c-.287.267-.85.143-1.232-.28-.396-.42-.47-.983-.177-1.254.298-.266.844-.14 1.24.28.394.426.472.984.17 1.255zM31.312 98.012c-.37.258-.976.017-1.35-.52-.37-.538-.37-1.183.01-1.44.373-.258.97-.025 1.35.507.368.545.368 1.19-.01 1.452zm3.261 3.361c-.33.365-1.036.267-1.552-.23-.527-.487-.674-1.18-.343-1.544.336-.366 1.045-.264 1.564.23.527.486.686 1.18.333 1.543zm4.5 1.951c-.147.473-.825.688-1.51.486-.683-.207-1.13-.76-.99-1.238.14-.477.823-.7 1.512-.485.683.206 1.13.756.988 1.237zm4.943.361c.017.498-.563.91-1.28.92-.723.017-1.308-.387-1.315-.877 0-.503.568-.91 1.29-.924.717-.013 1.306.387 1.306.88zm4.598-.782c.086.485-.413.984-1.126 1.117-.7.13-1.35-.172-1.44-.653-.086-.498.422-.997 1.122-1.126.714-.123 1.354.17 1.444.663zm0 0"/></g></svg>
            </a>
          </div>
          <div className="flex items-center gap-2">
            <SupabaseImpersonateDialog onImpersonationChange={handleImpersonationChange} />
            <SupabaseSettingsDialog onCredentialsChange={handleCredentialsChange} />
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col max-w-5xl lg:max-w-screen mx-6 border shadow-xs rounded-lg my-4 overflow-hidden">
        <section className='flex flex-col lg:flex-row divide-y lg:divide-x lg:divide-y-0 h-full'>
          <div className='w-full px-6 lg:w-1/2 py-4'>
            <Tabs defaultValue="query" value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                    <span className="text-muted-foreground text-xs ml-2">(⌘+Enter to run)</span>
                  </label>
                  <Textarea
                    id="query-textarea"
                    value={queryCode}
                    onChange={(e) => setQueryCode(e.target.value)}
                    placeholder="Enter your Supabase query here... Example: await supabase.from('characters').select()"
                    className="font-mono text-sm placeholder:text-xs min-h-16 lg:min-h-32 text-gray-800"
                  />
                </div>
                <div className='flex justify-end items-center gap-4'>
                  {shouldShowKeyToggle && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 text-xs">
                          <Key className="size-3" />
                          <span>{keyMode === 'legacy' ? 'Anon' : 'Publishable'}</span>
                        </div>
                        <Switch
                          checked={useServiceKey}
                          onCheckedChange={setUseServiceKey}
                        />
                        <div className="flex items-center gap-1.5 text-xs">
                          <ShieldCheck className="size-3" />
                          <span>{keyMode === 'legacy' ? 'Service' : 'Secret'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <Button 
                    onClick={runQuery} 
                    disabled={loading}
                    className="w-32"
                    size="sm"
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
                    <span className="text-muted-foreground text-xs ml-2">(⌘+Enter to run)</span>
                  </label>
                  <Textarea
                    id="rpc-textarea"
                    value={rpcCode}
                    onChange={(e) => setRpcCode(e.target.value)}
                    placeholder="Enter your RPC function name here... Example: get_user_profile"
                    className="font-mono text-sm placeholder:text-xs h-16 lg:h-32 text-gray-800"
                  />
                </div>
                <div className='flex justify-end items-center gap-4'>
                  {shouldShowKeyToggle && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 text-xs">
                          <Key className="size-3" />
                          <span>{keyMode === 'legacy' ? 'Anon' : 'Publishable'}</span>
                        </div>
                        <Switch
                          checked={useServiceKey}
                          onCheckedChange={setUseServiceKey}
                        />
                        <div className="flex items-center gap-1.5 text-xs">
                          <ShieldCheck className="size-3" />
                          <span>{keyMode === 'legacy' ? 'Service' : 'Secret'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <Button 
                    onClick={runRpc} 
                    disabled={loading}
                    className="w-32 flex items-center gap-2"
                    size="sm"
                  >
                    {loading ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
                    <p>{loading ? 'Running...' : 'Run RPC'}</p>
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div 
            className="w-full bg-stone-50/20 px-4 lg:pt-0 flex flex-col lg:w-1/2"
            style={{
              backgroundImage: 'repeating-linear-gradient(-50deg, transparent, transparent 7px, rgba(0,0,0,0.04) 7px, rgba(0,0,0,0.04) 8px)'
            }}
          >
            <div className="border rounded-lg flex flex-col my-2 lg:my-4 h-[38vh] lg:h-[78vh] bg-white">
              <div className="flex-shrink-0 px-4 py-2 border-b shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold flex items-center gap-1">
                    <DatabaseZap className="size-4" />
                    <p>Results</p>
                  </h3>
                  {(results || error) && (
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={clearResults}
                      className="flex items-center gap-1"
                    >
                      <X className="size-3" />
                      Clear
                    </Button>
                  )}
                </div>
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
                    <div className="flex items-center justify-end mb-2">
                      {results.data && Array.isArray(results.data) && (
                        <div className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-md">
                          {results.data.length} {results.data.length === 1 ? 'result' : 'results'}
                        </div>
                      )}
                    </div>
                    {isClient && <ReactJsonView 
                      src={results}
                      quotesOnKeys={false}
                      displayArrayKey={false}
                      displayObjectSize={false}
                      displayDataTypes={false}
                      enableClipboard={false}
                    />}
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
        </section>
      </div>
    </main>
  )
} 
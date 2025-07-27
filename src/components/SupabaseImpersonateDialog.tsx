"use client"

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { UserRoundCog, AlertTriangle } from 'lucide-react'
import { createSupabaseAdminClient, supabase, hasServiceKey } from '@/lib/supabase'

interface SupabaseImpersonateDialogProps {
  onImpersonationChange: (userEmail?: string) => void
}

export default function SupabaseImpersonateDialog({ onImpersonationChange }: SupabaseImpersonateDialogProps) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [impersonatedUserFromSession, setImpersonatedUserFromSession] = useState<any>(null)
  const [serviceKeyAvailable, setServiceKeyAvailable] = useState(false)

  useEffect(() => {
    const updateUser = async() => {
      const { data: { session } } = await supabase.auth.getSession()
      console.log("Session: ", session)
      setImpersonatedUserFromSession(session?.user || null)
    }

    updateUser()
    setServiceKeyAvailable(hasServiceKey())

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setImpersonatedUserFromSession(session?.user || null)
    })
    
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    // Update service key availability when dialog opens
    if (open) {
      setServiceKeyAvailable(hasServiceKey())
    }
  }, [open])

  const handleImpersonate = async () => {
    if (!email) return
    
    if (!serviceKeyAvailable) {
      setError('Service key is required for user impersonation. Please configure your service key in the settings.')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const supabaseAdmin = createSupabaseAdminClient()
      
      // Step 1: Generate a magic link for the user
      const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: email.trim(),
        options: {
          redirectTo: window.location.origin
        }
      })
      
      if (linkError) {
        throw new Error(`Failed to generate link: ${linkError.message}`)
      }
      
      if (!linkData.properties?.action_link) {
        throw new Error('No action link generated')
      }
      
      // Step 2: Extract the token from the generated link
      const url = new URL(linkData.properties.action_link)
      const token = url.searchParams.get('token')
      const type = url.searchParams.get('type')
      
      if (!token || !type) {
        throw new Error('Invalid token or type from generated link')
      }
      
      // Step 3: Verify the OTP to get the session
      const { data: authData, error: authError } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: type as any
      })
      
      if (authError) {
        throw new Error(`Failed to verify OTP: ${authError.message}`)
      }
      
      if (!authData.user || !authData.session) {
        throw new Error('No user or session returned from verification')
      }
      
      // Step 4: Set the session for the impersonated user
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token
      })
      
      if (sessionError) {
        throw new Error(`Failed to set session: ${sessionError.message}`)
      }
      
      // Notify parent component
      onImpersonationChange(email)
      
      setOpen(false)
      
    } catch (err) {
      console.error('Impersonation error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred during impersonation')
    } finally {
      setLoading(false)
    }
  }

  const handleStopImpersonation = async () => {
    try {
      await supabase.auth.signOut()
      setImpersonatedUserFromSession(null)
      onImpersonationChange()
    } catch (err) {
      console.error('Error stopping impersonation:', err)
      setError(err instanceof Error ? err.message : 'Failed to stop impersonation')
    }
  }

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      setEmail('')
      setError(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          variant={impersonatedUserFromSession ? "default" : "outline"} 
          size="sm"
          className={impersonatedUserFromSession ? "bg-orange-600 hover:bg-orange-700" : ""}
        >
          <UserRoundCog className="h-4 w-4 mr-2" />
          {impersonatedUserFromSession ? `Impersonating: ${impersonatedUserFromSession.email}` : 'Impersonate User'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {impersonatedUserFromSession ? 'User Impersonation Active' : 'Impersonate User'}
          </DialogTitle>
          <DialogDescription>
            {impersonatedUserFromSession 
              ? `You are currently impersonating ${impersonatedUserFromSession.email}. You can stop the impersonation or switch to a different user.`
              : 'Enter the email address of the user you want to impersonate. This will use admin privileges to generate a session for that user.'
            }
          </DialogDescription>
        </DialogHeader>
        
        {/* Service Key Warning */}
        {!serviceKeyAvailable && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800">
                <div className="font-medium">Service Key Required</div>
                <div className="text-amber-700 mt-1">
                  You need to configure a Supabase service key in the settings to use impersonation features.
                </div>
              </div>
            </div>
          </div>
        )}
        
        {impersonatedUserFromSession ? (
          <div className="grid gap-4 py-4">
            <div className="bg-orange-50 border border-orange-200 rounded-md p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-orange-900">Currently Impersonating</div>
                  <div className="text-sm text-orange-700 font-mono">{impersonatedUserFromSession.email}</div>
                </div>
                <UserRoundCog className="h-5 w-5 text-orange-600" />
              </div>
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="impersonate-email" className="text-sm font-medium">
                Or switch to another user:
              </label>
              <Input
                id="impersonate-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="font-mono text-sm"
                disabled={loading || !serviceKeyAvailable}
              />
            </div>
            
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                <div className="text-destructive text-sm font-medium">Error:</div>
                <div className="text-destructive text-sm mt-1">{error}</div>
              </div>
            )}
          </div>
        ) : (
          // Show impersonation form
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="impersonate-email" className="text-sm font-medium">
                Email Address
              </label>
              <Input
                id="impersonate-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="font-mono text-sm"
                disabled={loading || !serviceKeyAvailable}
              />
            </div>
            
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                <div className="text-destructive text-sm font-medium">Error:</div>
                <div className="text-destructive text-sm mt-1">{error}</div>
              </div>
            )}
          </div>
        )}
        
        <DialogFooter className="gap-2">
          {impersonatedUserFromSession && (
            <Button
              variant="outline"
              onClick={() => {
                handleStopImpersonation()
                setOpen(false)
              }}
              className="text-orange-600 hover:text-orange-700 border-orange-200 hover:bg-orange-50"
            >
              Stop Impersonation
            </Button>
          )}
          
          {(!impersonatedUserFromSession || email) && (
            <Button
              type="submit"
              onClick={handleImpersonate}
              disabled={!email || loading || !serviceKeyAvailable}
            >
              {loading ? 'Impersonating...' : impersonatedUserFromSession ? 'Switch User' : 'Impersonate User'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 
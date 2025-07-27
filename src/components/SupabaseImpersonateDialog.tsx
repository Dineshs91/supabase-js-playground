"use client"

import { useState } from 'react'
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
import { UserRoundCog } from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase'

interface SupabaseImpersonateDialogProps {
  onImpersonationChange: (userEmail?: string) => void
}

export default function SupabaseImpersonateDialog({ onImpersonationChange }: SupabaseImpersonateDialogProps) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [impersonatedUser, setImpersonatedUser] = useState<string | null>(null)

  const handleImpersonate = async () => {
    if (!email) return
    
    setLoading(true)
    setError(null)
    
    try {
      const supabase = createSupabaseClient()
      
      // Step 1: Generate a magic link for the user
      const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
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
      
      // Store the impersonated user info
      setImpersonatedUser(email)
      
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
      const supabase = createSupabaseClient()
      await supabase.auth.signOut()
      setImpersonatedUser(null)
      onImpersonationChange()
    } catch (err) {
      console.error('Error stopping impersonation:', err)
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
          variant={impersonatedUser ? "default" : "outline"} 
          size="sm"
          className={impersonatedUser ? "bg-orange-600 hover:bg-orange-700" : ""}
        >
          <UserRoundCog className="h-4 w-4 mr-2" />
          {impersonatedUser ? `Impersonating: ${impersonatedUser}` : 'Impersonate User'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {impersonatedUser ? 'User Impersonation Active' : 'Impersonate User'}
          </DialogTitle>
          <DialogDescription>
            {impersonatedUser 
              ? `You are currently impersonating ${impersonatedUser}. You can stop the impersonation or switch to a different user.`
              : 'Enter the email address of the user you want to impersonate. This will use admin privileges to generate a session for that user.'
            }
          </DialogDescription>
        </DialogHeader>
        
        {impersonatedUser ? (
          // Show current impersonation status and stop button
          <div className="grid gap-4 py-4">
            <div className="bg-orange-50 border border-orange-200 rounded-md p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-orange-900">Currently Impersonating</div>
                  <div className="text-sm text-orange-700 font-mono">{impersonatedUser}</div>
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
                disabled={loading}
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
                disabled={loading}
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
          {impersonatedUser && (
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
          
          {(!impersonatedUser || email) && (
            <Button
              type="submit"
              onClick={handleImpersonate}
              disabled={!email || loading}
            >
              {loading ? 'Impersonating...' : impersonatedUser ? 'Switch User' : 'Impersonate User'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 
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
import { Settings, Trash2, Info, Eye, EyeOff } from 'lucide-react'

interface SupabaseSettingsDialogProps {
  onCredentialsChange: () => void
}

export default function SupabaseSettingsDialog({ onCredentialsChange }: SupabaseSettingsDialogProps) {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState('')
  const [anonKey, setAnonKey] = useState('')
  const [serviceKey, setServiceKey] = useState('')
  const [hasStoredUrl, setHasStoredUrl] = useState(false)
  const [hasStoredAnonKey, setHasStoredAnonKey] = useState(false)
  const [hasStoredServiceKey, setHasStoredServiceKey] = useState(false)
  const [showAnonKey, setShowAnonKey] = useState(false)
  const [showServiceKey, setShowServiceKey] = useState(false)

  useEffect(() => {
    // Load current credentials when dialog opens
    if (open) {
      // Check if credentials are stored in localStorage
      const storedUrl = localStorage.getItem('supabase-url')
      const storedAnonKey = localStorage.getItem('supabase-anon-key') || localStorage.getItem('supabase-key')
      const storedServiceKey = localStorage.getItem('supabase-service-key')
      
      // Only set values if they exist, otherwise keep empty
      setUrl(storedUrl || '')
      setAnonKey(storedAnonKey || '')
      setServiceKey(storedServiceKey || '')
      
      setHasStoredUrl(!!storedUrl)
      setHasStoredAnonKey(!!storedAnonKey)
      setHasStoredServiceKey(!!storedServiceKey)
    }
  }, [open])

  const handleSave = () => {
    if (url) {
      localStorage.setItem('supabase-url', url)
      setHasStoredUrl(true)
    }
    
    if (anonKey) {
      localStorage.setItem('supabase-anon-key', anonKey)
      // Remove legacy key if it exists
      localStorage.removeItem('supabase-key')
      setHasStoredAnonKey(true)
    }
    
    if (serviceKey) {
      localStorage.setItem('supabase-service-key', serviceKey)
      setHasStoredServiceKey(true)
    }
    
    if (url || anonKey || serviceKey) {
      onCredentialsChange()
      setOpen(false)
    }
  }

  const handleClearAnonKey = () => {
    localStorage.removeItem('supabase-anon-key')
    localStorage.removeItem('supabase-key') // Remove legacy key too
    setAnonKey('')
    setHasStoredAnonKey(false)
    setShowAnonKey(false) // Hide the key when clearing
    onCredentialsChange()
  }

  const handleClearServiceKey = () => {
    localStorage.removeItem('supabase-service-key')
    setServiceKey('')
    setHasStoredServiceKey(false)
    setShowServiceKey(false) // Hide the key when clearing
    onCredentialsChange()
  }

  const handleClearAll = () => {
    localStorage.removeItem('supabase-url')
    localStorage.removeItem('supabase-anon-key')
    localStorage.removeItem('supabase-service-key')
    setUrl('')
    setAnonKey('')
    setServiceKey('')
    setHasStoredUrl(false)
    setHasStoredAnonKey(false)
    setHasStoredServiceKey(false)
    setShowAnonKey(false) // Hide keys when clearing all
    setShowServiceKey(false)
    onCredentialsChange()
  }

  const hasAnyStoredCredentials = hasStoredUrl || hasStoredAnonKey || hasStoredServiceKey

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
          <span className="sr-only">Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Supabase Configuration</DialogTitle>
          <DialogDescription>
            Enter your Supabase project URL and API keys. These will be stored in your browser&apos;s local storage.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* URL Field */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <label htmlFor="supabase-url" className="text-sm font-medium">
                Supabase URL
              </label>
            </div>
            <Input
              id="supabase-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-project.supabase.co"
              className="font-mono text-sm"
            />
          </div>

          {/* Anon Key Field */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <label htmlFor="supabase-anon-key" className="text-sm font-medium">
                Anonymous Key (Public)
              </label>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-full">
                <Input
                  id="supabase-anon-key"
                  type={showAnonKey ? "text" : "password"}
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  placeholder="Your Supabase anonymous key"
                  className="font-mono text-sm pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowAnonKey(!showAnonKey)}
                >
                  {showAnonKey ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {hasStoredAnonKey && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAnonKey}
                  className="text-destructive hover:text-destructive px-2"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Service Key Field */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <label htmlFor="supabase-service-key" className="text-sm font-medium">
                Service Key (Private)
              </label>
            </div>
            <div className="w-full flex items-center gap-2">
              <div className="relative w-full">
                <Input
                  id="supabase-service-key"
                  type={showServiceKey ? "text" : "password"}
                  value={serviceKey}
                  onChange={(e) => setServiceKey(e.target.value)}
                  placeholder="Your Supabase service key (optional)"
                  className="font-mono text-sm pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowServiceKey(!showServiceKey)}
                >
                  {showServiceKey ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {hasStoredServiceKey && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearServiceKey}
                  className="text-destructive hover:text-destructive px-2"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <div className="font-medium">Service Key Required for User Impersonation</div>
                  <div className="text-blue-700 mt-1">
                    The service key is needed to impersonate users using admin privileges. Only provide this if you need impersonation features.
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {hasAnyStoredCredentials && (
            <div className="bg-muted/50 rounded-md p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Stored Credentials</div>
                  <div className="text-xs text-muted-foreground">
                    {hasStoredUrl && 'URL '}
                    {hasStoredAnonKey && 'Anon Key '}
                    {hasStoredServiceKey && 'Service Key '}
                    saved in local storage
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearAll}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Clear All
                </Button>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleSave}
            disabled={!url && !anonKey && !serviceKey}
          >
            Save Configuration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

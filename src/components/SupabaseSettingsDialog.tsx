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
import { Switch } from '@/components/ui/switch'
import { Settings, Trash2, Info, Eye, EyeOff } from 'lucide-react'

interface SupabaseSettingsDialogProps {
  onCredentialsChange: () => void
}

export default function SupabaseSettingsDialog({ onCredentialsChange }: SupabaseSettingsDialogProps) {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState('')
  const [keyMode, setKeyMode] = useState<'legacy' | 'new'>('legacy')
  const [legacyAnonKey, setLegacyAnonKey] = useState('')
  const [legacyServiceKey, setLegacyServiceKey] = useState('')
  const [publishableKey, setPublishableKey] = useState('')
  const [secretKey, setSecretKey] = useState('')
  const [hasStoredUrl, setHasStoredUrl] = useState(false)
  const [hasStoredLegacyAnonKey, setHasStoredLegacyAnonKey] = useState(false)
  const [hasStoredLegacyServiceKey, setHasStoredLegacyServiceKey] = useState(false)
  const [hasStoredPublishableKey, setHasStoredPublishableKey] = useState(false)
  const [hasStoredSecretKey, setHasStoredSecretKey] = useState(false)
  const [showAnonKey, setShowAnonKey] = useState(false)
  const [showServiceKey, setShowServiceKey] = useState(false)

  useEffect(() => {
    // Load current credentials when dialog opens
    if (open) {
      // Check if credentials are stored in localStorage
      const storedUrl = localStorage.getItem('supabase-url')
      const storedLegacyAnon = localStorage.getItem('supabase-anon-key') || localStorage.getItem('supabase-key')
      const storedLegacyService = localStorage.getItem('supabase-service-key')
      const storedPublishable = localStorage.getItem('supabase-publishable-key')
      const storedSecret = localStorage.getItem('supabase-secret-key')
      const storedMode = (localStorage.getItem('supabase-key-mode') as 'legacy' | 'new') || 'legacy'

      // Only set values if they exist, otherwise keep empty
      setUrl(storedUrl || '')
      setLegacyAnonKey(storedLegacyAnon || '')
      setLegacyServiceKey(storedLegacyService || '')
      setPublishableKey(storedPublishable || '')
      setSecretKey(storedSecret || '')
      setKeyMode(storedMode)

      setHasStoredUrl(!!storedUrl)
      setHasStoredLegacyAnonKey(!!storedLegacyAnon)
      setHasStoredLegacyServiceKey(!!storedLegacyService)
      setHasStoredPublishableKey(!!storedPublishable)
      setHasStoredSecretKey(!!storedSecret)
    }
  }, [open])

  const handleSave = () => {
    if (url) {
      localStorage.setItem('supabase-url', url)
      setHasStoredUrl(true)
    }
    
    // persist selected mode
    localStorage.setItem('supabase-key-mode', keyMode)

    if (keyMode === 'legacy') {
      if (legacyAnonKey) {
        localStorage.setItem('supabase-anon-key', legacyAnonKey)
        // Remove older legacy key if it exists
        localStorage.removeItem('supabase-key')
        setHasStoredLegacyAnonKey(true)
      }
      if (legacyServiceKey) {
        localStorage.setItem('supabase-service-key', legacyServiceKey)
        setHasStoredLegacyServiceKey(true)
      }
    } else {
      if (publishableKey) {
        localStorage.setItem('supabase-publishable-key', publishableKey)
        setHasStoredPublishableKey(true)
      }
      if (secretKey) {
        localStorage.setItem('supabase-secret-key', secretKey)
        setHasStoredSecretKey(true)
      }
    }
    
    if (url || legacyAnonKey || legacyServiceKey || publishableKey || secretKey) {
      onCredentialsChange()
      setOpen(false)
    }
  }

  const handleClearAnonKey = () => {
    if (keyMode === 'legacy') {
      localStorage.removeItem('supabase-anon-key')
      localStorage.removeItem('supabase-key') // Remove old legacy key too
      setLegacyAnonKey('')
      setHasStoredLegacyAnonKey(false)
    } else {
      localStorage.removeItem('supabase-publishable-key')
      setPublishableKey('')
      setHasStoredPublishableKey(false)
    }
    setShowAnonKey(false) // Hide the key when clearing
    onCredentialsChange()
  }

  const handleClearServiceKey = () => {
    if (keyMode === 'legacy') {
      localStorage.removeItem('supabase-service-key')
      setLegacyServiceKey('')
      setHasStoredLegacyServiceKey(false)
    } else {
      localStorage.removeItem('supabase-secret-key')
      setSecretKey('')
      setHasStoredSecretKey(false)
    }
    setShowServiceKey(false) // Hide the key when clearing
    onCredentialsChange()
  }

  const handleClearAll = () => {
    localStorage.removeItem('supabase-url')
    localStorage.removeItem('supabase-anon-key')
    localStorage.removeItem('supabase-service-key')
    localStorage.removeItem('supabase-key')
    localStorage.removeItem('supabase-publishable-key')
    localStorage.removeItem('supabase-secret-key')
    localStorage.removeItem('supabase-key-mode')
    setUrl('')
    setLegacyAnonKey('')
    setLegacyServiceKey('')
    setPublishableKey('')
    setSecretKey('')
    setHasStoredUrl(false)
    setHasStoredLegacyAnonKey(false)
    setHasStoredLegacyServiceKey(false)
    setHasStoredPublishableKey(false)
    setHasStoredSecretKey(false)
    setShowAnonKey(false) // Hide keys when clearing all
    setShowServiceKey(false)
    setKeyMode('legacy')
    onCredentialsChange()
  }

  const hasAnyStoredCredentials = hasStoredUrl || hasStoredLegacyAnonKey || hasStoredLegacyServiceKey || hasStoredPublishableKey || hasStoredSecretKey

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
            Enter your Supabase project URL and API keys. Choose between legacy keys (Anon/Service) or new keys (Publishable/Secret). These will be stored in your browser&apos;s local storage.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Key Mode Toggle */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">API Key Type</label>
              <div className="flex items-center gap-2 text-xs">
                <span>Legacy</span>
                <Switch
                  checked={keyMode === 'new'}
                  onCheckedChange={(checked) => {
                    const nextMode = checked ? 'new' : 'legacy'
                    setKeyMode(nextMode)
                    localStorage.setItem('supabase-key-mode', nextMode)
                    onCredentialsChange()
                  }}
                />
                <span>New</span>
              </div>
            </div>
          </div>

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

          {/* Anon/Publishable Key Field */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              {keyMode === 'legacy' ? (
                <label htmlFor="supabase-anon-key" className="text-sm font-medium">Anonymous Key (Public)</label>
              ) : (
                <label htmlFor="supabase-publishable-key" className="text-sm font-medium">Publishable Key (Public)</label>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-full">
                <Input
                  id={keyMode === 'legacy' ? 'supabase-anon-key' : 'supabase-publishable-key'}
                  type={showAnonKey ? "text" : "password"}
                  value={keyMode === 'legacy' ? legacyAnonKey : publishableKey}
                  onChange={(e) => (keyMode === 'legacy' ? setLegacyAnonKey(e.target.value) : setPublishableKey(e.target.value))}
                  placeholder={keyMode === 'legacy' ? 'Your Supabase anonymous key' : 'Your Supabase publishable key'}
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
              {(keyMode === 'legacy' ? hasStoredLegacyAnonKey : hasStoredPublishableKey) && (
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

          {/* Service/Secret Key Field */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              {keyMode === 'legacy' ? (
                <label htmlFor="supabase-service-key" className="text-sm font-medium">Service Key (Private)</label>
              ) : (
                <label htmlFor="supabase-secret-key" className="text-sm font-medium">Secret Key (Private)</label>
              )}
            </div>
            <div className="w-full flex items-center gap-2">
              <div className="relative w-full">
                <Input
                  id={keyMode === 'legacy' ? 'supabase-service-key' : 'supabase-secret-key'}
                  type={showServiceKey ? "text" : "password"}
                  value={keyMode === 'legacy' ? legacyServiceKey : secretKey}
                  onChange={(e) => (keyMode === 'legacy' ? setLegacyServiceKey(e.target.value) : setSecretKey(e.target.value))}
                  placeholder={keyMode === 'legacy' ? 'Your Supabase service key (optional)' : 'Your Supabase secret key (optional)'}
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
              {(keyMode === 'legacy' ? hasStoredLegacyServiceKey : hasStoredSecretKey) && (
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
                  <div className="font-medium">Admin key required for User Impersonation</div>
                  <div className="text-blue-700 mt-1">
                    The service/secret key is needed to impersonate users using admin privileges. Only provide this if you need impersonation features.
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
                    {keyMode === 'legacy' ? (
                      <>
                        {hasStoredLegacyAnonKey && 'Anon Key '}
                        {hasStoredLegacyServiceKey && 'Service Key '}
                      </>
                    ) : (
                      <>
                        {hasStoredPublishableKey && 'Publishable Key '}
                        {hasStoredSecretKey && 'Secret Key '}
                      </>
                    )}
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
            disabled={!url && !(keyMode === 'legacy' ? legacyAnonKey || legacyServiceKey : publishableKey || secretKey)}
          >
            Save Configuration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

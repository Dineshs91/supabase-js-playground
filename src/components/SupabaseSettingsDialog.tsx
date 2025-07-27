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
import { Settings, Trash2 } from 'lucide-react'
import { getSupabaseCredentials } from '@/lib/supabase'

interface SupabaseSettingsDialogProps {
  onCredentialsChange: () => void
}

export default function SupabaseSettingsDialog({ onCredentialsChange }: SupabaseSettingsDialogProps) {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState('')
  const [key, setKey] = useState('')
  const [hasStoredCredentials, setHasStoredCredentials] = useState(false)

  useEffect(() => {
    // Load current credentials when dialog opens
    if (open) {
      const credentials = getSupabaseCredentials()
      setUrl(credentials.url)
      setKey(credentials.key)
      
      // Check if credentials are stored in localStorage
      const storedUrl = localStorage.getItem('supabase-url')
      const storedKey = localStorage.getItem('supabase-key')
      setHasStoredCredentials(!!(storedUrl && storedKey))
    }
  }, [open])

  const handleSave = () => {
    if (url && key) {
      localStorage.setItem('supabase-url', url)
      localStorage.setItem('supabase-key', key)
      onCredentialsChange()
      setOpen(false)
      setHasStoredCredentials(true)
    }
  }

  const handleClear = () => {
    localStorage.removeItem('supabase-url')
    localStorage.removeItem('supabase-key')
    const credentials = getSupabaseCredentials()
    setUrl(credentials.url)
    setKey(credentials.key)
    setHasStoredCredentials(false)
    onCredentialsChange()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
          <span className="sr-only">Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Supabase Configuration</DialogTitle>
          <DialogDescription>
            Enter your Supabase project URL and API key. These will be stored in your browser's local storage.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="supabase-url" className="text-sm font-medium">
              Supabase URL
            </label>
            <Input
              id="supabase-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-project.supabase.co"
              className="font-mono text-sm"
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="supabase-key" className="text-sm font-medium">
              API Key (anon/service key)
            </label>
            <Input
              id="supabase-key"
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Your Supabase API key"
              className="font-mono text-sm"
            />
          </div>
          
          {hasStoredCredentials && (
            <div className="bg-muted/50 rounded-md p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Stored Credentials</div>
                  <div className="text-xs text-muted-foreground">
                    You have saved credentials in local storage
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClear}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleSave}
            disabled={!url || !key}
          >
            Save Configuration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 
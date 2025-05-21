"use client"

import React, { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Lock, Eye, EyeOff, Save, Check } from "lucide-react"
import { toast } from "sonner"

interface ApiKeyInputProps {
  /**
   * Callback function when API key is updated
   */
  onApiKeyChange?: (apiKey: string) => void
  
  /**
   * Class name to apply to the container
   */
  className?: string
}

/**
 * Component for entering and managing the Browser-Use API key
 * Stores the API key in localStorage for persistence
 */
export function ApiKeyInput({ onApiKeyChange, className = "" }: ApiKeyInputProps) {
  // State for the API key value
  const [apiKey, setApiKey] = useState<string>("")
  // State for showing/hiding the API key
  const [showApiKey, setShowApiKey] = useState<boolean>(false)
  // State for saving status
  const [isSaved, setIsSaved] = useState<boolean>(false)

  // Load API key from localStorage on component mount
  useEffect(() => {
    const storedApiKey = localStorage.getItem("browserUseApiKey")
    if (storedApiKey) {
      setApiKey(storedApiKey)
      onApiKeyChange?.(storedApiKey)
      setIsSaved(true)
    }
  }, [onApiKeyChange])

  // Handle changes to the API key input
  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove any leading/trailing whitespace
    const newValue = e.target.value.trim()
    setApiKey(newValue)
    setIsSaved(false)
  }

  // Toggle show/hide for the API key
  const toggleShowApiKey = () => {
    setShowApiKey(!showApiKey)
  }

  // Validate the API key format
  const validateApiKey = (key: string): boolean => {
    // Check if key has the right format (starts with 'bu_' followed by alphanumeric characters)
    return /^bu_[a-zA-Z0-9_-]{10,}$/.test(key);
  }

  // Save the API key to localStorage
  const saveApiKey = () => {
    // Trim and validate the API key
    const trimmedKey = apiKey.trim()
    
    if (!trimmedKey) {
      toast.error("Please enter a valid API key")
      return
    }
    
    if (!validateApiKey(trimmedKey)) {
      toast.error("Invalid API key format. It should start with 'bu_' followed by alphanumeric characters")
      return
    }

    localStorage.setItem("browserUseApiKey", trimmedKey)
    onApiKeyChange?.(trimmedKey)
    setIsSaved(true)
    toast.success("API key saved successfully")
    
    // Log confirmation (hiding most of the key)
    console.log("API key saved:", trimmedKey.substring(0, 5) + "..." + trimmedKey.substring(trimmedKey.length - 3))
  }

  return (
    <div className={`rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-md ${className}`}>
      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-100">
        <Lock className="h-4 w-4 text-sky-400" />
        <span>Browser-Use API Key</span>
      </div>
      
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            value={apiKey}
            onChange={handleApiKeyChange}
            type={showApiKey ? "text" : "password"}
            placeholder="Enter your Browser-Use API key"
            className="flex-1 bg-white/5 text-slate-100 placeholder:text-slate-400"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full"
            onClick={toggleShowApiKey}
            type="button"
          >
            {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
        
        <Button
          onClick={saveApiKey}
          className={`gap-1 ${isSaved ? "bg-green-600 hover:bg-green-700" : "bg-sky-500 hover:bg-sky-600"}`}
        >
          {isSaved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {isSaved ? "Saved" : "Save"}
        </Button>
      </div>
      
      <p className="mt-2 text-xs text-slate-400">
        Your API key is stored locally and only used to make requests to the Browser-Use API.
        Get your API key from <a href="https://cloud.browser-use.com/billing" className="text-sky-400 hover:underline" target="_blank" rel="noopener noreferrer">Browser-Use Cloud</a>.
      </p>
    </div>
  )
} 
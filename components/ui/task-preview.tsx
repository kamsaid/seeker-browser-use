/**
 * Task Preview component
 * Displays a live preview of a running Browser-Use task
 */

"use client"

import React, { useEffect, useRef, useState } from 'react'
import { AlertTriangle, Maximize2, Minimize2, ExternalLink } from 'lucide-react'
import { Button } from './button'
import { Dialog, DialogContent } from './dialog'
import { cn } from '@/lib/utils'

interface TaskPreviewProps {
  /**
   * Live preview URL from Browser-Use API
   */
  previewUrl: string | null
  /**
   * Optional CSS class names
   */
  className?: string
  /**
   * Optional mode indicator (sandbox or live)
   */
  mode?: 'sandbox' | 'live'
  /**
   * Optional loading state
   */
  loading?: boolean
  /**
   * Optional error message
   */
  error?: string | null
}

/**
 * Component that embeds a Browser-Use task preview iframe
 */
export function TaskPreview({
  previewUrl,
  className,
  mode = 'sandbox',
  loading = false,
  error = null,
}: TaskPreviewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  /**
   * Reset iframe loaded state when URL changes
   */
  useEffect(() => {
    setIframeLoaded(false)
  }, [previewUrl])

  /**
   * Handle iframe load event
   */
  const handleIframeLoad = () => {
    setIframeLoaded(true)
  }

  /**
   * Toggle fullscreen dialog for the preview
   */
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  /**
   * Open preview in a new tab
   */
  const openInNewTab = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank')
    }
  }

  return (
    <>
      {/* Main preview container */}
      <div
        className={cn(
          'relative overflow-hidden rounded-xl border',
          mode === 'sandbox' ? 'border-sky-500/50' : 'border-red-500/50',
          className
        )}
      >
        {/* Preview header */}
        <div className={cn(
          'flex items-center justify-between px-3 py-2 text-white',
          mode === 'sandbox' ? 'bg-sky-700' : 'bg-red-700'
        )}>
          <div className="flex items-center text-xs">
            <span className="mr-2 font-medium">
              {mode === 'sandbox' ? 'Sandbox Preview' : 'Live Preview'}
            </span>
            {mode === 'live' && (
              <span className="flex items-center text-red-200">
                <AlertTriangle className="mr-1 h-3 w-3" />
                Running in live mode
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-sm hover:bg-white/20"
              onClick={toggleFullscreen}
              title="Fullscreen"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-sm hover:bg-white/20"
              onClick={openInNewTab}
              title="Open in new tab"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Loading state */}
        {(loading || (!iframeLoaded && previewUrl)) && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm">
            <div className="flex flex-col items-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-sky-500"></div>
              <p className="mt-4 text-sm text-slate-200">Loading preview...</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm">
            <div className="mx-auto max-w-md rounded-lg bg-red-950/50 p-4 text-center backdrop-blur-sm">
              <AlertTriangle className="mx-auto mb-2 h-8 w-8 text-red-500" />
              <p className="text-sm text-red-200">{error}</p>
            </div>
          </div>
        )}

        {/* Empty state (no URL) */}
        {!previewUrl && !loading && !error && (
          <div className="flex h-64 items-center justify-center bg-slate-900 text-slate-400">
            <p className="text-sm">No preview available</p>
          </div>
        )}

        {/* Iframe preview */}
        {previewUrl && (
          <iframe
            ref={iframeRef}
            src={previewUrl}
            className={cn(
              'h-[500px] w-full border-0 bg-white transition-opacity duration-300',
              iframeLoaded ? 'opacity-100' : 'opacity-0'
            )}
            onLoad={handleIframeLoad}
            title="Browser task preview"
            sandbox="allow-same-origin allow-scripts allow-forms"
          />
        )}
      </div>

      {/* Fullscreen dialog */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-6xl p-0">
          <div className={cn(
            'flex items-center justify-between px-3 py-2 text-white',
            mode === 'sandbox' ? 'bg-sky-700' : 'bg-red-700'
          )}>
            <div className="flex items-center text-xs">
              <span className="mr-2 font-medium">
                {mode === 'sandbox' ? 'Sandbox Preview' : 'Live Preview'}
              </span>
              {mode === 'live' && (
                <span className="flex items-center text-red-200">
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  Running in live mode
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-sm hover:bg-white/20"
                onClick={toggleFullscreen}
                title="Exit fullscreen"
              >
                <Minimize2 className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-sm hover:bg-white/20"
                onClick={openInNewTab}
                title="Open in new tab"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {previewUrl && (
            <iframe
              src={previewUrl}
              className="h-[calc(100vh-10rem)] w-full border-0 bg-white"
              title="Browser task preview fullscreen"
              sandbox="allow-same-origin allow-scripts allow-forms"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
} 
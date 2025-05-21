"use client"

import React from "react"
import { TaskDetails } from "@/agent/browser-use/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Play, Pause, StopCircle, RefreshCw } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

interface TaskViewerProps {
  /**
   * Task details object from the Browser-Use API
   */
  task: TaskDetails | null
  
  /**
   * Loading state for API operations
   */
  loading: boolean
  
  /**
   * Callback function when pause button is clicked
   */
  onPause: () => void
  
  /**
   * Callback function when resume button is clicked
   */
  onResume: () => void
  
  /**
   * Callback function when stop button is clicked
   */
  onStop: () => void
  
  /**
   * Class name to apply to the container
   */
  className?: string
}

/**
 * Component for displaying a Browser-Use task with live preview and controls
 */
export function TaskViewer({ task, loading, onPause, onResume, onStop, className = "" }: TaskViewerProps) {
  // Determine task status for UI display
  const getStatusIndicator = () => {
    if (!task) return null
    
    const statusMap = {
      pending: { color: "bg-amber-500", text: "Pending" },
      running: { color: "bg-green-500", text: "Running" },
      paused: { color: "bg-blue-500", text: "Paused" },
      finished: { color: "bg-sky-500", text: "Finished" },
      failed: { color: "bg-red-500", text: "Failed" },
      stopped: { color: "bg-slate-500", text: "Stopped" }
    }
    
    const status = statusMap[task.status] || { color: "bg-slate-500", text: "Unknown" }
    
    return (
      <div className="flex items-center gap-2">
        <div className={`h-3 w-3 rounded-full ${status.color} ${task.status === 'running' ? 'animate-pulse' : ''}`} />
        <span>{status.text}</span>
      </div>
    )
  }
  
  // Determine which control buttons to show based on task status
  const getControlButtons = () => {
    if (!task) return null
    
    return (
      <div className="flex gap-2">
        {task.status === "running" && (
          <Button variant="outline" size="sm" onClick={onPause} disabled={loading} className="gap-1">
            <Pause className="h-4 w-4" />
            Pause
          </Button>
        )}
        
        {task.status === "paused" && (
          <Button variant="outline" size="sm" onClick={onResume} disabled={loading} className="gap-1">
            <Play className="h-4 w-4" />
            Resume
          </Button>
        )}
        
        {["running", "paused"].includes(task.status) && (
          <Button variant="outline" size="sm" onClick={onStop} disabled={loading} className="gap-1 text-red-500">
            <StopCircle className="h-4 w-4" />
            Stop
          </Button>
        )}
        
        {loading && <RefreshCw className="h-5 w-5 animate-spin text-sky-500" />}
      </div>
    )
  }
  
  if (!task) {
    return (
      <Card className={`border-white/10 bg-white/5 text-slate-100 backdrop-blur-md ${className}`}>
        <CardContent className="flex h-64 items-center justify-center">
          <p className="text-slate-400">No active task. Enter a task description and click Execute to start.</p>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={task.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className={className}
      >
        <Card className="overflow-hidden border-white/10 bg-white/5 text-slate-100 backdrop-blur-md">
          <CardHeader className="border-b border-white/10 bg-gradient-to-r from-sky-500/20 to-fuchsia-500/20 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">Browser Task</CardTitle>
              {getStatusIndicator()}
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {task.live_url ? (
              <iframe 
                src={task.live_url} 
                className="h-[500px] w-full border-0"
                title="Browser-Use Live Preview"
                sandbox="allow-same-origin allow-scripts"
              />
            ) : task.output ? (
              <div className="p-4 text-sm text-slate-300 whitespace-pre-wrap h-[500px] overflow-y-auto">
                {task.output}
              </div>
            ) : (
              <div className="flex h-[500px] items-center justify-center">
                <p className="text-slate-400 text-center px-4">
                  {loading && "Task is processing..."}
                  {!loading && task.status === 'finished' && "Task finished, but no textual output was provided by the agent."}
                  {!loading && task.status !== 'finished' && "Live preview not available. Output will appear here once the task is complete."}
                </p>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex items-center justify-between border-t border-white/10 bg-white/5 p-3">
            <div className="text-xs text-slate-400">
              Task ID: <span className="font-mono">{task.id}</span>
            </div>
            {getControlButtons()}
          </CardFooter>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
} 
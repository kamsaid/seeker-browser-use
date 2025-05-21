/**
 * Task Steps component
 * Displays a timeline of steps executed by a Browser-Use task
 * with RLHF feedback collection
 */

"use client"

import React, { useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Code,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { Button } from './button'
import { Input } from './input'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible'
import { cn } from '@/lib/utils'
import { TaskStep } from '@/agent/browser-use/types'

interface TaskStepsProps {
  /**
   * List of task steps to display
   */
  steps: TaskStep[]
  /**
   * Optional CSS class name
   */
  className?: string
  /**
   * Callback for thumbs up feedback
   */
  onThumbsUp?: () => void
  /**
   * Callback for thumbs down feedback
   */
  onThumbsDown?: () => void
  /**
   * Optional loading state
   */
  isLoading?: boolean
  /**
   * Optional error state
   */
  error?: string | null
  /**
   * Optional task status
   */
  status?: string | null
  /**
   * Optional callback for exporting a step as code
   */
  onExportStep?: (step: TaskStep) => void
}

/**
 * Displays task steps in a collapsible timeline format with feedback buttons
 */
export function TaskSteps({
  steps,
  className,
  onThumbsUp,
  onThumbsDown,
  isLoading = false,
  error = null,
  status = null,
  onExportStep,
}: TaskStepsProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})
  const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({})
  const [feedbackGiven, setFeedbackGiven] = useState<'up' | 'down' | null>(null)

  /**
   * Group steps by logical actions
   */
  const groupedSteps = steps.reduce((acc, step, index) => {
    const action = step.action
    if (!acc[action]) {
      acc[action] = []
    }
    acc[action].push({ ...step, index })
    return acc
  }, {} as Record<string, (TaskStep & { index: number })[]>)

  /**
   * Toggle a step group expansion
   */
  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  /**
   * Toggle a step expansion
   */
  const toggleStep = (index: number) => {
    setExpandedSteps((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  /**
   * Handle search input change
   */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  /**
   * Filter steps based on search query
   */
  const filteredGroups = Object.entries(groupedSteps).filter(([groupName, groupSteps]) => {
    if (!searchQuery) return true
    
    const lowerQuery = searchQuery.toLowerCase()
    
    return (
      groupName.toLowerCase().includes(lowerQuery) ||
      groupSteps.some((step) => 
        step.description.toLowerCase().includes(lowerQuery) ||
        step.action.toLowerCase().includes(lowerQuery)
      )
    )
  })

  /**
   * Handle thumbs up/down feedback
   */
  const handleFeedback = (type: 'up' | 'down') => {
    setFeedbackGiven(type)
    if (type === 'up' && onThumbsUp) {
      onThumbsUp()
    } else if (type === 'down' && onThumbsDown) {
      onThumbsDown()
    }
  }

  /**
   * Export a step as code
   */
  const handleExportStep = (step: TaskStep & { index: number }) => {
    if (onExportStep) {
      onExportStep(step)
    }
  }

  return (
    <div className={cn('flex h-full flex-col bg-white/5 backdrop-blur-md', className)}>
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-white/10 bg-gradient-to-r from-sky-500 to-fuchsia-500 px-4 py-3 text-white">
        <Clock className="h-5 w-5" /> <h2 className="text-lg font-semibold">Task Steps</h2>
      </div>

      {/* Search bar */}
      <div className="border-b border-white/10 p-3">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search steps…"
            className="w-full bg-white/5 pl-8 pr-8 text-xs text-slate-100 placeholder:text-slate-400"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <Button variant="ghost" size="icon" className="absolute right-1 top-1 h-7 w-7 hover:bg-white/10">
            <Filter className="h-4 w-4 text-slate-400" />
          </Button>
        </div>
      </div>

      {/* Feedback section */}
      {status === 'finished' && (
        <div className="border-b border-white/10 p-3">
          <div className="rounded-lg bg-white/5 p-3">
            <h3 className="mb-2 text-xs font-medium text-slate-100">Was this task helpful?</h3>
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "rounded-full border-white/10 bg-white/5 text-slate-100 hover:bg-white/10",
                  feedbackGiven === 'up' && "bg-green-500/20 text-green-400 border-green-500/50"
                )}
                onClick={() => handleFeedback('up')}
                disabled={feedbackGiven !== null}
              >
                <ThumbsUp className="mr-1 h-4 w-4" /> Helpful
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "rounded-full border-white/10 bg-white/5 text-slate-100 hover:bg-white/10",
                  feedbackGiven === 'down' && "bg-red-500/20 text-red-400 border-red-500/50"
                )}
                onClick={() => handleFeedback('down')}
                disabled={feedbackGiven !== null}
              >
                <ThumbsDown className="mr-1 h-4 w-4" /> Not Helpful
              </Button>
            </div>
            {feedbackGiven && (
              <p className="mt-2 text-center text-xs text-slate-400">
                Thank you for your feedback! This helps improve our AI.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Steps list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && steps.length === 0 && (
          <div className="flex h-32 items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-sky-500"></div>
              <p className="mt-2 text-xs text-slate-400">Loading steps...</p>
            </div>
          </div>
        )}

        {!isLoading && steps.length === 0 && !error && (
          <div className="flex h-32 items-center justify-center">
            <p className="text-sm text-slate-400">No steps available yet</p>
          </div>
        )}

        {error && (
          <div className="flex h-32 items-center justify-center">
            <div className="mx-auto max-w-md rounded-lg bg-red-950/30 p-4 text-center">
              <XCircle className="mx-auto mb-2 h-6 w-6 text-red-500" />
              <p className="text-sm text-red-200">{error}</p>
            </div>
          </div>
        )}

        {status === 'finished' && steps.length > 0 && (
          <div className="flex h-12 items-center justify-center bg-green-500/20 text-green-400">
            <CheckCircle2 className="mr-2 h-5 w-5" />
            <span className="text-sm font-medium">Task completed successfully</span>
          </div>
        )}

        {filteredGroups.map(([groupName, groupSteps]) => (
          <StepGroup
            key={groupName}
            title={formatGroupTitle(groupName)}
            steps={groupSteps}
            open={!!expandedGroups[groupName]}
            onExpand={() => toggleGroup(groupName)}
            expandedSteps={expandedSteps}
            onToggleStep={toggleStep}
            onExportStep={handleExportStep}
          />
        ))}
      </div>
    </div>
  )
}

/**
 * Format the group title from action type
 */
function formatGroupTitle(action: string): string {
  // Convert camelCase or snake_case to Title Case With Spaces
  return action
    .replace(/([A-Z])/g, ' $1') // Insert a space before capital letters
    .replace(/_/g, ' ') // Replace underscores with spaces
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .trim()
}

interface StepGroupProps {
  title: string
  steps: (TaskStep & { index: number })[]
  open: boolean
  onExpand: () => void
  expandedSteps: Record<number, boolean>
  onToggleStep: (index: number) => void
  onExportStep?: (step: TaskStep & { index: number }) => void
}

/**
 * Groups related steps together in a collapsible section
 */
function StepGroup({
  title,
  steps,
  open,
  onExpand,
  expandedSteps,
  onToggleStep,
  onExportStep,
}: StepGroupProps) {
  return (
    <div className="border-b border-white/10">
      <Collapsible open={open} onOpenChange={onExpand}>
        <CollapsibleTrigger asChild>
          <div className="flex cursor-pointer items-center justify-between bg-white/5 px-3 py-2 backdrop-blur-md" onClick={onExpand}>
            <h3 className="text-xs font-medium text-slate-100">{title}</h3>
            <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-white/10">
              {open ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
            </Button>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          {steps.map((step) => (
            <StepItem
              key={step.index}
              step={step}
              isExpanded={!!expandedSteps[step.index]}
              onToggle={() => onToggleStep(step.index)}
              onExport={() => onExportStep?.(step)}
            />
          ))}
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

interface StepItemProps {
  step: TaskStep & { index: number }
  isExpanded: boolean
  onToggle: () => void
  onExport?: () => void
}

/**
 * Individual step item in the timeline
 */
function StepItem({ step, isExpanded, onToggle, onExport }: StepItemProps) {
  return (
    <div className="border-b border-white/10 px-3 py-3 text-xs transition-colors hover:bg-sky-500/10">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div 
              className="h-2 w-2 rounded-full bg-sky-500" 
              title={`Step ${step.index + 1}`}
            />
            <span className="text-slate-100">{step.description}</span>
          </div>
          <div className="ml-4 mt-1 text-[10px] text-slate-400">
            {new Date(step.timestamp).toLocaleTimeString()}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {onExport && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full hover:bg-white/10"
              onClick={onExport}
              title="Export as code"
            >
              <Code className="h-3.5 w-3.5 text-slate-400" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full hover:bg-white/10"
            onClick={onToggle}
          >
            {isExpanded ? (
              <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            )}
          </Button>
        </div>
      </div>

      {isExpanded && step.data && (
        <div className="mt-2 rounded-md bg-slate-900 p-2">
          <pre className="text-xs text-slate-300">
            {typeof step.data === 'object' 
              ? JSON.stringify(step.data, null, 2) 
              : String(step.data)
            }
          </pre>
        </div>
      )}
    </div>
  )
} 
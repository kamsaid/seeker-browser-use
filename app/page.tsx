"use client"

import React, { useState, useCallback, useEffect } from "react"
import Link from "next/link"
import {
  Settings,
  Repeat,
  Send,
  Sparkles,
  Lock,
  Monitor,
  MousePointer,
  Keyboard,
  Clipboard,
  Shield,
  ChevronDown,
  ChevronUp,
  Info,
  Box,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Zap
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { ApiKeyInput } from "@/components/api-key-input"
import { TaskViewer } from "@/components/task-viewer"
import { TaskSteps } from "@/components/ui/task-steps"
import { useBrowserTaskManager } from "@/hooks/use-browser-task-manager"
import { browserUseConfig, openAIConfig, featureFlags } from "@/lib/config"

/**
 * ========================= NEW LAYOUT OVERVIEW ============================
 *  ▸ Persistent gradient background with blur‑glass foreground surface
 *  ▸ Sticky translucent header with quick‑access actions
 *  ▸ Responsive two‑panel workspace (Preview • Steps)
 *  ▸ Animated command bar sitting centre‑stage
 *  ▸ Refreshed typography + subtle micro‑interactions
 *  -------------------------------------------------------------------------
 *  Business logic & hooks remain identical – only presentation changed.
 * ==========================================================================
 */
export default function Home() {
  const [permissionsOpen, setPermissionsOpen] = useState(false)
  const [learnMoreOpen, setLearnMoreOpen] = useState(false)
  const [apiKeyOpen, setApiKeyOpen] = useState(false)
  const [openAIKeyOpen, setOpenAIKeyOpen] = useState(false)
  const [permissions, setPermissions] = useState({
    screen: false,
    mouse: false,
    keyboard: false,
    clipboard: false,
    privacy: true,
    remember: false,
  })

  // Task input state
  const [taskInput, setTaskInput] = useState("")

  // State to control task steps sidebar visibility
  const [taskStepsSidebarOpen, setTaskStepsSidebarOpen] = useState(true)
  
  // State to control which model is used (standard or OpenAI)
  const [useOpenAI, setUseOpenAI] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("useOpenAIAgent") === "true" || featureFlags.useOpenAIAgent
    }
    return featureFlags.useOpenAIAgent
  })

  // Initialize with API key from localStorage or config
  const [apiKey, setApiKey] = useState(() => {
    if (typeof window !== "undefined") {
      const storedKey = localStorage.getItem("browserUseApiKey")
      if (storedKey) return storedKey
    }
    return browserUseConfig.apiKey
  })
  
  // Initialize with OpenAI API key from localStorage or config
  const [openAIKey, setOpenAIKey] = useState(() => {
    if (typeof window !== "undefined") {
      const storedKey = localStorage.getItem("openAIApiKey")
      if (storedKey) return storedKey
    }
    return openAIConfig.apiKey
  })

  // Initialize the unified task manager
  const {
    task,
    openAIResult,
    loading,
    error,
    executeTask,
    pauseTask,
    resumeTask,
    stopTask,
    clearTask,
    status,
    previewUrl
  } = useBrowserTaskManager({ 
    apiKey, 
    openAIKey, 
    useOpenAI 
  })

  // Effect to save model preference to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("useOpenAIAgent", useOpenAI.toString())
    }
  }, [useOpenAI])

  // Handle API key change
  const handleApiKeyChange = useCallback((key: string) => {
    setApiKey(key)
    if (typeof window !== "undefined") {
      localStorage.setItem("browserUseApiKey", key)
    }
  }, [])
  
  // Handle OpenAI API key change
  const handleOpenAIKeyChange = useCallback((key: string) => {
    setOpenAIKey(key)
    if (typeof window !== "undefined") {
      localStorage.setItem("openAIApiKey", key)
    }
  }, [])

  // Handle task input change
  const handleTaskInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTaskInput(e.target.value)
  }

  // Handle task execution
  const handleExecuteTask = async () => {
    if (!taskInput.trim()) {
      toast.error("Please enter a task description")
      return
    }

    if (!apiKey) {
      toast.error("Please enter your Browser‑Use API key")
      setApiKeyOpen(true)
      return
    }
    
    if (useOpenAI && !openAIKey) {
      toast.error("Please enter your OpenAI API key for GPT-4o integration")
      setOpenAIKeyOpen(true)
      return
    }

    try {
      await executeTask(taskInput)
      setTaskInput("")
      toast.success(useOpenAI ? "Task started with GPT-4o" : "Task started")
      setTaskStepsSidebarOpen(true)
    } catch (err: any) {
      toast.error(err.message || "Failed to create task")
    }
  }

  const handleThumbsUp = useCallback(() => {
    if (!task) return
    toast.success("Thanks for the feedback!")
  }, [task])

  const handleThumbsDown = useCallback(() => {
    if (!task) return
    toast("Appreciate the feedback – improvement noted.")
  }, [task])

  const handlePermissionChange = (permission: keyof typeof permissions) =>
    setPermissions((prev) => ({ ...prev, [permission]: !prev[permission] }))
    
  // Toggle between OpenAI and standard models
  const toggleModelType = () => {
    setUseOpenAI(prev => !prev)
    toast.info(useOpenAI ? "Switched to standard model" : "Switched to GPT-4o model")
  }

  // Toggle task steps sidebar
  const toggleTaskStepsSidebar = () => {
    setTaskStepsSidebarOpen((prev) => !prev)
  }

  /* --------------------------------------------------------------------- */
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 font-sans selection:bg-fuchsia-600/40">
      {/* ===== BACKGROUND ORNAMENTS ===== */}
      <GradientBlob
        className="from-fuchsia-500 via-purple-600 to-sky-500"
        size="42rem"
        top="-18rem"
        left="-18rem"
      />
      <GradientBlob
        className="from-emerald-500 via-teal-500 to-cyan-500"
        size="56rem"
        bottom="-24rem"
        right="-24rem"
        delay={3}
      />

      {/* ===== STICKY HEADER ===== */}
      <header className="sticky top-0 z-30 w-full bg-slate-900/60 backdrop-blur-md border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between p-4 md:p-6">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-fuchsia-600 shadow ring-1 ring-white/10"
            >
              <Sparkles className="h-5 w-5 text-white" />
            </motion.div>
            <span className="text-lg md:text-2xl font-semibold bg-gradient-to-r from-sky-400 to-fuchsia-500 bg-clip-text text-transparent">
              Seeker <span className="font-light">AI</span>
            </span>
          </Link>

          {/* Quick actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className={`rounded-xl border-white/10 ${useOpenAI ? 'bg-sky-500/20 text-sky-300' : 'bg-white/5'} hover:bg-white/10`}
              onClick={toggleModelType}
            >
              <Zap className={`mr-2 h-4 w-4 ${useOpenAI ? 'text-sky-300' : ''}`} /> 
              {useOpenAI ? 'Using GPT-4o' : 'Standard Model'}
            </Button>
            <Link href="/sandbox">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10"
              >
                <Box className="mr-2 h-4 w-4 text-sky-400" /> Sandbox
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10"
              onClick={() => setApiKeyOpen(true)}
            >
              <Lock className="mr-2 h-4 w-4" /> API Keys
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-white/10"
              aria-label="Settings"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* ===== HERO / COMMAND BAR ===== */}
      <section className="mx-auto w-full max-w-3xl px-4 md:px-0 pt-24 md:pt-32">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center text-4xl md:text-5xl font-semibold tracking-tight bg-gradient-to-r from-sky-400 to-fuchsia-500 bg-clip-text text-transparent"
        >
          Solve anything <span className="font-light">faster</span>
        </motion.h2>
        <p className="mt-4 text-center text-sm md:text-base text-slate-400">
          Describe your challenge – Seeker will open the browser, click through, and bring back the answer.
          {useOpenAI && <span className="ml-1 text-sky-400">Using GPT-4o.</span>}
        </p>

        {/* Command bar */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="mt-8 rounded-3xl backdrop-blur-md bg-white/5 ring-1 ring-white/10 shadow-lg"
        >
          <div className="flex items-center overflow-hidden rounded-3xl">
            <Input
              value={taskInput}
              onChange={handleTaskInputChange}
              placeholder="e.g. Compare the pricing tiers of Notion and Coda and summarise the differences…"
              className="flex-1 border-none bg-transparent px-6 py-6 text-base placeholder:text-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Button
              className="m-2 flex items-center gap-2 rounded-2xl bg-gradient-to-br from-sky-500 to-fuchsia-500 px-6 py-5 text-white shadow-xl ring-1 ring-white/10 transition-all duration-200 hover:from-sky-600 hover:to-fuchsia-600 disabled:cursor-not-allowed"
              onClick={handleExecuteTask}
              disabled={loading}
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Execute <Send className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
          {error && (
            <div className="border-t border-white/10 p-4 text-sm text-rose-300">
              {error}
            </div>
          )}
        </motion.div>
      </section>

      {/* ===== WORKSPACE ===== */}
      <main className="mx-auto mt-16 w-full max-w-7xl px-4 md:px-0 pb-32">
        <div className="flex flex-col gap-6 md:flex-row">
          {/* Preview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`relative ${taskStepsSidebarOpen ? "md:w-3/5" : "w-full"}`}
          >
            <TaskViewer
              task={task}
              loading={loading}
              onPause={pauseTask}
              onResume={resumeTask}
              onStop={stopTask}
              className="h-[550px] w-full rounded-2xl bg-slate-800/40 ring-1 ring-white/10"
            />
            {/* Toggle */}
            <Button
              variant="outline"
              size="icon"
              className="absolute -right-3 top-1/2 hidden h-7 w-7 -translate-y-1/2 rounded-full bg-slate-800/80 backdrop-blur md:flex"
              onClick={toggleTaskStepsSidebar}
            >
              {taskStepsSidebarOpen ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </motion.div>

          {/* Steps */}
          <AnimatePresence>
            {taskStepsSidebarOpen && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "100%", opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="md:w-2/5"
              >
                <TaskSteps
                  steps={task?.steps || []}
                  isLoading={loading}
                  status={status}
                  error={error}
                  onThumbsUp={handleThumbsUp}
                  onThumbsDown={handleThumbsDown}
                  className="h-[550px] rounded-2xl bg-slate-800/40 ring-1 ring-white/10"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ===== RECENT TASKS ===== */}
        <section className="mt-24">
          <h3 className="mb-6 flex items-center text-lg font-medium">
            <span>Recent Tasks</span>
            <span className="ml-4 flex-grow bg-gradient-to-r from-transparent via-slate-600/30 to-transparent h-px" />
          </h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <TaskCard title="Format data in Excel" icon={<ExcelIcon />} />
            <TaskCard title="Research market trends" icon={<BrowserIcon />} />
            <TaskCard title="Create slide deck" icon={<PowerPointIcon />} />
          </div>
        </section>
      </main>

      {/* ===== API KEY DIALOG ===== */}
      <Dialog open={apiKeyOpen} onOpenChange={setApiKeyOpen}>
        <DialogContent className="sm:max-w-[520px] overflow-hidden rounded-2xl bg-slate-900/90 backdrop-blur">
          <DialogHeader className="bg-gradient-to-r from-indigo-500 to-fuchsia-600 p-6">
            <DialogTitle className="flex items-center gap-3 text-white text-xl font-semibold">
              <Lock className="h-5 w-5" /> Browser‑Use API Key
            </DialogTitle>
            <p className="mt-1 text-sm text-white/80">
              Enter your API key to enable the agent.
            </p>
          </DialogHeader>
          <div className="p-6 space-y-5">
            <ApiKeyInput onApiKeyChange={handleApiKeyChange} />
            <PermissionItem
              icon={<Shield className="h-5 w-5 text-fuchsia-400" />}
              title="Privacy Mode"
              description="Mask sensitive windows automatically."
              checked={permissions.privacy}
              onCheckedChange={() => handlePermissionChange("privacy")}
            />
            
            {/* OpenAI Integration */}
            <div className="rounded-xl bg-white/5 p-4">
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center">
                  <Zap className="mr-2 h-5 w-5 text-sky-400" />
                  <div>
                    <h4 className="text-sm font-medium">Use OpenAI GPT-4o</h4>
                    <p className="text-xs text-slate-400">Enable for enhanced performance</p>
                  </div>
                </div>
                <Switch
                  checked={useOpenAI}
                  onCheckedChange={setUseOpenAI}
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-sky-500 data-[state=checked]:to-fuchsia-500"
                />
              </div>
              
              {useOpenAI && (
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full rounded-xl bg-white/5 hover:bg-white/10"
                    onClick={() => {
                      setApiKeyOpen(false)
                      setOpenAIKeyOpen(true)
                    }}
                  >
                    Configure OpenAI API Key
                  </Button>
                </div>
              )}
            </div>
            
            {/* Learn more */}
            <div className="rounded-xl bg-white/5 p-4">
              <button
                onClick={() => setLearnMoreOpen((v) => !v)}
                className="flex w-full items-center justify-between text-sm font-medium text-sky-400"
              >
                <span className="flex items-center">
                  <Info className="mr-2 h-4 w-4" /> Learn more about Browser‑Use
                </span>
                {learnMoreOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              <AnimatePresence initial={false}>
                {learnMoreOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="mt-2 text-xs text-slate-400"
                  >
                    <p>
                      Browser‑Use lets you drive a headless Chromium instance with natural
                      language. View sessions live, pause, resume, and collect output.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <DialogFooter className="bg-slate-800/80 p-6">
            <Button
              variant="outline"
              onClick={() => setApiKeyOpen(false)}
              className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              className="rounded-xl bg-gradient-to-r from-sky-500 to-fuchsia-500 hover:from-sky-600 hover:to-fuchsia-600 ring-1 ring-white/10"
              onClick={() => setApiKeyOpen(false)}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* ===== OPENAI API KEY DIALOG ===== */}
      <Dialog open={openAIKeyOpen} onOpenChange={setOpenAIKeyOpen}>
        <DialogContent className="sm:max-w-[520px] overflow-hidden rounded-2xl bg-slate-900/90 backdrop-blur">
          <DialogHeader className="bg-gradient-to-r from-sky-500 to-cyan-500 p-6">
            <DialogTitle className="flex items-center gap-3 text-white text-xl font-semibold">
              <Zap className="h-5 w-5" /> OpenAI GPT-4o Integration
            </DialogTitle>
            <p className="mt-1 text-sm text-white/80">
              Enter your OpenAI API key for enhanced task performance.
            </p>
          </DialogHeader>
          <div className="p-6 space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">OpenAI API Key</label>
              <Input
                type="password"
                value={openAIKey}
                onChange={(e) => handleOpenAIKeyChange(e.target.value)}
                placeholder="sk-..."
                className="rounded-xl border-white/10 bg-white/5 px-4 py-6 text-base placeholder:text-slate-400 focus-visible:ring-sky-500"
              />
            </div>
            
            <div className="rounded-xl bg-white/5 p-4">
              <div className="flex items-center text-xs text-sky-300">
                <Info className="mr-2 h-4 w-4" />
                <p>
                  Get your OpenAI API key from{" "}
                  <a 
                    href="https://platform.openai.com/api-keys" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline hover:text-sky-400"
                  >
                    OpenAI Platform
                  </a>
                </p>
              </div>
            </div>
            
            <div className="rounded-xl bg-white/5 p-4">
              <h4 className="mb-2 text-sm font-medium">Benefits of GPT-4o Integration</h4>
              <ul className="space-y-1 text-xs text-slate-400">
                <li className="flex items-center">
                  <div className="mr-2 h-1 w-1 rounded-full bg-sky-400"></div>
                  Improved task understanding and execution
                </li>
                <li className="flex items-center">
                  <div className="mr-2 h-1 w-1 rounded-full bg-sky-400"></div>
                  Better handling of complex, multi-step instructions
                </li>
                <li className="flex items-center">
                  <div className="mr-2 h-1 w-1 rounded-full bg-sky-400"></div>
                  Enhanced visual understanding capabilities
                </li>
                <li className="flex items-center">
                  <div className="mr-2 h-1 w-1 rounded-full bg-sky-400"></div>
                  More reliable task completion
                </li>
              </ul>
            </div>
          </div>
          <DialogFooter className="bg-slate-800/80 p-6">
            <Button
              variant="outline"
              onClick={() => setOpenAIKeyOpen(false)}
              className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              className="rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 ring-1 ring-white/10"
              onClick={() => setOpenAIKeyOpen(false)}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/* ========================================================================= */
// HELPERS
/* ========================================================================= */

function GradientBlob({ className, size, top, bottom, left, right, delay = 0 }: { 
  className: string; 
  size: string; 
  top?: string; 
  bottom?: string; 
  left?: string; 
  right?: string; 
  delay?: number 
}) {
  return (
    <motion.div
      style={{ width: size, height: size, top, bottom, left, right }}
      className={`pointer-events-none absolute rounded-full blur-[120px] ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.35, scale: [1, 1.08, 1], rotate: [0, 30, -30, 0] }}
      transition={{ duration: 40, repeat: Infinity, ease: "linear", delay }}
    />
  )
}

function PermissionItem({ icon, title, description, checked, onCheckedChange }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{icon}</div>
        <div>
          <h4 className="text-sm font-medium">{title}</h4>
          <p className="text-xs text-slate-400">{description}</p>
        </div>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-sky-500 data-[state=checked]:to-fuchsia-500"
      />
    </div>
  )
}

function TaskCard({ title, icon }: {
  title: string;
  icon: React.ReactNode;
}) {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02, boxShadow: "0 18px 36px rgba(0,0,0,0.3)" }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="group cursor-pointer rounded-2xl bg-white/5 p-5 backdrop-blur ring-1 ring-white/10"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          {icon}
          <p className="text-sm text-slate-100">{title}</p>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10" aria-label="Repeat task">
          <Repeat className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  )
}

function ExcelIcon() {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-inner ring-1 ring-white/20">
      <span className="text-xs font-bold text-white">XL</span>
    </div>
  )
}
function BrowserIcon() {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-indigo-600 shadow-inner ring-1 ring-white/20">
      <span className="text-xs font-bold text-white">BR</span>
    </div>
  )
}
function PowerPointIcon() {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-400 to-rose-600 shadow-inner ring-1 ring-white/20">
      <span className="text-xs font-bold text-white">PP</span>
    </div>
  )
}


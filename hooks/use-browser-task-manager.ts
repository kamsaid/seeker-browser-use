/**
 * React hook that provides a unified interface for both standard browser-use client
 * and OpenAI-powered browser-use agent
 */

import { useState, useCallback } from 'react';
import { useBrowserTask } from './use-browser-task';
import { useOpenAIBrowserTask } from './use-openai-browser-task';
import { TaskDetails, TaskStatus } from '@/agent/browser-use/types';
import { browserUseConfig, openAIConfig, featureFlags } from '@/lib/config';

interface UseBrowserTaskManagerProps {
  /**
   * Browser-Use API key
   */
  apiKey?: string;
  /**
   * OpenAI API key
   */
  openAIKey?: string;
  /**
   * Whether to use OpenAI for powering the browser agent
   */
  useOpenAI?: boolean;
}

interface UseBrowserTaskManagerReturn {
  /**
   * Current task details
   */
  task: TaskDetails | null;
  /**
   * OpenAI result (when using OpenAI agent)
   */
  openAIResult: string | null;
  /**
   * Loading state for API operations
   */
  loading: boolean;
  /**
   * Error message if any operation fails
   */
  error: string | null;
  /**
   * Create a new browser task
   */
  executeTask: (taskDescription: string) => Promise<void>;
  /**
   * Pause the current task (only for standard browser-use)
   */
  pauseTask: () => Promise<void>;
  /**
   * Resume the current task (only for standard browser-use)
   */
  resumeTask: () => Promise<void>;
  /**
   * Stop the current task (only for standard browser-use)
   */
  stopTask: () => Promise<void>;
  /**
   * Clear the current task and errors
   */
  clearTask: () => void;
  /**
   * Current status of the task
   */
  status: TaskStatus | null;
  /**
   * Preview URL for viewing the live browser session (only for standard browser-use)
   */
  previewUrl: string | null;
}

/**
 * Hook that unifies both browser-use implementations
 */
export function useBrowserTaskManager({
  apiKey = browserUseConfig.apiKey,
  openAIKey = openAIConfig.apiKey,
  useOpenAI = featureFlags.useOpenAIAgent
}: UseBrowserTaskManagerProps = {}): UseBrowserTaskManagerReturn {
  // Track which implementation is being used
  const [usingOpenAI, setUsingOpenAI] = useState<boolean>(useOpenAI);

  // Initialize both hooks
  const {
    task,
    loading: standardLoading,
    error: standardError,
    createTask: standardCreateTask,
    pauseTask,
    resumeTask,
    stopTask,
    clearTask: standardClearTask,
    status,
    previewUrl
  } = useBrowserTask({ apiKey });

  const {
    result: openAIResult,
    taskDetails: openAITaskDetails,
    loading: openAILoading,
    error: openAIError,
    runTask: openAIRunTask,
    clearResult: openAIClearTask
  } = useOpenAIBrowserTask({ 
    apiKey: openAIKey
  });

  // Unified loading and error states
  const loading = usingOpenAI ? openAILoading : standardLoading;
  const error = usingOpenAI ? openAIError : standardError;

  /**
   * Execute a task using either the standard browser-use client or OpenAI agent
   */
  const executeTask = useCallback(async (taskDescription: string) => {
    if (!taskDescription.trim()) {
      throw new Error('Task description is required');
    }

    if (usingOpenAI) {
      // Check for OpenAI API key
      if (!openAIKey) {
        throw new Error('OpenAI API key is required when using GPT-4o integration');
      }

      // Use OpenAI-powered agent
      await openAIRunTask(taskDescription);
      setUsingOpenAI(true);
    } else {
      // Use standard Browser-Use client
      await standardCreateTask({ task: taskDescription });
      setUsingOpenAI(false);
    }
  }, [usingOpenAI, openAIKey, openAIRunTask, standardCreateTask]);

  /**
   * Clear the current task and errors
   */
  const clearTask = useCallback(() => {
    if (usingOpenAI) {
      openAIClearTask();
    } else {
      standardClearTask();
    }
  }, [usingOpenAI, openAIClearTask, standardClearTask]);

  // Use OpenAI task details if OpenAI is being used, otherwise use standard task
  const currentTask = usingOpenAI ? openAITaskDetails : task;
  // Get status from OpenAI task details if available
  const currentStatus = usingOpenAI && openAITaskDetails ? openAITaskDetails.status : status;

  return {
    task: currentTask,
    openAIResult,
    loading,
    error,
    executeTask,
    pauseTask,
    resumeTask,
    stopTask,
    clearTask,
    status: currentStatus,
    previewUrl
  };
} 
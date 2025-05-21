/**
 * React hook for OpenAI-powered Browser-Use tasks
 * Provides an interface for using LangChain OpenAI models with browser-use
 */

import { useState, useCallback } from 'react';
import { openAIConfig, browserUseConfig } from '@/lib/config';
import { TaskDetails } from '@/agent/browser-use/types';

interface UseOpenAIBrowserTaskProps {
  /**
   * OpenAI API key (optional, will be sent to the server)
   */
  apiKey?: string;
  /**
   * OpenAI model to use (defaults to config)
   */
  model?: string;
  /**
   * Temperature setting (defaults to config)
   */
  temperature?: number;
  /**
   * Whether to use vision capabilities (defaults to config)
   */
  useVision?: boolean;
}

interface UseOpenAIBrowserTaskReturn {
  /**
   * Current task result/output
   */
  result: string | null;
  /**
   * Full task details including steps
   */
  taskDetails: TaskDetails | null;
  /**
   * Loading state for API operations
   */
  loading: boolean;
  /**
   * Error message if any operation fails
   */
  error: string | null;
  /**
   * Run a browser task using the OpenAI agent
   */
  runTask: (task: string) => Promise<void>;
  /**
   * Clear the current result and errors
   */
  clearResult: () => void;
}

/**
 * Hook for using OpenAI-powered browser-use tasks in React components
 */
export function useOpenAIBrowserTask({
  apiKey = openAIConfig.apiKey,
  model = openAIConfig.model,
  temperature = openAIConfig.temperature,
  useVision = openAIConfig.useVision
}: UseOpenAIBrowserTaskProps = {}): UseOpenAIBrowserTaskReturn {
  const [result, setResult] = useState<string | null>(null);
  const [taskDetails, setTaskDetails] = useState<TaskDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Runs a browser task using the OpenAI-powered agent
   */
  const runTask = useCallback(async (task: string) => {
    setLoading(true);
    setError(null);

    try {
      if (!task || task.trim() === '') {
        throw new Error('Task description is required');
      }

      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: task,
          model,
          temperature,
          useVision,
          browserUseBaseUrl: browserUseConfig.baseUrl,
          openAIApiKey: apiKey,
          browserUseApiKey: browserUseConfig.apiKey,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Request failed');
      }

      const taskResult: TaskDetails = await response.json();
      setResult(taskResult.output || '');
      setTaskDetails(taskResult);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to run task';
      console.error('Task execution error:', err);
      setError(`Failed to run task: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [apiKey, model, temperature, useVision]);
  
  /**
   * Clears the current result and errors
   */
  const clearResult = useCallback(() => {
    setResult(null);
    setTaskDetails(null);
    setError(null);
  }, []);
  
  return {
    result,
    taskDetails,
    loading,
    error,
    runTask,
    clearResult
  };
} 
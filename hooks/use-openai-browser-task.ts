/**
 * React hook for OpenAI-powered Browser-Use tasks
 * Provides an interface for using LangChain OpenAI models with browser-use
 */

import { useState, useCallback } from 'react';
import { createOpenAIBrowserAgent, runOpenAIBrowserTask } from '@/agent/browser-use/openai-model';
import { openAIConfig, browserUseConfig } from '@/lib/config';
import { TaskDetails } from '@/agent/browser-use/types';

interface UseOpenAIBrowserTaskProps {
  /**
   * OpenAI API key (defaults to config)
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
      // Validate API key
      if (!apiKey) {
        throw new Error('OpenAI API key is missing or invalid');
      }

      // Validate task
      if (!task || task.trim() === '') {
        throw new Error('Task description is required');
      }
      
      // Run the task using the OpenAI-powered Browser-Use agent
      const taskResult = await runOpenAIBrowserTask({
        // User's question/instruction
        question: task,
        // OpenAI API credentials
        openAIApiKey: apiKey,
        // Browser-Use service credentials
        browserUseApiKey: browserUseConfig.apiKey,
        browserUseBaseUrl: browserUseConfig.baseUrl,
        // LLM settings
        model,
        temperature,
        useVision
      });
      
      // Store both the output string and full task details
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
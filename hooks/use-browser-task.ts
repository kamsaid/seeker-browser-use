/**
 * React hook for Browser-Use task management
 * Provides easy access to task creation, monitoring, and control
 */

import { useState, useEffect, useCallback } from 'react';
import { BrowserUseClient } from '@/agent/browser-use/api';
import { 
  TaskRequest,
  TaskResponse,
  TaskDetails,
  TaskStatus
} from '@/agent/browser-use/types';

interface UseBrowserTaskProps {
  /**
   * API key for Browser-Use authentication
   */
  apiKey: string;
  /**
   * Optional base URL for the Browser-Use API
   */
  baseUrl?: string;
}

interface UseBrowserTaskReturn {
  /**
   * Current task details
   */
  task: TaskDetails | null;
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
  createTask: (taskRequest: TaskRequest) => Promise<void>;
  /**
   * Pause the current task
   */
  pauseTask: () => Promise<void>;
  /**
   * Resume the current task
   */
  resumeTask: () => Promise<void>;
  /**
   * Stop the current task
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
   * Preview URL for viewing the live browser session
   */
  previewUrl: string | null;
}

/**
 * Hook for managing Browser-Use tasks within React components
 */
export function useBrowserTask({ apiKey, baseUrl }: UseBrowserTaskProps): UseBrowserTaskReturn {
  const [client] = useState<BrowserUseClient>(() => new BrowserUseClient({ apiKey, baseUrl }));
  const [task, setTask] = useState<TaskDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  
  /**
   * Clears polling interval on component unmount
   */
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);
  
  /**
   * Starts polling for task status updates
   */
  const startPolling = useCallback((taskId: string) => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
    
    const interval = setInterval(async () => {
      try {
        const details = await client.getTaskDetails(taskId);
        setTask(details);
        
        if (['finished', 'failed', 'stopped'].includes(details.status)) {
          if (pollingInterval) {
            clearInterval(pollingInterval);
            setPollingInterval(null);
          }
        }
      } catch (err) {
        setError('Failed to get task updates');
        if (pollingInterval) {
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }
      }
    }, 2000);
    
    setPollingInterval(interval);
  }, [client, pollingInterval]);
  
  /**
   * Creates a new browser task
   */
  const createTask = useCallback(async (taskRequest: TaskRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      // Validate API key
      if (!apiKey || apiKey.trim() === '') {
        throw new Error('API key is missing or invalid');
      }

      // Validate task request
      if (!taskRequest.task || taskRequest.task.trim() === '') {
        throw new Error('Task description is required');
      }
      
      console.log('Creating task with apiKey:', apiKey.substring(0, 5) + '...');
      const response = await client.createTask(taskRequest);
      
      // Initialize task with response data
      setTask({
        ...response,
        steps: []
      });
      
      // Start polling for updates
      startPolling(response.id);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create task';
      console.error('Task creation error:', err);
      
      // Set more user-friendly error message
      if (errorMessage.includes('401')) {
        setError('Authentication failed: Invalid API key');
      } else if (errorMessage.includes('429')) {
        setError('Rate limit exceeded: Too many requests');
      } else if (errorMessage.includes('402')) {
        setError('Insufficient credits: Please check your Browser-Use account balance');
      } else {
        setError(`Failed to create task: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  }, [client, startPolling, apiKey]);
  
  /**
   * Pauses the current task
   */
  const pauseTask = useCallback(async () => {
    if (!task?.id) {
      setError('No active task to pause');
      return;
    }
    
    setLoading(true);
    
    try {
      await client.pauseTask(task.id);
      
      // Update task status locally for immediate UI feedback
      setTask(prev => prev ? { ...prev, status: 'paused' } : null);
    } catch (err) {
      setError('Failed to pause task');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [client, task]);
  
  /**
   * Resumes the current task
   */
  const resumeTask = useCallback(async () => {
    if (!task?.id) {
      setError('No active task to resume');
      return;
    }
    
    setLoading(true);
    
    try {
      await client.resumeTask(task.id);
      
      // Update task status locally for immediate UI feedback
      setTask(prev => prev ? { ...prev, status: 'running' } : null);
      
      // Restart polling if it was stopped
      if (!pollingInterval) {
        startPolling(task.id);
      }
    } catch (err) {
      setError('Failed to resume task');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [client, task, pollingInterval, startPolling]);
  
  /**
   * Stops the current task
   */
  const stopTask = useCallback(async () => {
    if (!task?.id) {
      setError('No active task to stop');
      return;
    }
    
    setLoading(true);
    
    try {
      await client.stopTask(task.id);
      
      // Update task status locally for immediate UI feedback
      setTask(prev => prev ? { ...prev, status: 'stopped' } : null);
      
      // Stop polling as the task is now stopped
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
    } catch (err) {
      setError('Failed to stop task');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [client, task, pollingInterval]);
  
  /**
   * Clears the current task and errors
   */
  const clearTask = useCallback(() => {
    setTask(null);
    setError(null);
    
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  }, [pollingInterval]);
  
  return {
    task,
    loading,
    error,
    createTask,
    pauseTask,
    resumeTask,
    stopTask,
    clearTask,
    status: task?.status || null,
    previewUrl: task?.live_url || null
  };
} 
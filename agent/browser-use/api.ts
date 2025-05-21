/**
 * Browser-Use API client
 * Handles communication with the Browser-Use Cloud API
 */

import { 
  TaskRequest, 
  TaskResponse, 
  TaskDetails, 
  TaskStatus, 
  TaskControl 
} from './types';

/**
 * Configuration for the Browser-Use API client
 */
interface BrowserUseConfig {
  /**
   * API key for authentication
   */
  apiKey: string;
  /**
   * Base URL for the API (defaults to official endpoint)
   */
  baseUrl?: string;
}

/**
 * Browser-Use API client for automating browser tasks
 */
export class BrowserUseClient {
  private apiKey: string;
  private baseUrl: string;
  
  /**
   * Creates a new Browser-Use API client
   */
  constructor(config: BrowserUseConfig) {
    // Remove any leading/trailing whitespace from the API key
    this.apiKey = config.apiKey.trim();
    this.baseUrl = config.baseUrl || 'https://api.browser-use.com/api/v1';
  }
  
  /**
   * Default headers for API requests including authorization
   */
  private get headers() {
    // Ensure API key is properly formatted with the Bearer prefix
    // Log the headers for debugging
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };
    
    console.log('Using headers:', { ...headers, Authorization: headers.Authorization.substring(0, 15) + '...' });
    return headers;
  }
  
  /**
   * Creates a new browser automation task
   */
  async createTask(taskRequest: TaskRequest): Promise<TaskResponse> {
    try {
      // Validate API key
      if (!this.apiKey || this.apiKey === '') {
        throw new Error('API key is missing or empty');
      }
      
      console.log('Creating task with request:', JSON.stringify(taskRequest));
      console.log('Using API key (first 5 chars):', this.apiKey.substring(0, 5) + '...');
      
      // The endpoint is just /run-task according to documentation
      const endpoint = `${this.baseUrl}/run-task`;
      console.log('Endpoint:', endpoint);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(taskRequest)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', response.status, errorText);
        
        // Handle specific authentication errors
        if (response.status === 401 || response.status === 403) {
          throw new Error(`Authentication failed: ${response.status} - Please check your API key`);
        }
        
        throw new Error(`Failed to create task: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Task created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }
  
  /**
   * Gets the current status of a task
   */
  async getTaskStatus(taskId: string): Promise<TaskStatus> {
    try {
      const endpoint = `${this.baseUrl}/task/${taskId}/status`;
      console.log('Getting task status from:', endpoint);
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: this.headers
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', response.status, errorText);
        throw new Error(`Failed to get task status: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.status;
    } catch (error) {
      console.error('Error getting task status:', error);
      throw error;
    }
  }
  
  /**
   * Gets detailed information about a task
   */
  async getTaskDetails(taskId: string): Promise<TaskDetails> {
    try {
      const response = await fetch(`${this.baseUrl}/task/${taskId}`, {
        method: 'GET',
        headers: this.headers
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get task details: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting task details:', error);
      throw error;
    }
  }
  
  /**
   * Pauses a running task
   */
  async pauseTask(taskId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/pause-task?task_id=${taskId}`, {
        method: 'PUT',
        headers: this.headers
      });
      
      if (!response.ok) {
        throw new Error(`Failed to pause task: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error pausing task:', error);
      throw error;
    }
  }
  
  /**
   * Resumes a paused task
   */
  async resumeTask(taskId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/resume-task?task_id=${taskId}`, {
        method: 'PUT',
        headers: this.headers
      });
      
      if (!response.ok) {
        throw new Error(`Failed to resume task: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error resuming task:', error);
      throw error;
    }
  }
  
  /**
   * Permanently stops a task
   */
  async stopTask(taskId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/stop-task?task_id=${taskId}`, {
        method: 'PUT',
        headers: this.headers
      });
      
      if (!response.ok) {
        throw new Error(`Failed to stop task: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error stopping task:', error);
      throw error;
    }
  }
  
  /**
   * Waits for a task to complete, polling at the given interval
   */
  async waitForCompletion(taskId: string, pollIntervalMs: number = 2000): Promise<TaskDetails> {
    let status: TaskStatus;
    
    do {
      status = await this.getTaskStatus(taskId);
      
      if (['finished', 'failed', 'stopped'].includes(status)) {
        return this.getTaskDetails(taskId);
      }
      
      // Wait for the next polling interval
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    } while (true);
  }
} 
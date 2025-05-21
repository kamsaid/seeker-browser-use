/**
 * Types for Browser-Use API integration
 * Based on the OpenAPI schema from api.browser-use.com
 */

// Request types
export interface TaskRequest {
  /**
   * Natural language instructions for the browser agent
   */
  task: string;
  /**
   * Optional configuration parameters
   */
  config?: TaskConfig;
}

export interface TaskConfig {
  /**
   * Maximum time in seconds for the task to run before timeout
   */
  timeout?: number;
  /**
   * Enable privacy mode to automatically mask sensitive content
   */
  privacy_mode?: boolean;
  /**
   * Additional browser settings
   */
  browser_settings?: BrowserSettings;
}

export interface BrowserSettings {
  /**
   * User agent string to use for browser
   */
  user_agent?: string;
  /**
   * Viewport dimensions
   */
  viewport?: {
    width: number;
    height: number;
  };
}

// Response types
export interface TaskResponse {
  /**
   * Unique ID of the created task
   */
  id: string;
  /**
   * Current status of the task
   */
  status: TaskStatus;
  /**
   * URL for live preview of the browser session
   */
  live_url: string;
  /**
   * Creation timestamp
   */
  created_at: string;
}

export interface TaskDetails extends TaskResponse {
  /**
   * Full task output after completion
   */
  output?: string;
  /**
   * List of steps executed during the task
   */
  steps?: TaskStep[];
  /**
   * Error information if task failed
   */
  error?: {
    message: string;
    code: string;
  };
}

export interface TaskStep {
  /**
   * Type of action performed
   */
  action: string;
  /**
   * Human-readable description of the step
   */
  description: string;
  /**
   * Timestamp when the step was executed
   */
  timestamp: string;
  /**
   * Screenshot or data associated with this step (optional)
   */
  data?: any;
}

export type TaskStatus = 'pending' | 'running' | 'paused' | 'finished' | 'failed' | 'stopped';

// Control operations
export interface TaskControl {
  /**
   * Task ID to control
   */
  task_id: string;
} 
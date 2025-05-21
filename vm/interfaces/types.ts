/**
 * VM System Interface Types
 * Defines the core interfaces for the VM sandbox system
 */

/**
 * Supported VM providers
 */
export type VMProviderType = 'firecracker' | 'docker' | 'mock';

/**
 * VM instance status
 */
export type VMStatus = 
  | 'initializing' // VM is being created
  | 'ready'        // VM is ready for use
  | 'busy'         // VM is currently executing a task
  | 'error'        // VM is in an error state
  | 'stopping'     // VM is being stopped
  | 'stopped';     // VM is stopped

/**
 * VM network configuration
 */
export interface VMNetworkConfig {
  /**
   * Enable internet access for the VM
   */
  enableInternet: boolean;
  
  /**
   * Network isolation level
   */
  isolationLevel: 'none' | 'partial' | 'full';
  
  /**
   * Optional list of allowed domains (for partial isolation)
   */
  allowedDomains?: string[];
}

/**
 * VM resource configuration
 */
export interface VMResourceConfig {
  /**
   * Number of CPU cores to allocate to the VM
   */
  cpuCount: number;
  
  /**
   * Memory allocation in MB
   */
  memoryMB: number;
  
  /**
   * Disk space allocation in MB
   */
  diskMB: number;
}

/**
 * VM security configuration
 */
export interface VMSecurityConfig {
  /**
   * Enable file system isolation
   */
  isolateFileSystem: boolean;
  
  /**
   * Enable process isolation
   */
  isolateProcesses: boolean;
  
  /**
   * Enable clipboard isolation
   */
  isolateClipboard: boolean;
  
  /**
   * Mask sensitive data in screenshots
   */
  maskSensitiveData: boolean;
}

/**
 * VM lifecycle configuration
 */
export interface VMLifecycleConfig {
  /**
   * Maximum VM lifetime in seconds (0 = no limit)
   */
  maxLifetimeSeconds: number;
  
  /**
   * Idle timeout in seconds (0 = no timeout)
   */
  idleTimeoutSeconds: number;
  
  /**
   * Whether to keep the VM alive between tasks
   */
  persistBetweenTasks: boolean;
}

/**
 * Complete VM configuration
 */
export interface VMConfig {
  /**
   * VM provider type
   */
  providerType: VMProviderType;
  
  /**
   * Base operating system image
   */
  baseImage: string;
  
  /**
   * Network configuration
   */
  network: VMNetworkConfig;
  
  /**
   * Resource allocation
   */
  resources: VMResourceConfig;
  
  /**
   * Security settings
   */
  security: VMSecurityConfig;
  
  /**
   * Lifecycle management
   */
  lifecycle: VMLifecycleConfig;
}

/**
 * VM instance representation
 */
export interface VMInstance {
  /**
   * Unique ID of the VM instance
   */
  id: string;
  
  /**
   * Current status of the VM
   */
  status: VMStatus;
  
  /**
   * When the VM was created
   */
  createdAt: Date;
  
  /**
   * VM configuration
   */
  config: VMConfig;
  
  /**
   * Provider-specific metadata
   */
  metadata: Record<string, any>;
}

/**
 * Connection details for accessing a VM
 */
export interface VMConnectionDetails {
  /**
   * URL for accessing the VM interface
   */
  accessUrl: string;
  
  /**
   * Authentication token (if required)
   */
  token?: string;
  
  /**
   * Additional connection details (provider-specific)
   */
  details: Record<string, any>;
}

/**
 * VM Manager interface
 * Defines methods for VM lifecycle management
 */
export interface VMManager {
  /**
   * Create a new VM instance
   */
  createVM(config: VMConfig): Promise<VMInstance>;
  
  /**
   * Get an existing VM instance by ID
   */
  getVM(id: string): Promise<VMInstance>;
  
  /**
   * List all VM instances
   */
  listVMs(): Promise<VMInstance[]>;
  
  /**
   * Start a stopped VM
   */
  startVM(id: string): Promise<VMInstance>;
  
  /**
   * Stop a running VM
   */
  stopVM(id: string): Promise<VMInstance>;
  
  /**
   * Destroy a VM (permanent deletion)
   */
  destroyVM(id: string): Promise<void>;
  
  /**
   * Get connection details for a VM
   */
  getConnectionDetails(id: string): Promise<VMConnectionDetails>;
  
  /**
   * Execute a task in the VM
   */
  executeTask(id: string, task: string): Promise<any>;
  
  /**
   * Check VM health
   */
  checkHealth(id: string): Promise<boolean>;
}

/**
 * Represents a task to be executed in the VM
 */
export interface VMTask {
  /**
   * Unique task ID
   */
  id: string;
  
  /**
   * VM instance ID
   */
  vmId: string;
  
  /**
   * Task instructions
   */
  instructions: string;
  
  /**
   * Task status
   */
  status: 'pending' | 'running' | 'completed' | 'failed';
  
  /**
   * Creation timestamp
   */
  createdAt: Date;
  
  /**
   * Completion timestamp (if completed)
   */
  completedAt?: Date;
  
  /**
   * Task result (if completed)
   */
  result?: any;
  
  /**
   * Error details (if failed)
   */
  error?: string;
} 
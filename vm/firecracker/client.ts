/**
 * Firecracker VM Client
 * Provides a client for interacting with Firecracker microVMs
 */

import { 
  VMConfig, 
  VMInstance, 
  VMStatus, 
  VMConnectionDetails 
} from '../interfaces/types';

/**
 * Authentication configuration for Firecracker API
 */
interface FirecrackerAuthConfig {
  /**
   * API endpoint for the Firecracker service
   */
  endpoint: string;
  
  /**
   * API key for authentication
   */
  apiKey: string;
}

/**
 * Firecracker VM instance metadata
 */
interface FirecrackerMetadata {
  /**
   * Instance ID on the Firecracker service
   */
  instanceId: string;
  
  /**
   * VM IP address
   */
  ipAddress?: string;
  
  /**
   * VM MAC address
   */
  macAddress?: string;
  
  /**
   * SSH key for VM access (if applicable)
   */
  sshKey?: string;
}

/**
 * Client for interacting with Firecracker microVMs
 */
export class FirecrackerClient {
  private endpoint: string;
  private apiKey: string;
  
  /**
   * Create a new Firecracker client
   */
  constructor(authConfig: FirecrackerAuthConfig) {
    this.endpoint = authConfig.endpoint;
    this.apiKey = authConfig.apiKey;
  }
  
  /**
   * Default request headers
   */
  private get headers() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };
  }
  
  /**
   * Create a new Firecracker VM instance
   */
  async createVM(config: VMConfig): Promise<VMInstance> {
    try {
      const response = await fetch(`${this.endpoint}/instances`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          baseImage: config.baseImage,
          cpuCount: config.resources.cpuCount,
          memoryMB: config.resources.memoryMB,
          diskMB: config.resources.diskMB,
          networkConfig: {
            enableInternet: config.network.enableInternet,
            isolationLevel: config.network.isolationLevel,
            allowedDomains: config.network.allowedDomains || []
          },
          securityConfig: {
            isolateFileSystem: config.security.isolateFileSystem,
            isolateProcesses: config.security.isolateProcesses,
            isolateClipboard: config.security.isolateClipboard,
            maskSensitiveData: config.security.maskSensitiveData
          },
          lifecycleConfig: {
            maxLifetimeSeconds: config.lifecycle.maxLifetimeSeconds,
            idleTimeoutSeconds: config.lifecycle.idleTimeoutSeconds
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create VM: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Convert API response to VMInstance
      return this.mapToVMInstance(data);
    } catch (error) {
      console.error('Error creating Firecracker VM:', error);
      throw error;
    }
  }
  
  /**
   * Get VM instance by ID
   */
  async getVM(id: string): Promise<VMInstance> {
    try {
      const response = await fetch(`${this.endpoint}/instances/${id}`, {
        method: 'GET',
        headers: this.headers
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get VM: ${response.statusText}`);
      }
      
      const data = await response.json();
      return this.mapToVMInstance(data);
    } catch (error) {
      console.error(`Error getting Firecracker VM ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * List all VM instances
   */
  async listVMs(): Promise<VMInstance[]> {
    try {
      const response = await fetch(`${this.endpoint}/instances`, {
        method: 'GET',
        headers: this.headers
      });
      
      if (!response.ok) {
        throw new Error(`Failed to list VMs: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.instances.map(this.mapToVMInstance);
    } catch (error) {
      console.error('Error listing Firecracker VMs:', error);
      throw error;
    }
  }
  
  /**
   * Start a VM instance
   */
  async startVM(id: string): Promise<VMInstance> {
    try {
      const response = await fetch(`${this.endpoint}/instances/${id}/start`, {
        method: 'POST',
        headers: this.headers
      });
      
      if (!response.ok) {
        throw new Error(`Failed to start VM: ${response.statusText}`);
      }
      
      const data = await response.json();
      return this.mapToVMInstance(data);
    } catch (error) {
      console.error(`Error starting Firecracker VM ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Stop a VM instance
   */
  async stopVM(id: string): Promise<VMInstance> {
    try {
      const response = await fetch(`${this.endpoint}/instances/${id}/stop`, {
        method: 'POST',
        headers: this.headers
      });
      
      if (!response.ok) {
        throw new Error(`Failed to stop VM: ${response.statusText}`);
      }
      
      const data = await response.json();
      return this.mapToVMInstance(data);
    } catch (error) {
      console.error(`Error stopping Firecracker VM ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Destroy a VM instance
   */
  async destroyVM(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.endpoint}/instances/${id}`, {
        method: 'DELETE',
        headers: this.headers
      });
      
      if (!response.ok) {
        throw new Error(`Failed to destroy VM: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Error destroying Firecracker VM ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Get connection details for a VM
   */
  async getConnectionDetails(id: string): Promise<VMConnectionDetails> {
    try {
      const response = await fetch(`${this.endpoint}/instances/${id}/connection`, {
        method: 'GET',
        headers: this.headers
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get VM connection details: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return {
        accessUrl: data.accessUrl,
        token: data.token,
        details: {
          ipAddress: data.ipAddress,
          sshKey: data.sshKey,
          ports: data.ports
        }
      };
    } catch (error) {
      console.error(`Error getting Firecracker VM ${id} connection details:`, error);
      throw error;
    }
  }
  
  /**
   * Execute a task in the VM
   */
  async executeTask(id: string, task: string): Promise<any> {
    try {
      const response = await fetch(`${this.endpoint}/instances/${id}/execute`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ task })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to execute task in VM: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error executing task in Firecracker VM ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Check VM health
   */
  async checkHealth(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.endpoint}/instances/${id}/health`, {
        method: 'GET',
        headers: this.headers
      });
      
      if (!response.ok) {
        return false;
      }
      
      const data = await response.json();
      return data.healthy === true;
    } catch (error) {
      console.error(`Error checking Firecracker VM ${id} health:`, error);
      return false;
    }
  }
  
  /**
   * Map API response to VMInstance interface
   */
  private mapToVMInstance(data: any): VMInstance {
    // Extract the VM status
    const status = this.mapStatus(data.status);
    
    // Extract VM metadata
    const metadata: FirecrackerMetadata = {
      instanceId: data.instanceId,
      ipAddress: data.ipAddress,
      macAddress: data.macAddress,
      sshKey: data.sshKey
    };
    
    // Extract VM configuration
    const config: VMConfig = {
      providerType: 'firecracker',
      baseImage: data.baseImage,
      network: {
        enableInternet: data.enableInternet,
        isolationLevel: data.networkIsolation || 'partial',
        allowedDomains: data.allowedDomains || []
      },
      resources: {
        cpuCount: data.cpuCount,
        memoryMB: data.memoryMB,
        diskMB: data.diskMB
      },
      security: {
        isolateFileSystem: data.isolateFileSystem !== false,
        isolateProcesses: data.isolateProcesses !== false,
        isolateClipboard: data.isolateClipboard !== false,
        maskSensitiveData: data.maskSensitiveData !== false
      },
      lifecycle: {
        maxLifetimeSeconds: data.maxLifetimeSeconds || 1800,
        idleTimeoutSeconds: data.idleTimeoutSeconds || 300,
        persistBetweenTasks: data.persistBetweenTasks === true
      }
    };
    
    return {
      id: data.id,
      status,
      createdAt: new Date(data.createdAt),
      config,
      metadata
    };
  }
  
  /**
   * Map provider-specific status to VMStatus
   */
  private mapStatus(providerStatus: string): VMStatus {
    switch (providerStatus) {
      case 'creating':
        return 'initializing';
      case 'running':
        return 'ready';
      case 'busy':
        return 'busy';
      case 'stopping':
        return 'stopping';
      case 'stopped':
        return 'stopped';
      case 'failed':
      case 'error':
        return 'error';
      default:
        return 'error';
    }
  }
} 
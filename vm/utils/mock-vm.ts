/**
 * Mock VM Implementation
 * Provides a fake VM implementation for development and testing
 */

import { v4 as uuidv4 } from 'uuid';
import { 
  VMConfig, 
  VMInstance, 
  VMStatus, 
  VMConnectionDetails 
} from '../interfaces/types';

/**
 * Generate a mock VM instance for testing
 */
export function createMockVM(config: VMConfig): VMInstance {
  const id = uuidv4();
  
  return {
    id,
    status: 'ready',
    createdAt: new Date(),
    config,
    metadata: {
      mockInstance: true,
      instanceId: `mock-${id.substring(0, 8)}`,
      ipAddress: '192.168.1.100'
    }
  };
}

/**
 * Generate mock connection details
 * @param id VM instance ID
 */
export function getMockConnectionDetails(id: string): VMConnectionDetails {
  return {
    accessUrl: `https://sandbox.example.com/vm/${id}/browser`,
    token: `mock-token-${id.substring(0, 8)}`,
    details: {
      ipAddress: '192.168.1.100',
      ports: {
        ssh: 22,
        http: 80,
        https: 443
      }
    }
  };
}

/**
 * Simulate task execution with a mock response
 */
export function executeMockTask(task: string): any {
  // Sleep for a random duration to simulate task execution time
  return new Promise((resolve) => {
    const executionTime = Math.floor(Math.random() * 1000) + 500;
    
    setTimeout(() => {
      resolve({
        success: true,
        executionTime,
        output: `Mock execution of task: ${task}`,
        steps: [
          {
            action: 'navigation',
            description: 'Navigated to website',
            timestamp: new Date().toISOString(),
            data: { url: 'https://example.com' }
          },
          {
            action: 'interaction',
            description: 'Clicked on button',
            timestamp: new Date().toISOString(),
            data: { element: 'button', selector: '#submit-btn' }
          },
          {
            action: 'completion',
            description: 'Task completed successfully',
            timestamp: new Date().toISOString(),
            data: { duration: executionTime }
          }
        ]
      });
    }, executionTime);
  });
}

/**
 * Mock VM storage (for development)
 */
export class MockVMStorage {
  private vms: Map<string, VMInstance> = new Map();
  
  /**
   * Save a VM instance
   */
  saveVM(vm: VMInstance): void {
    this.vms.set(vm.id, { ...vm });
  }
  
  /**
   * Get a VM instance by ID
   */
  getVM(id: string): VMInstance | undefined {
    return this.vms.get(id);
  }
  
  /**
   * List all VM instances
   */
  listVMs(): VMInstance[] {
    return Array.from(this.vms.values());
  }
  
  /**
   * Delete a VM instance
   */
  deleteVM(id: string): boolean {
    return this.vms.delete(id);
  }
  
  /**
   * Update a VM's status
   */
  updateVMStatus(id: string, status: VMStatus): VMInstance | undefined {
    const vm = this.vms.get(id);
    
    if (vm) {
      const updatedVM = { ...vm, status };
      this.vms.set(id, updatedVM);
      return updatedVM;
    }
    
    return undefined;
  }
}

/**
 * Create a singleton instance of the mock storage
 */
export const mockVMStorage = new MockVMStorage(); 
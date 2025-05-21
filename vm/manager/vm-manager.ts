/**
 * VM Manager
 * Central service for managing VM instances across different providers
 */

import { v4 as uuidv4 } from 'uuid';
import { 
  VMConfig, 
  VMInstance, 
  VMManager, 
  VMConnectionDetails, 
  VMProviderType,
  VMStatus
} from '../interfaces/types';
import { FirecrackerClient } from '../firecracker/client';
import { 
  createMockVM, 
  getMockConnectionDetails, 
  executeMockTask, 
  mockVMStorage 
} from '../utils/mock-vm';
import { getDefaultVMConfig, getDevVMConfig } from '../utils/defaults';
import { sandboxConfig } from '@/lib/config';

/**
 * VM Manager implementation
 * Handles VM lifecycle management and provider selection
 */
export class VMManagerImpl implements VMManager {
  private firecrackerClient?: FirecrackerClient;
  private isDev: boolean;
  
  /**
   * Create a new VM Manager
   */
  constructor() {
    // Check if we're in development mode
    this.isDev = process.env.NODE_ENV === 'development';
    
    // Initialize Firecracker client if not in development mode
    if (!this.isDev && sandboxConfig.vmProvider.apiKey) {
      this.firecrackerClient = new FirecrackerClient({
        endpoint: sandboxConfig.vmProvider.serviceUrl,
        apiKey: sandboxConfig.vmProvider.apiKey
      });
    }
  }
  
  /**
   * Create a new VM instance
   */
  async createVM(config?: VMConfig): Promise<VMInstance> {
    // Use provided config or get default for the environment
    const vmConfig = config || (this.isDev ? getDevVMConfig() : getDefaultVMConfig());
    
    // In development mode, use mock VM
    if (this.isDev || vmConfig.providerType === 'mock') {
      const mockVM = createMockVM(vmConfig);
      mockVMStorage.saveVM(mockVM);
      return mockVM;
    }
    
    // For Firecracker, use the real client
    if (vmConfig.providerType === 'firecracker') {
      if (!this.firecrackerClient) {
        throw new Error('Firecracker client not initialized');
      }
      
      return await this.firecrackerClient.createVM(vmConfig);
    }
    
    // Unsupported provider
    throw new Error(`Unsupported VM provider: ${vmConfig.providerType}`);
  }
  
  /**
   * Get an existing VM instance
   */
  async getVM(id: string): Promise<VMInstance> {
    // In development mode, get from mock storage
    if (this.isDev) {
      const vm = mockVMStorage.getVM(id);
      if (!vm) {
        throw new Error(`VM not found: ${id}`);
      }
      return vm;
    }
    
    // Get VM from Firecracker
    if (!this.firecrackerClient) {
      throw new Error('Firecracker client not initialized');
    }
    
    return await this.firecrackerClient.getVM(id);
  }
  
  /**
   * List all VM instances
   */
  async listVMs(): Promise<VMInstance[]> {
    // In development mode, list from mock storage
    if (this.isDev) {
      return mockVMStorage.listVMs();
    }
    
    // List VMs from Firecracker
    if (!this.firecrackerClient) {
      throw new Error('Firecracker client not initialized');
    }
    
    return await this.firecrackerClient.listVMs();
  }
  
  /**
   * Start a stopped VM
   */
  async startVM(id: string): Promise<VMInstance> {
    // In development mode, update mock storage
    if (this.isDev) {
      const updatedVM = mockVMStorage.updateVMStatus(id, 'ready');
      if (!updatedVM) {
        throw new Error(`VM not found: ${id}`);
      }
      return updatedVM;
    }
    
    // Start VM in Firecracker
    if (!this.firecrackerClient) {
      throw new Error('Firecracker client not initialized');
    }
    
    return await this.firecrackerClient.startVM(id);
  }
  
  /**
   * Stop a running VM
   */
  async stopVM(id: string): Promise<VMInstance> {
    // In development mode, update mock storage
    if (this.isDev) {
      const updatedVM = mockVMStorage.updateVMStatus(id, 'stopped');
      if (!updatedVM) {
        throw new Error(`VM not found: ${id}`);
      }
      return updatedVM;
    }
    
    // Stop VM in Firecracker
    if (!this.firecrackerClient) {
      throw new Error('Firecracker client not initialized');
    }
    
    return await this.firecrackerClient.stopVM(id);
  }
  
  /**
   * Destroy a VM (permanent deletion)
   */
  async destroyVM(id: string): Promise<void> {
    // In development mode, remove from mock storage
    if (this.isDev) {
      const deleted = mockVMStorage.deleteVM(id);
      if (!deleted) {
        throw new Error(`VM not found: ${id}`);
      }
      return;
    }
    
    // Destroy VM in Firecracker
    if (!this.firecrackerClient) {
      throw new Error('Firecracker client not initialized');
    }
    
    await this.firecrackerClient.destroyVM(id);
  }
  
  /**
   * Get connection details for a VM
   */
  async getConnectionDetails(id: string): Promise<VMConnectionDetails> {
    // In development mode, get mock connection details
    if (this.isDev) {
      // Check if VM exists first
      const vm = mockVMStorage.getVM(id);
      if (!vm) {
        throw new Error(`VM not found: ${id}`);
      }
      return getMockConnectionDetails(id);
    }
    
    // Get connection details from Firecracker
    if (!this.firecrackerClient) {
      throw new Error('Firecracker client not initialized');
    }
    
    return await this.firecrackerClient.getConnectionDetails(id);
  }
  
  /**
   * Execute a task in the VM
   */
  async executeTask(id: string, task: string): Promise<any> {
    // In development mode, execute mock task
    if (this.isDev) {
      // Check if VM exists first
      const vm = mockVMStorage.getVM(id);
      if (!vm) {
        throw new Error(`VM not found: ${id}`);
      }
      
      // Mark VM as busy
      mockVMStorage.updateVMStatus(id, 'busy');
      
      try {
        // Execute mock task
        const result = await executeMockTask(task);
        
        // Mark VM as ready again
        mockVMStorage.updateVMStatus(id, 'ready');
        
        return result;
      } catch (error) {
        // Mark VM as error state
        mockVMStorage.updateVMStatus(id, 'error');
        throw error;
      }
    }
    
    // Execute task in Firecracker
    if (!this.firecrackerClient) {
      throw new Error('Firecracker client not initialized');
    }
    
    return await this.firecrackerClient.executeTask(id, task);
  }
  
  /**
   * Check VM health
   */
  async checkHealth(id: string): Promise<boolean> {
    // In development mode, check mock storage
    if (this.isDev) {
      const vm = mockVMStorage.getVM(id);
      return !!vm && vm.status === 'ready';
    }
    
    // Check health in Firecracker
    if (!this.firecrackerClient) {
      throw new Error('Firecracker client not initialized');
    }
    
    return await this.firecrackerClient.checkHealth(id);
  }
  
  /**
   * Switch between sandbox and live modes
   * @param mode The mode to switch to ('sandbox' or 'live')
   */
  async switchMode(mode: 'sandbox' | 'live'): Promise<void> {
    // In live mode, no VM is used
    if (mode === 'live') {
      // Optionally, stop any running VMs
      return;
    }
    
    // In sandbox mode, ensure we have a running VM
    // This could automatically create one if needed
    try {
      const vms = await this.listVMs();
      
      // Find a suitable VM or create one
      if (vms.length === 0) {
        await this.createVM();
      } else {
        // Find a VM that's ready or stopped
        const availableVM = vms.find(vm => 
          vm.status === 'ready' || vm.status === 'stopped'
        );
        
        if (availableVM) {
          // Start it if it's stopped
          if (availableVM.status === 'stopped') {
            await this.startVM(availableVM.id);
          }
        } else {
          // Create a new VM if none are available
          await this.createVM();
        }
      }
    } catch (error) {
      console.error('Error switching to sandbox mode:', error);
      throw new Error('Failed to initialize sandbox environment');
    }
  }
} 
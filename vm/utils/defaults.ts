/**
 * Default VM configuration settings
 * Provides sensible defaults for VM creation
 */

import { 
  VMConfig, 
  VMNetworkConfig, 
  VMResourceConfig, 
  VMSecurityConfig, 
  VMLifecycleConfig, 
  VMProviderType 
} from '../interfaces/types';

/**
 * Default network configuration
 * Provides secure network isolation by default
 */
export const defaultNetworkConfig: VMNetworkConfig = {
  /**
   * Enable internet access by default
   * Required for browser automation tasks
   */
  enableInternet: true,
  
  /**
   * Partial isolation by default
   * Allows connection to common domains while blocking others
   */
  isolationLevel: 'partial',
  
  /**
   * Common allowed domains for browser testing
   */
  allowedDomains: [
    'google.com',
    'github.com',
    'microsoft.com',
    'apple.com',
    'amazon.com',
    'example.com',
    'browser-use.com',
    // Add other commonly used domains
  ]
};

/**
 * Default resource allocation
 * Conservative defaults suitable for most browser tasks
 */
export const defaultResourceConfig: VMResourceConfig = {
  /**
   * 2 CPU cores by default
   */
  cpuCount: 2,
  
  /**
   * 4GB RAM allocation by default
   */
  memoryMB: 4096,
  
  /**
   * 10GB disk space by default
   */
  diskMB: 10240
};

/**
 * Default security configuration
 * Strong isolation by default
 */
export const defaultSecurityConfig: VMSecurityConfig = {
  /**
   * Isolate the file system by default
   */
  isolateFileSystem: true,
  
  /**
   * Isolate processes by default
   */
  isolateProcesses: true,
  
  /**
   * Isolate clipboard by default
   */
  isolateClipboard: true,
  
  /**
   * Mask sensitive data in screenshots by default
   */
  maskSensitiveData: true
};

/**
 * Default lifecycle configuration
 * Conservative defaults to prevent resource leaks
 */
export const defaultLifecycleConfig: VMLifecycleConfig = {
  /**
   * 30 minute max lifetime by default
   */
  maxLifetimeSeconds: 30 * 60,
  
  /**
   * 5 minute idle timeout by default
   */
  idleTimeoutSeconds: 5 * 60,
  
  /**
   * Don't persist between tasks by default
   */
  persistBetweenTasks: false
};

/**
 * Default VM configuration
 * @param providerType The VM provider to use
 * @returns A complete VM configuration with sensible defaults
 */
export function getDefaultVMConfig(providerType: VMProviderType = 'firecracker'): VMConfig {
  return {
    providerType,
    baseImage: 'ubuntu-22.04-browser',
    network: defaultNetworkConfig,
    resources: defaultResourceConfig,
    security: defaultSecurityConfig,
    lifecycle: defaultLifecycleConfig
  };
}

/**
 * Get development mode VM config
 * More permissive settings for development environments
 */
export function getDevVMConfig(): VMConfig {
  return {
    providerType: 'mock', // Use mock provider in development
    baseImage: 'ubuntu-22.04-browser',
    network: {
      ...defaultNetworkConfig,
      isolationLevel: 'none', // No network isolation in development
    },
    resources: {
      ...defaultResourceConfig,
      cpuCount: 1, // Use fewer resources in development
      memoryMB: 2048,
    },
    security: {
      ...defaultSecurityConfig,
      maskSensitiveData: false, // No masking in development
    },
    lifecycle: {
      ...defaultLifecycleConfig,
      maxLifetimeSeconds: 60 * 60, // Longer lifetime in development
      idleTimeoutSeconds: 15 * 60, // Longer idle timeout in development
    }
  };
} 
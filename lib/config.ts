/**
 * Application configuration
 * Manages environment variables and configuration settings
 */

/**
 * Browser-Use API configuration
 */
export const browserUseConfig = {
  /**
   * API Key for Browser-Use Cloud
   * Get your API key from cloud.browser-use.com/billing
   * Set the NEXT_PUBLIC_BROWSER_USE_API_KEY environment variable
   */
  apiKey: process.env.NEXT_PUBLIC_BROWSER_USE_API_KEY || '',
  
  /**
   * Base URL for the Browser-Use API
   */
  baseUrl: process.env.NEXT_PUBLIC_BROWSER_USE_API_URL || 'https://api.browser-use.com/api/v1'
};

/**
 * OpenAI API configuration for Browser-Use
 */
export const openAIConfig = {
  /**
   * API Key for OpenAI
   * Get your API key from platform.openai.com/api-keys
   * Set the OPENAI_API_KEY environment variable
   */
  apiKey: process.env.OPENAI_API_KEY || '',
  
  /**
   * OpenAI model to use with browser-use
   * Default is set to gpt-4o for best performance
   */
  model: process.env.OPENAI_MODEL || 'gpt-4o',
  
  /**
   * Temperature setting for model responses
   * Lower values (0.0) make outputs more deterministic
   */
  temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.0'),
  
  /**
   * Whether to use vision capabilities with the model
   */
  useVision: process.env.OPENAI_USE_VISION !== 'false'
};

/**
 * Sandbox VM configuration
 */
export const sandboxConfig = {
  /**
   * Default memory allocation for sandbox VMs (in MB)
   */
  memory: 2048,
  
  /**
   * Default CPU allocation for sandbox VMs
   */
  vcpu: 2,
  
  /**
   * Default disk space for sandbox VMs (in GB)
   */
  diskSize: 10,
  
  /**
   * VM provider configuration
   */
  vmProvider: {
    /**
     * API key for VM provider
     * This is only required in production environments
     */
    apiKey: process.env.SANDBOX_VM_PROVIDER_API_KEY || '',
    
    /**
     * VM provider service URL
     */
    serviceUrl: process.env.SANDBOX_VM_PROVIDER_URL || 'https://api.vm-provider.com'
  }
};

/**
 * Application-wide feature flags
 */
export const featureFlags = {
  /**
   * Whether to enable the RLHF feedback collection
   */
  enableFeedback: process.env.NEXT_PUBLIC_ENABLE_FEEDBACK !== 'false',
  
  /**
   * Whether to enable task export (as macros)
   */
  enableTaskExport: process.env.NEXT_PUBLIC_ENABLE_TASK_EXPORT !== 'false',
  
  /**
   * Whether to use OpenAI-powered LLM agent instead of default
   */
  useOpenAIAgent: process.env.USE_OPENAI_AGENT === 'true'
};

/**
 * Validates that required configuration is present
 * @returns An object with validation results
 */
export function validateConfig() {
  const missingKeys = [];
  
  // Check for Browser-Use API key
  if (!browserUseConfig.apiKey) {
    missingKeys.push('NEXT_PUBLIC_BROWSER_USE_API_KEY');
  }
  
  // Check for OpenAI API key if OpenAI agent is enabled
  if (featureFlags.useOpenAIAgent && !openAIConfig.apiKey) {
    missingKeys.push('OPENAI_API_KEY');
  }
  
  // Check for VM provider API key if not in development
  if (process.env.NODE_ENV !== 'development' && !sandboxConfig.vmProvider.apiKey) {
    missingKeys.push('SANDBOX_VM_PROVIDER_API_KEY');
  }
  
  return {
    isValid: missingKeys.length === 0,
    missingKeys,
  };
} 
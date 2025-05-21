/**
 * VM Module Index
 * Exports all VM-related functionality
 */

// Export types
export * from './interfaces/types';

// Export VM manager
export { VMManagerImpl as VMManager } from './manager/vm-manager';

// Export VM context
export { VMProvider, useVMContext } from './context/vm-context';

// Export utility functions
export { getDefaultVMConfig, getDevVMConfig } from './utils/defaults'; 
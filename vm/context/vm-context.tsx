/**
 * VM Context
 * Provides VM state and operations to the application
 */

'use client'

import React, { createContext, useContext, ReactNode } from 'react';
import { useVM } from '@/hooks/use-vm';
import { VMInstance, VMConnectionDetails } from '@/vm/interfaces/types';

/**
 * VM Context Properties
 */
interface VMContextProps {
  /**
   * Current VM instance (if any)
   */
  vm: VMInstance | null;
  
  /**
   * Loading state for VM operations
   */
  loading: boolean;
  
  /**
   * Error message if any operation fails
   */
  error: string | null;
  
  /**
   * Current connection details for the VM
   */
  connectionDetails: VMConnectionDetails | null;
  
  /**
   * Current mode (sandbox or live)
   */
  mode: 'sandbox' | 'live';
  
  /**
   * Toggle between sandbox and live modes
   */
  toggleMode: () => Promise<void>;
  
  /**
   * Execute a task in the current VM
   */
  executeTask: (task: string) => Promise<any>;
  
  /**
   * Create a new VM instance
   */
  createVM: () => Promise<VMInstance>;
  
  /**
   * Check if sandbox is ready for use
   */
  isSandboxReady: boolean;
}

// Create the VM context
const VMContext = createContext<VMContextProps | undefined>(undefined);

/**
 * VM Provider Props
 */
interface VMProviderProps {
  /**
   * Children components that will have access to the VM context
   */
  children: ReactNode;
  
  /**
   * Whether to auto-create a VM on initialization
   */
  autoCreate?: boolean;
  
  /**
   * Default mode for VM usage
   */
  defaultMode?: 'sandbox' | 'live';
}

/**
 * VM Context Provider
 * Provides VM state and operations to the application
 */
export function VMProvider({ 
  children, 
  autoCreate = true, 
  defaultMode = 'sandbox' 
}: VMProviderProps): JSX.Element {
  // Use the VM hook to provide VM state and operations
  const vmState = useVM({ autoCreate, defaultMode });
  
  return (
    <VMContext.Provider value={vmState}>
      {children}
    </VMContext.Provider>
  );
}

/**
 * Hook for using the VM context
 * @throws {Error} If used outside of a VMProvider
 */
export function useVMContext(): VMContextProps {
  const context = useContext(VMContext);
  
  if (context === undefined) {
    throw new Error('useVMContext must be used within a VMProvider');
  }
  
  return context;
} 
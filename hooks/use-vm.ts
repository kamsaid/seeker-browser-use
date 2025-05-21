/**
 * VM Hook
 * React hook for using the VM manager in components
 */

import { useState, useEffect, useCallback } from 'react';
import { VMManagerImpl } from '@/vm/manager/vm-manager';
import { VMInstance, VMConnectionDetails } from '@/vm/interfaces/types';
import { sandboxConfig } from '@/lib/config';

interface UseVMOptions {
  /**
   * Whether to auto-create a VM on hook initialization
   */
  autoCreate?: boolean;
  
  /**
   * Default mode for VM usage
   */
  defaultMode?: 'sandbox' | 'live';
}

interface UseVMReturn {
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

/**
 * Hook for working with VM instances
 */
export function useVM({ 
  autoCreate = true, 
  defaultMode = 'sandbox' 
}: UseVMOptions = {}): UseVMReturn {
  // VM manager instance
  const [vmManager] = useState(() => new VMManagerImpl());
  
  // VM state
  const [vm, setVM] = useState<VMInstance | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionDetails, setConnectionDetails] = useState<VMConnectionDetails | null>(null);
  const [mode, setMode] = useState<'sandbox' | 'live'>(defaultMode);
  
  /**
   * Initialize VM if auto-create is enabled
   */
  useEffect(() => {
    if (autoCreate && mode === 'sandbox' && !vm) {
      const initVM = async () => {
        setLoading(true);
        setError(null);
        
        try {
          await switchToMode('sandbox');
        } catch (err) {
          setError('Failed to initialize VM');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      
      initVM();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoCreate, mode]);
  
  /**
   * Switch to the specified mode
   */
  const switchToMode = useCallback(async (newMode: 'sandbox' | 'live') => {
    setLoading(true);
    setError(null);
    
    try {
      await vmManager.switchMode(newMode);
      
      if (newMode === 'sandbox') {
        // For sandbox mode, we need a running VM
        const vms = await vmManager.listVMs();
        
        if (vms.length > 0) {
          const activeVM = vms[0];
          setVM(activeVM);
          
          // Get connection details for the VM
          const details = await vmManager.getConnectionDetails(activeVM.id);
          setConnectionDetails(details);
        } else {
          throw new Error('No VM instances available');
        }
      } else {
        // For live mode, clear VM state
        setVM(null);
        setConnectionDetails(null);
      }
      
      setMode(newMode);
    } catch (err) {
      setError(`Failed to switch to ${newMode} mode`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [vmManager]);
  
  /**
   * Toggle between sandbox and live modes
   */
  const toggleMode = useCallback(async () => {
    const newMode = mode === 'sandbox' ? 'live' : 'sandbox';
    await switchToMode(newMode);
  }, [mode, switchToMode]);
  
  /**
   * Execute a task in the current VM
   */
  const executeTask = useCallback(async (task: string) => {
    if (mode === 'live') {
      throw new Error('Cannot execute task in live mode');
    }
    
    if (!vm) {
      throw new Error('No VM instance available');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await vmManager.executeTask(vm.id, task);
      
      // Refresh VM state
      const updatedVM = await vmManager.getVM(vm.id);
      setVM(updatedVM);
      
      return result;
    } catch (err) {
      setError('Failed to execute task');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [mode, vm, vmManager]);
  
  /**
   * Create a new VM instance
   */
  const createVM = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const newVM = await vmManager.createVM();
      setVM(newVM);
      
      // Get connection details for the new VM
      const details = await vmManager.getConnectionDetails(newVM.id);
      setConnectionDetails(details);
      
      return newVM;
    } catch (err) {
      setError('Failed to create VM');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [vmManager]);
  
  return {
    vm,
    loading,
    error,
    connectionDetails,
    mode,
    toggleMode,
    executeTask,
    createVM,
    isSandboxReady: mode === 'sandbox' && vm?.status === 'ready'
  };
} 
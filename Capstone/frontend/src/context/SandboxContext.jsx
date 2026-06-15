import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const SandboxContext = createContext();

export function SandboxProvider({ children }) {
  const [sandboxState, setSandboxState] = useState(() => localStorage.getItem('sandboxState') || 'welcome');
  const [sandboxId, setSandboxId] = useState(() => localStorage.getItem('sandboxId') || null);
  const [previewUrl, setPreviewUrl] = useState(() => localStorage.getItem('previewUrl') || null);
  const [connectionStatus, setConnectionStatus] = useState(() => {
    const savedState = localStorage.getItem('sandboxState');
    return savedState === 'dashboard' ? 'connected' : 'disconnected';
  });

  useEffect(() => {
    if (sandboxState) localStorage.setItem('sandboxState', sandboxState);
    else localStorage.removeItem('sandboxState');
  }, [sandboxState]);

  useEffect(() => {
    if (sandboxId) localStorage.setItem('sandboxId', sandboxId);
    else localStorage.removeItem('sandboxId');
  }, [sandboxId]);

  useEffect(() => {
    if (previewUrl) localStorage.setItem('previewUrl', previewUrl);
    else localStorage.removeItem('previewUrl');
  }, [previewUrl]);

  const handleCreateSandbox = (sandboxInfo) => {
    setSandboxId(sandboxInfo.sandboxId);
    setPreviewUrl(sandboxInfo.previewUrl);
    setSandboxState('provisioning');
  };

  const handleProvisioningComplete = () => {
    setSandboxState('dashboard');
    setConnectionStatus('connected');
    toast.success('Sandbox environment created successfully');
  };

  const handleResetSandbox = () => {
    if (window.confirm('Are you sure you want to restart this sandbox? Unsaved files will be lost.')) {
      setSandboxState('welcome');
      setSandboxId(null);
      setPreviewUrl(null);
      setConnectionStatus('disconnected');
      
      // Cleanup local storage 
      localStorage.removeItem('openTabs');
      localStorage.removeItem('activeTab');
      localStorage.removeItem('chatMessages');
      toast.success('Sandbox reset successfully');
    }
  };

  return (
    <SandboxContext.Provider value={{
      sandboxState,
      setSandboxState,
      sandboxId,
      previewUrl,
      connectionStatus,
      handleCreateSandbox,
      handleProvisioningComplete,
      handleResetSandbox
    }}>
      {children}
    </SandboxContext.Provider>
  );
}

export const useSandbox = () => useContext(SandboxContext);

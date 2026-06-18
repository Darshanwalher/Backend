import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useSandbox } from './SandboxContext';

const FileSystemContext = createContext();

const standardizePath = (path) => {
  if (!path) return '';
  return path.startsWith('/') ? path : '/' + path;
};

export function FileSystemProvider({ children }) {
  const { sandboxId, sandboxState } = useSandbox();

  const [files, setFiles] = useState([]);
  const [fileContents, setFileContents] = useState({});
  const [openTabs, setOpenTabs] = useState(() => {
    try {
      const stored = localStorage.getItem('openTabs');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('activeTab') || 'preview');
  const [modifiedFiles, setModifiedFiles] = useState([]); 
  const [unsavedChanges, setUnsavedChanges] = useState({});
  const [previewKey, setPreviewKey] = useState(0);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  // Clear state when sandbox is reset
  useEffect(() => {
    if (sandboxState === 'welcome') {
      setOpenTabs([]);
      setActiveTab('preview');
      setFileContents({});
      setModifiedFiles([]);
      setUnsavedChanges({});
      setPreviewKey(0);
    }
  }, [sandboxState]);

  useEffect(() => {
    localStorage.setItem('openTabs', JSON.stringify(openTabs));
  }, [openTabs]);

  useEffect(() => {
    if (activeTab) localStorage.setItem('activeTab', activeTab);
    else localStorage.removeItem('activeTab');
  }, [activeTab]);

  const fetchFileTree = useCallback(async () => {
    if (!sandboxId) return;
    try {
      // Localhost API: const response = await fetch(`http://${sandboxId}.agent.localhost/list-files`);
      const response = await fetch(`https://${sandboxId}.agent.code-spaces.online/list-files`);
      if (response.ok) {
        const data = await response.json();
        const standardizedFiles = (data.files || []).map(standardizePath);
        setFiles(standardizedFiles);
      }
    } catch (err) {
      console.error('Error fetching file list:', err);
    }
  }, [sandboxId]);

  useEffect(() => {
    if (sandboxState === 'dashboard') {
      fetchFileTree();
    }
  }, [sandboxState, fetchFileTree]);

  const handleUpdateFileContent = (filePath, newContent) => {
    setUnsavedChanges(prev => ({
      ...prev,
      [filePath]: newContent
    }));
  };

  const handleSaveFile = async (filePath) => {
    const contentToSave = unsavedChanges[filePath];
    if (contentToSave === undefined) return;

    try {
      // Localhost API: const response = await fetch(`http://${sandboxId}.agent.localhost/update-files`, {
      const response = await fetch(`https://${sandboxId}.agent.code-spaces.online/update-files`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updates: [{ file: filePath, content: contentToSave }]
        })
      });

      if (response.ok) {
        setFileContents(prev => ({ ...prev, [filePath]: contentToSave }));
        setUnsavedChanges(prev => {
          const next = { ...prev };
          delete next[filePath];
          return next;
        });
        setPreviewKey(prev => prev + 1);
        toast.success(`Saved ${filePath}`);
      } else {
        const errData = await response.json().catch(() => ({}));
        toast.error(`Failed to save: ${errData.message || response.statusText}`);
      }
    } catch (err) {
      console.error(`Error saving file ${filePath}:`, err);
      toast.error(`Error saving file: ${err.message}`);
    }
  };

  const handleSelectFile = async (rawFilePath) => {
    const filePath = standardizePath(rawFilePath);
    if (!openTabs.includes(filePath)) {
      setOpenTabs(prev => [...prev, filePath]);
    }
    setActiveTab(filePath);

    if (fileContents[filePath] === undefined) {
      setIsLoadingFiles(true);
      try {
        // Localhost API: const response = await fetch(`http://${sandboxId}.agent.localhost/read-files?files=${filePath}`);
        const response = await fetch(`https://${sandboxId}.agent.code-spaces.online/read-files?files=${filePath}`);
        if (response.ok) {
          const data = await response.json();
          let content = '';
          if (data.files && data.files[0]) {
            const fileObj = data.files[0];
            content = fileObj[filePath] !== undefined ? fileObj[filePath] : (fileObj[filePath.slice(1)] || '');
          }
          setFileContents(prev => ({ ...prev, [filePath]: content }));
        } else {
          toast.error(`Failed to read file ${filePath}`);
        }
      } catch (err) {
        console.error(`Error reading file ${filePath}:`, err);
        toast.error(`Error reading file: ${err.message}`);
      } finally {
        setIsLoadingFiles(false);
      }
    }
  };

  const handleCloseTab = (rawTabPath) => {
    const tabPath = standardizePath(rawTabPath);
    const nextTabs = openTabs.filter(t => t !== tabPath);
    setOpenTabs(nextTabs);
    if (activeTab === tabPath) {
      setActiveTab(nextTabs.length > 0 ? nextTabs[nextTabs.length - 1] : 'preview');
    }
  };

  return (
    <FileSystemContext.Provider value={{
      files,
      fileContents,
      setFileContents,
      openTabs,
      activeTab,
      setActiveTab,
      modifiedFiles,
      setModifiedFiles,
      unsavedChanges,
      previewKey,
      setPreviewKey,
      isLoadingFiles,
      fetchFileTree,
      handleUpdateFileContent,
      handleSaveFile,
      handleSelectFile,
      handleCloseTab
    }}>
      {children}
    </FileSystemContext.Provider>
  );
}

export const useFileSystem = () => useContext(FileSystemContext);

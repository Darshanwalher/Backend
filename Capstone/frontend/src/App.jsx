import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { fetchCurrentUser } from './store/authSlice';
import { Cpu } from 'lucide-react';
import AppRoutes from './route';

const standardizePath = (path) => {
  if (!path) return '';
  return path.startsWith('/') ? path : '/' + path;
};

function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}


export default function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, status, user } = useSelector((state) => state.auth);

  const [initialChecked, setInitialChecked] = useState(false);

  const [sandboxState, setSandboxState] = useState(() => localStorage.getItem('sandboxState') || 'welcome'); // 'welcome' | 'provisioning' | 'dashboard'
  const [sandboxId, setSandboxId] = useState(() => localStorage.getItem('sandboxId') || null);
  const [previewUrl, setPreviewUrl] = useState(() => localStorage.getItem('previewUrl') || null);
  const [connectionStatus, setConnectionStatus] = useState(() => {
    const savedState = localStorage.getItem('sandboxState');
    return savedState === 'dashboard' ? 'connected' : 'disconnected';
  });

  useEffect(() => {
    dispatch(fetchCurrentUser()).finally(() => {
      setInitialChecked(true);
    });
  }, [dispatch]);

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
  const [modifiedFiles, setModifiedFiles] = useState([]); // Paths of files updated by AI

  // Resizable panel widths & height states
  const [explorerWidth, setExplorerWidth] = useState(220);
  const [chatWidth, setChatWidth] = useState(340);
  const [previewHeight, setPreviewHeight] = useState(260); // Default, updated dynamically in useEffect
  const [isDragging, setIsDragging] = useState(false);

  const centerRef = useRef(null);

  const [chatMessages, setChatMessages] = useState(() => {
    try {
      const stored = localStorage.getItem('chatMessages');
      return stored ? JSON.parse(stored) : [
        { role: 'assistant', content: 'Sandbox environment created successfully. Ask me to make changes to your codebase!' }
      ];
    } catch {
      return [
        { role: 'assistant', content: 'Sandbox environment created successfully. Ask me to make changes to your codebase!' }
      ];
    }
  });
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiLogs, setAiLogs] = useState([]);

  const [previewKey, setPreviewKey] = useState(0);

  // Initialize preview height dynamically on first load
  useEffect(() => {
    if (sandboxState === 'dashboard' && centerRef.current) {
      const rect = centerRef.current.getBoundingClientRect();
      setPreviewHeight(Math.round(rect.height * 0.6));
    }
  }, [sandboxState]);

  // Synchronize sandbox state and workspace to localStorage
  useEffect(() => {
    if (sandboxState) {
      localStorage.setItem('sandboxState', sandboxState);
    } else {
      localStorage.removeItem('sandboxState');
    }
  }, [sandboxState]);

  useEffect(() => {
    if (sandboxId) {
      localStorage.setItem('sandboxId', sandboxId);
    } else {
      localStorage.removeItem('sandboxId');
    }
  }, [sandboxId]);

  useEffect(() => {
    if (previewUrl) {
      localStorage.setItem('previewUrl', previewUrl);
    } else {
      localStorage.removeItem('previewUrl');
    }
  }, [previewUrl]);

  useEffect(() => {
    localStorage.setItem('openTabs', JSON.stringify(openTabs));
  }, [openTabs]);

  useEffect(() => {
    if (activeTab) {
      localStorage.setItem('activeTab', activeTab);
    } else {
      localStorage.removeItem('activeTab');
    }
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(chatMessages));
  }, [chatMessages]);

  // Hook layout resizing
  const useDrag = useCallback((onDrag) => {
    const startRef = useRef(null);

    const onMouseDown = useCallback((e, direction) => {
      e.preventDefault();
      setIsDragging(true);
      startRef.current = direction === 'col' ? e.clientX : e.clientY;

      const move = (moveE) => {
        const current = direction === 'col' ? moveE.clientX : moveE.clientY;
        const delta = current - startRef.current;
        startRef.current = current;
        onDrag(delta);
      };

      const up = () => {
        setIsDragging(false);
        window.removeEventListener('mousemove', move);
        window.removeEventListener('mouseup', up);
      };

      window.addEventListener('mousemove', move);
      window.addEventListener('mouseup', up);
    }, [onDrag]);

    return onMouseDown;
  }, []);

  const dragExplorer = useDrag((delta) =>
    setExplorerWidth(w => clamp(w + delta, 140, 420))
  );
  const dragChat = useDrag((delta) =>
    setChatWidth(w => clamp(w - delta, 260, 540))
  );
  const dragPreview = useDrag((delta) =>
    setPreviewHeight(h => {
      if (centerRef.current) {
        const rect = centerRef.current.getBoundingClientRect();
        return clamp(h + delta, 120, rect.height - 120);
      }
      return clamp(h + delta, 120, 600);
    })
  );

  const handleCreateSandbox = (sandboxInfo) => {
    setSandboxId(sandboxInfo.sandboxId);
    setPreviewUrl(sandboxInfo.previewUrl);
    setSandboxState('provisioning');
  };

  const handleProvisioningComplete = () => {
    setSandboxState('dashboard');
    setConnectionStatus('connected');
  };

  useEffect(() => {
    if (sandboxState !== 'dashboard') return;
    fetchFileTree();
  }, [sandboxState]);

  const fetchFileTree = async () => {
    try {
      const response = await fetch(`http://${sandboxId}.agent.localhost/list-files`);
      if (response.ok) {
        const data = await response.json();
        const standardizedFiles = (data.files || []).map(standardizePath);
        setFiles(standardizedFiles);
      }
    } catch (err) {
      console.error('Error fetching file list:', err);
    }
  };

  const handleSelectFile = async (rawFilePath) => {
    const filePath = standardizePath(rawFilePath);

    if (!openTabs.includes(filePath)) {
      setOpenTabs(prev => [...prev, filePath]);
    }
    setActiveTab(filePath);

    if (fileContents[filePath] === undefined) {
      try {
        const response = await fetch(`http://${sandboxId}.agent.localhost/read-files?files=${filePath}`);
        if (response.ok) {
          const data = await response.json();
          let content = '';
          if (data.files && data.files[0]) {
            const fileObj = data.files[0];
            content = fileObj[filePath] !== undefined ? fileObj[filePath] : (fileObj[filePath.slice(1)] || '');
          }
          setFileContents(prev => ({
            ...prev,
            [filePath]: content
          }));
        }
      } catch (err) {
        console.error(`Error reading file ${filePath}:`, err);
      }
    }
  };

  const handleSelectTab = (tabIdentifier) => {
    setActiveTab(tabIdentifier);
  };

  const handleCloseTab = (rawTabPath) => {
    const tabPath = standardizePath(rawTabPath);
    const nextTabs = openTabs.filter(t => t !== tabPath);
    setOpenTabs(nextTabs);
    if (activeTab === tabPath) {
      setActiveTab(nextTabs.length > 0 ? nextTabs[nextTabs.length - 1] : 'preview');
    }
  };

  const handleSendMessage = async (userPrompt) => {
    const userMsg = { role: 'user', content: userPrompt };
    setChatMessages(prev => [...prev, userMsg]);
    setIsAiLoading(true);

    let accumulatedLogs = ['Establishing SSE channel with agent...', 'Initializing AI model context...'];
    setAiLogs(accumulatedLogs);

    // --- SSE STREAM READER ---
    try {
      const response = await fetch('/api/ai/invoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          message: userPrompt,
          sandboxId: sandboxId
        })
      });

      if (!response.ok) {
        let errorMsg = `SSE request failed with status: ${response.status}`;
        try {
          const errData = await response.json();
          if (errData.error) errorMsg = errData.error;
        } catch (e) { }
        throw new Error(errorMsg);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let isDone = false;

      while (!isDone) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop();

        for (const part of parts) {
          const line = part.trim();
          if (!line || line.startsWith(':')) continue;

          const dataStr = line.startsWith('data: ') ? line.slice(6) : line;

          try {
            const event = JSON.parse(dataStr);

            if (event.type === 'log') {
              accumulatedLogs.push(event.message);
              setAiLogs([...accumulatedLogs]);

              // Detect file update events for the file tree highlight
              if (event.message.toLowerCase().includes('updating files')) {
                const filePart = event.message.split('...')[1] || '';
                const files = filePart.split(',').map(f => f.trim()).filter(Boolean);
                files.forEach(f => {
                  setModifiedFiles(prev => [...new Set([...prev, standardizePath(f)])]);
                });
              }

            } else if (event.type === 'chunk') {
              // We log this in a less spammy way to denote progress in the timeline
              accumulatedLogs.push('Processing response chunk...');
              setAiLogs([...accumulatedLogs]);

            } else if (event.type === 'done') {
              isDone = true;

            } else if (event.type === 'error') {
              throw new Error(event.message);
            }
          } catch (parseErr) {
            accumulatedLogs.push(dataStr);
            setAiLogs([...accumulatedLogs]);
          }
        }
      }

      accumulatedLogs.push('✅ AI invocation completed. Reloading workspace files...');
      setAiLogs([...accumulatedLogs]);

      await fetchFileTree();

      if (activeTab !== 'preview') {
        const activeRes = await fetch(`http://${sandboxId}.agent.localhost/read-files?files=${activeTab}`);
        if (activeRes.ok) {
          const activeData = await activeRes.json();
          let content = '';
          if (activeData.files && activeData.files[0]) {
            const fileObj = activeData.files[0];
            content = fileObj[activeTab] !== undefined ? fileObj[activeTab] : (fileObj[activeTab.slice(1)] || '');
          }
          setFileContents(prev => ({ ...prev, [activeTab]: content }));
        }
      }

      setPreviewKey(prev => prev + 1);

      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: `I've successfully processed the request and updated the files. Take a look at the code changes!`,
        logs: [...accumulatedLogs]
      }]);
      setIsAiLoading(false);

    } catch (err) {
      console.error('SSE connection error:', err);
      // To avoid cluttering the small timeline with a massive stack trace, only push the first line to logs
      accumulatedLogs.push(`❌ Error: ${err.message.split('\n')[0]}`);
      setAiLogs([...accumulatedLogs]);
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: `**Agent Invocation Failed:**\n\n\`\`\`plaintext\n${err.message}\n\`\`\``,
        logs: [...accumulatedLogs]
      }]);
      setIsAiLoading(false);
    }
  };

  const handleResetSandbox = () => {
    if (window.confirm('Are you sure you want to restart this sandbox? Unsaved files will be lost.')) {
      setSandboxState('welcome');
      setSandboxId(null);
      setPreviewUrl(null);
      setOpenTabs([]);
      setActiveTab('preview');
      setFileContents({});
      setModifiedFiles([]);
      setChatMessages([
        { role: 'assistant', content: 'Sandbox environment created successfully. Ask me to make changes to your codebase!' }
      ]);
      setPreviewKey(0);
      setPreviewHeight(260);
    }
  };

  if (!initialChecked) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#1e1e1e] font-mono select-none">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
            <svg className="spinner-ring w-full h-full absolute inset-0" viewBox="0 0 50 50">
              <circle
                cx="25"
                cy="25"
                fill="none"
                r="20"
                stroke="#569cd6"
                strokeDasharray="90, 150"
                strokeDashoffset="-35"
                strokeLinecap="round"
                strokeWidth="3"
              ></circle>
            </svg>
            <Cpu className="w-6 h-6 text-[#569cd6] animate-pulse" />
          </div>
          <p className="text-sm text-[#858585] tracking-wide animate-pulse">
            Verifying Authentication...
          </p>
        </div>
      </div>
    );
  }

  return (
    <AppRoutes
      isAuthenticated={isAuthenticated}
      sandboxState={sandboxState}
      sandboxId={sandboxId}
      previewUrl={previewUrl}
      connectionStatus={connectionStatus}
      files={files}
      fileContents={fileContents}
      openTabs={openTabs}
      activeTab={activeTab}
      modifiedFiles={modifiedFiles}
      explorerWidth={explorerWidth}
      chatWidth={chatWidth}
      previewHeight={previewHeight}
      isDragging={isDragging}
      chatMessages={chatMessages}
      isAiLoading={isAiLoading}
      aiLogs={aiLogs}
      previewKey={previewKey}
      dragExplorer={dragExplorer}
      dragChat={dragChat}
      dragPreview={dragPreview}
      handleCreateSandbox={handleCreateSandbox}
      handleProvisioningComplete={handleProvisioningComplete}
      handleSelectFile={handleSelectFile}
      handleSelectTab={handleSelectTab}
      handleCloseTab={handleCloseTab}
      handleSendMessage={handleSendMessage}
      handleResetSandbox={handleResetSandbox}
      centerRef={centerRef}
    />
  );
}

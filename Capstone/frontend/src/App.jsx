import React, { useState, useEffect, useRef, useCallback } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import ProvisioningScreen from './components/ProvisioningScreen';
import TopNav from './components/TopNav';
import FileExplorer from './components/FileExplorer';
import PreviewPanel from './components/PreviewPanel';
import TerminalPanel from './components/TerminalPanel';
import AIChatPanel from './components/AIChatPanel';

const standardizePath = (path) => {
  if (!path) return '';
  return path.startsWith('/') ? path : '/' + path;
};

function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

function DragHandle({ direction, onMouseDown }) {
  const isCol = direction === 'col';
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseDown={(e) => onMouseDown(e, direction)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width:  isCol ? '4px' : '100%',
        height: isCol ? '100%' : '4px',
        cursor: isCol ? 'col-resize' : 'row-resize',
        backgroundColor: hovered ? '#4ec9b0' : '#3e3e42',
        flexShrink: 0,
        transition: 'background-color 150ms ease',
        zIndex: 10,
        position: 'relative',
      }}
    >
      {/* invisible wider hit area for easier grabbing */}
      <div style={{
        position: 'absolute',
        top:    isCol ? 0    : '-6px',
        left:   isCol ? '-6px' : 0,
        right:  isCol ? '-6px' : 0,
        bottom: isCol ? 0    : '-6px',
        cursor: isCol ? 'col-resize' : 'row-resize',
      }} />
    </div>
  );
}

export default function App() {
  const [sandboxState, setSandboxState] = useState('welcome'); // 'welcome' | 'provisioning' | 'dashboard'
  const [sandboxId, setSandboxId] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  
  const [files, setFiles] = useState([]);
  const [fileContents, setFileContents] = useState({});
  const [openTabs, setOpenTabs] = useState([]);
  const [activeTab, setActiveTab] = useState('preview');
  const [modifiedFiles, setModifiedFiles] = useState([]); // Paths of files updated by AI

  // Resizable panel widths & height states
  const [explorerWidth, setExplorerWidth] = useState(220);
  const [chatWidth, setChatWidth] = useState(340);
  const [previewHeight, setPreviewHeight] = useState(260); // Default, updated dynamically in useEffect
  const [isDragging, setIsDragging] = useState(false);

  const centerRef = useRef(null);

  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: 'Sandbox environment created successfully. Ask me to make changes to your codebase!' }
  ]);
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
    setAiLogs(['Establishing SSE channel with agent...', 'Initializing AI model context...']);



    // --- REAL SSE STREAM READER ---
    try {
      const response = await fetch('/api/ai/invoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userPrompt,
          sandboxId: sandboxId
        })
      });

      if (!response.ok) {
        throw new Error(`SSE request failed with status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        buffer = lines.pop();

        for (const line of lines) {
          const cleanLine = line.trim();
          if (cleanLine) {
            setAiLogs(prev => [...prev, cleanLine]);

            if (cleanLine.toLowerCase().includes('updating files')) {
              const filePart = cleanLine.split('updating files...')[1] || cleanLine.split('Updating files...')[1] || '';
              const cleanedFilePart = filePart.trim();
              if (cleanedFilePart) {
                setModifiedFiles(prev => [...new Set([...prev, standardizePath(cleanedFilePart)])]);
              }
            }
          }
        }
      }

      setAiLogs(prev => [...prev, 'AI invocation completed. Reloading workspace files...']);
      
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
        content: `I've successfully processed the request and updated the files. Take a look at the code changes!`
      }]);
      setIsAiLoading(false);

    } catch (err) {
      console.error('SSE connection error:', err);
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: `Sorry, there was an issue communicating with the AI invoke endpoint: ${err.message}`
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

  if (sandboxState === 'welcome') {
    return (
      <WelcomeScreen
        onCreateSandbox={handleCreateSandbox}
      />
    );
  }

  if (sandboxState === 'provisioning') {
    return (
      <ProvisioningScreen
        sandboxId={sandboxId}
        onComplete={handleProvisioningComplete}
      />
    );
  }

  return (
    <div 
      className="flex flex-col h-screen w-screen overflow-hidden bg-[#1e1e1e] text-[#d4d4d4]"
      style={{ userSelect: isDragging ? 'none' : 'auto' }}
    >
      {/* Top Nav (48px height) */}
      <TopNav
        sandboxId={sandboxId}
        onResetSandbox={handleResetSandbox}
        connectionStatus={connectionStatus}
      />

      {/* Main split resizable space */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left panel */}
        <div
          className="flex-shrink-0 overflow-hidden bg-[#252526] border-r border-[#3e3e42] flex flex-col h-full"
          style={{ width: explorerWidth }}
        >
          <FileExplorer
            files={files}
            activeFile={activeTab}
            onSelectFile={handleSelectFile}
            modifiedFiles={modifiedFiles}
          />
        </div>

        {/* Drag handle — explorer | center */}
        <DragHandle direction="col" onMouseDown={dragExplorer} />

        {/* Center column */}
        <div ref={centerRef} className="flex flex-col flex-1 min-w-0 overflow-hidden bg-[#1e1e1e]">
          
          {/* Editor / Preview tabs */}
          <div
            className="flex-shrink-0 overflow-hidden border-b border-[#3e3e42]"
            style={{ height: previewHeight }}
          >
            <PreviewPanel
              key={`${previewKey}-${activeTab}`}
              previewUrl={previewUrl}
              fileContents={fileContents}
              openTabs={openTabs}
              activeTab={activeTab}
              onSelectTab={handleSelectTab}
              onCloseTab={handleCloseTab}
              activeFile={activeTab !== 'preview' ? activeTab : null}
              modifiedFiles={modifiedFiles}
              isDragging={isDragging}
            />
          </div>

          {/* Drag handle — preview | terminal */}
          <DragHandle direction="row" onMouseDown={dragPreview} />

          {/* Terminal */}
          <div className="flex-grow flex-1 overflow-hidden min-h-[120px]">
            <TerminalPanel
              sandboxId={sandboxId}
            />
          </div>

        </div>

        {/* Drag handle — center | chat */}
        <DragHandle direction="col" onMouseDown={dragChat} />

        {/* Right panel */}
        <div
          className="flex-shrink-0 overflow-hidden bg-[#252526] border-l border-[#3e3e42] flex flex-col h-full"
          style={{ width: chatWidth }}
        >
          <AIChatPanel
            chatMessages={chatMessages}
            onSendMessage={handleSendMessage}
            isAiLoading={isAiLoading}
            aiLogs={aiLogs}
          />
        </div>

      </div>

      {/* Footer status bar */}
      <footer className="h-6 bg-[#252526] border-t border-[#3e3e42] text-[#858585] font-mono text-[10px] font-semibold flex items-center justify-between px-4 z-40 select-none">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4ec9b0]"></span>
            Host: codespace.localhost
          </span>
        </div>
        <span>UTF-8 • Line endings: LF</span>
      </footer>
    </div>
  );
}

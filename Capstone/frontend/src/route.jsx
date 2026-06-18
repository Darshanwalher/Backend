import { useState, useRef, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import WelcomeScreen from './components/WelcomeScreen';
import ProvisioningScreen from './components/ProvisioningScreen';
import TopNav from './components/TopNav';
import FileExplorer from './components/FileExplorer';
import PreviewPanel from './components/PreviewPanel';
import TerminalPanel from './components/TerminalPanel';
import AIChatPanel from './components/AIChatPanel';
import { useSandbox } from './context/SandboxContext';
import { useLayoutDrag, clamp } from './hooks/useLayoutDrag';

function DragHandle({ direction, onMouseDown }) {
  const isCol = direction === 'col';
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseDown={(e) => onMouseDown(e, direction)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: isCol ? '4px' : '100%',
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
        top: isCol ? 0 : '-6px',
        left: isCol ? '-6px' : 0,
        right: isCol ? '-6px' : 0,
        bottom: isCol ? 0 : '-6px',
        cursor: isCol ? 'col-resize' : 'row-resize',
      }} />
    </div>
  );
}

export default function AppRoutes({ isAuthenticated }) {
  const { sandboxState, sandboxId, handleCreateSandbox, handleProvisioningComplete } = useSandbox();

  const [explorerWidth, setExplorerWidth] = useState(220);
  const [chatWidth, setChatWidth] = useState(340);
  const [previewHeight, setPreviewHeight] = useState(260);
  const centerRef = useRef(null);

  useEffect(() => {
    if (sandboxState === 'dashboard' && centerRef.current) {
      const rect = centerRef.current.getBoundingClientRect();
      setPreviewHeight(Math.round(rect.height * 0.6));
    }
  }, [sandboxState]);

  const { isDragging: isDraggingExplorer, onMouseDown: dragExplorer } = useLayoutDrag((delta) =>
    setExplorerWidth(w => clamp(w + delta, 140, 420))
  );
  const { isDragging: isDraggingChat, onMouseDown: dragChat } = useLayoutDrag((delta) =>
    setChatWidth(w => clamp(w - delta, 260, 540))
  );
  const { isDragging: isDraggingPreview, onMouseDown: dragPreview } = useLayoutDrag((delta) =>
    setPreviewHeight(h => {
      if (centerRef.current) {
        const rect = centerRef.current.getBoundingClientRect();
        return clamp(h + delta, 120, rect.height - 120);
      }
      return clamp(h + delta, 120, 600);
    })
  );

  const isDragging = isDraggingExplorer || isDraggingChat || isDraggingPreview;

  return (
    <Routes>
      {!isAuthenticated ? (
        <>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      ) : (
        <>
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/register" element={<Navigate to="/" replace />} />
          <Route
            path="/"
            element={
              sandboxState === 'welcome' ? (
                <WelcomeScreen onCreateSandbox={handleCreateSandbox} />
              ) : sandboxState === 'provisioning' ? (
                <ProvisioningScreen sandboxId={sandboxId} onComplete={handleProvisioningComplete} />
              ) : (
                <div
                  className="flex flex-col h-screen w-screen overflow-hidden bg-[#1e1e1e] text-[#d4d4d4]"
                  style={{ userSelect: isDragging ? 'none' : 'auto' }}
                >
                  <TopNav />

                  <div className="flex flex-1 overflow-hidden">
                    <div
                      className="flex-shrink-0 overflow-hidden bg-[#252526] border-r border-[#3e3e42] flex flex-col h-full"
                      style={{ width: explorerWidth }}
                    >
                      <FileExplorer />
                    </div>

                    <DragHandle direction="col" onMouseDown={dragExplorer} />

                    <div ref={centerRef} className="flex flex-col flex-1 min-w-0 overflow-hidden bg-[#1e1e1e]">
                      <div
                        className="flex-shrink-0 overflow-hidden border-b border-[#3e3e42]"
                        style={{ height: previewHeight }}
                      >
                        <PreviewPanel isDragging={isDragging} />
                      </div>

                      <DragHandle direction="row" onMouseDown={dragPreview} />

                      <div className="flex-grow flex-1 overflow-hidden min-h-[120px]">
                        <TerminalPanel />
                      </div>
                    </div>

                    <DragHandle direction="col" onMouseDown={dragChat} />

                    <div
                      className="flex-shrink-0 overflow-hidden bg-[#252526] border-l border-[#3e3e42] flex flex-col h-full"
                      style={{ width: chatWidth }}
                    >
                      <AIChatPanel />
                    </div>
                  </div>

                  <footer className="h-6 bg-[#252526] border-t border-[#3e3e42] text-[#858585] font-mono text-[10px] font-semibold flex items-center justify-between px-4 z-40 select-none">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#4ec9b0]"></span>
                        {/* Localhost Host: codespace.localhost */}
                        Host: code-spaces.online
                      </span>
                    </div>
                    <span>UTF-8 • Line endings: LF</span>
                  </footer>
                </div>
              )
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      )}
    </Routes>
  );
}

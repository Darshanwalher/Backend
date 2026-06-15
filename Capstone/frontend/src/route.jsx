import { useState } from 'react';
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

export default function AppRoutes({
  isAuthenticated,
  sandboxState,
  sandboxId,
  previewUrl,
  connectionStatus,
  files,
  fileContents,
  openTabs,
  activeTab,
  modifiedFiles,
  explorerWidth,
  chatWidth,
  previewHeight,
  isDragging,
  chatMessages,
  isAiLoading,
  aiLogs,
  previewKey,
  dragExplorer,
  dragChat,
  dragPreview,
  handleCreateSandbox,
  handleProvisioningComplete,
  handleSelectFile,
  handleSelectTab,
  handleCloseTab,
  handleSendMessage,
  handleResetSandbox,
  centerRef
}) {
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
              )
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      )}
    </Routes>
  );
}

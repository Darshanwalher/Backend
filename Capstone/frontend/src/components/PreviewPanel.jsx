import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, ExternalLink, Globe, Eye, FileCode, X, ArrowLeft, ArrowRight } from 'lucide-react';
import Editor from '@monaco-editor/react';

function splitHighlightedHtml(html) {
  const lines = html.split('\n');
  const result = [];
  let openTags = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    let prefix = openTags.map(tag => `<span class="${tag}">`).join('');
    
    const regex = /<span class="([^"]+)">/g;
    let match;
    const lineOpenTags = [];
    while ((match = regex.exec(line)) !== null) {
      lineOpenTags.push(match[1]);
    }
    
    const closeCount = (line.match(/<\/span>/g) || []).length;
    
    openTags = openTags.concat(lineOpenTags);
    for (let j = 0; j < closeCount; j++) {
      openTags.pop();
    }

    let suffix = '</span>'.repeat(openTags.length);
    result.push(prefix + line + suffix);
  }
  return result;
}

const getEditorLanguage = (filename) => {
  if (!filename) return 'plaintext';
  if (filename.endsWith('.jsx') || filename.endsWith('.js')) return 'javascript';
  if (filename.endsWith('.json')) return 'json';
  if (filename.endsWith('.css')) return 'css';
  if (filename.endsWith('.html')) return 'html';
  if (filename.endsWith('.md')) return 'markdown';
  return 'plaintext';
};

export default function PreviewPanel({
  previewUrl,
  fileContents,
  openTabs,
  activeTab,
  onSelectTab,
  onCloseTab,
  activeFile,
  modifiedFiles = [],
  unsavedChanges = {},
  onUpdateFileContent,
  onSaveFile,
  isDragging
}) {
  const [iframeKey, setIframeKey] = useState(0);
  const [urlBar, setUrlBar] = useState('');
  const [hljsReady, setHljsReady] = useState(false);
  const [activeLine, setActiveLine] = useState(null);

  const saveFileRef = useRef(onSaveFile);
  const activeTabRef = useRef(activeTab);

  useEffect(() => {
    saveFileRef.current = onSaveFile;
    activeTabRef.current = activeTab;
  });

  useEffect(() => {
    if (window.hljs) {
      setHljsReady(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js';
    script.async = true;
    script.onload = () => setHljsReady(true);
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    setActiveLine(null);
  }, [activeTab]);

  useEffect(() => {
    if (previewUrl) {
      setUrlBar(previewUrl);
    }
  }, [previewUrl]);

  const handleRefresh = () => {
    setIframeKey(prev => prev + 1);
  };

  const getFileTabColor = (name) => {
    if (name.endsWith('.jsx') || name.endsWith('.js')) return 'text-[#569cd6]';
    if (name.endsWith('.css')) return 'text-[#ce9178]';
    if (name.endsWith('.json')) return 'text-[#dcdcaa]';
    return 'text-[#d4d4d4]';
  };

  const highlightCode = (content, filename) => {
    if (!hljsReady || !window.hljs) return content;
    
    let lang = 'plaintext';
    if (filename) {
      if (filename.endsWith('.jsx') || filename.endsWith('.js')) lang = 'javascript';
      else if (filename.endsWith('.json')) lang = 'json';
      else if (filename.endsWith('.css')) lang = 'css';
      else if (filename.endsWith('.html')) lang = 'xml';
      else if (filename.endsWith('.md')) lang = 'markdown';
    }
    
    try {
      return window.hljs.highlight(content, { language: lang }).value;
    } catch (e) {
      console.error('Highlight error:', e);
      return content;
    }
  };

  const activeFileContent = fileContents[activeTab] || '';
  const highlightedHtml = highlightCode(activeFileContent, activeTab);
  const highlightedLines = hljsReady ? splitHighlightedHtml(highlightedHtml) : activeFileContent.split('\n');

  return (
    <div className="flex-grow flex flex-col h-full bg-[#1e1e1e] overflow-hidden select-none">
      {/* 1. Tab Bar */}
      <div className="h-10 bg-[#2d2d30] border-b border-[#3e3e42] flex items-center justify-between shrink-0 overflow-x-auto no-scrollbar">
        <div className="flex h-full items-center">
          {/* Preview Tab */}
          <button
            onClick={() => onSelectTab('preview')}
            className={`h-full px-4 flex items-center gap-2 border-r border-[#3e3e42] cursor-pointer transition-all duration-200 font-mono text-xs select-none focus:outline-none focus:ring-1 focus:ring-[#007fd4] ${
              activeTab === 'preview'
                ? 'bg-[#1e1e1e] text-[#d4d4d4] font-semibold border-t-2 border-t-[#4ec9b0]'
                : 'bg-[#2d2d30] text-[#858585] hover:bg-[#2a2d2e]'
            }`}
          >
            <Eye className={`w-3.5 h-3.5 ${activeTab === 'preview' ? 'text-[#4ec9b0]' : 'text-[#858585]'}`} />
            <span>Preview</span>
          </button>

          {/* Opened File Tabs */}
          {openTabs.map(tabPath => {
            const isActive = tabPath === activeTab;
            const filename = tabPath.split('/').pop();
            const isTabModified = modifiedFiles.includes(tabPath);
            const hasUnsaved = unsavedChanges[tabPath] !== undefined;
            return (
              <div
                key={tabPath}
                onClick={() => onSelectTab(tabPath)}
                className={`h-full px-4 flex items-center gap-2 border-r border-[#3e3e42] cursor-pointer transition-all duration-200 font-mono text-xs select-none focus:outline-none focus:ring-1 focus:ring-[#007fd4] ${
                  isActive
                    ? 'bg-[#1e1e1e] text-[#d4d4d4] font-semibold border-t-2 border-t-[#4ec9b0]'
                    : 'bg-[#2d2d30] text-[#858585] hover:bg-[#2a2d2e]'
                }`}
              >
                <FileCode className={`w-3.5 h-3.5 ${isActive ? 'text-[#4ec9b0]' : getFileTabColor(filename)}`} />
                <span className={isActive ? 'text-[#d4d4d4]' : 'text-[#858585]'}>{filename}</span>
                {isTabModified && (
                  <span className="text-[#e2c08d] text-[10px] pl-0.5 font-bold" title="Modified by AI">●</span>
                )}
                {hasUnsaved && (
                  <span className="text-[#569cd6] text-[10px] pl-0.5 animate-pulse font-bold" title="Unsaved changes">●</span>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(tabPath);
                  }}
                  className="p-0.5 rounded hover:bg-[#252526]/80 text-[#858585] hover:text-[#f44747] transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Workspace Body */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {activeTab === 'preview' ? (
          /* Preview Tab Content */
          <div className="flex-grow flex flex-col h-full bg-[#1e1e1e]">
            {/* Browser address bar */}
            <div className="h-10 px-3 bg-[#252526] border-b border-[#3e3e42] flex items-center gap-2 shrink-0">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#3e3e42]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#3e3e42]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#3e3e42]" />
              </div>

              <div className="flex gap-0.5 ml-2">
                <button className="p-1 text-[#858585]/20 rounded cursor-not-allowed">
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
                <button className="p-1 text-[#858585]/20 rounded cursor-not-allowed">
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleRefresh}
                  className="p-1 hover:bg-[#2d2d30] hover:text-[#d4d4d4] text-[#858585] rounded transition-all duration-200 ease-in-out cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#007fd4]"
                  title="Reload Preview"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* URL address bar */}
              <div className="flex-grow flex items-center gap-1.5 px-3 py-1 bg-[#3c3c3c] border border-[#3e3e42] rounded-md text-xs font-mono">
                <Globe className="w-3.5 h-3.5 text-[#858585] shrink-0" />
                <input
                  type="text"
                  readOnly
                  value={urlBar}
                  className="w-full bg-transparent text-[#d4d4d4] focus:outline-none select-all"
                />
              </div>

              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 hover:bg-[#2d2d30] hover:text-[#d4d4d4] text-[#858585] rounded transition-all duration-200 ease-in-out cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#007fd4]"
                title="Open in New Tab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Embedded Screen Canvas */}
            <div className="flex-grow bg-[#1e1e1e] relative overflow-hidden flex flex-col">
              {/* Live sandbox frame with drag overlay protection */}
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <iframe
                  key={iframeKey}
                  src={previewUrl}
                  title="Sandbox Live Preview"
                  style={{ width: '100%', height: '100%', border: 'none' }}
                />
                {isDragging && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    zIndex: 20, background: 'transparent',
                    cursor: 'inherit'
                  }} />
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Interactive Code Editor Tab Content */
          <div className="flex-grow flex flex-col h-full bg-[#1e1e1e] overflow-hidden">
            {/* Header path details & Save actions */}
            <div className="h-8 px-4 bg-[#252526] border-b border-[#3e3e42] flex items-center justify-between shrink-0 font-mono text-[10px] text-[#858585] select-none">
              <span>Path: {activeTab}</span>
              <div className="flex items-center gap-3">
                {unsavedChanges[activeTab] !== undefined && (
                  <button
                    onClick={() => onSaveFile(activeTab)}
                    className="px-2 py-0.5 bg-[#007fd4] hover:bg-[#1f8ad2] text-white rounded font-sans text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer focus:outline-none"
                  >
                    Save Changes (Ctrl+S)
                  </button>
                )}
                <span className="uppercase text-[#858585] text-[9px] tracking-wider font-semibold bg-[#1e1e1e] px-1.5 py-0.5 rounded border border-[#3e3e42]">
                  Monaco Editor
                </span>
              </div>
            </div>

            {/* Monaco Editor Container */}
            <div className="flex-grow h-full bg-[#1e1e1e] overflow-hidden relative">
              <Editor
                height="100%"
                theme="vs-dark"
                language={getEditorLanguage(activeTab)}
                value={unsavedChanges[activeTab] !== undefined ? unsavedChanges[activeTab] : activeFileContent}
                onChange={(val) => onUpdateFileContent(activeTab, val || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  tabSize: 2,
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                }}
                onMount={(editor, monaco) => {
                  editor.addCommand(
                    monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
                    () => {
                      if (saveFileRef.current && activeTabRef.current) {
                        saveFileRef.current(activeTabRef.current);
                      }
                    }
                  );
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

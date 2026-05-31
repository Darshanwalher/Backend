import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, ExternalLink, Globe, Eye, FileCode, X, ArrowLeft, ArrowRight } from 'lucide-react';

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

export default function PreviewPanel({
  previewUrl,
  isMockMode,
  fileContents,
  openTabs,
  activeTab,
  onSelectTab,
  onCloseTab,
  activeFile,
  modifiedFiles = [],
  isDragging
}) {
  const [iframeKey, setIframeKey] = useState(0);
  const [urlBar, setUrlBar] = useState('');
  const [mockAppCount, setMockAppCount] = useState(0);
  const [hljsReady, setHljsReady] = useState(false);
  const [activeLine, setActiveLine] = useState(null);

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

  const getMockText = () => {
    try {
      const content = fileContents['src/App.jsx'] || fileContents['/src/App.jsx'] || '';
      const h1Match = content.match(/<h1>(.*?)<\/h1>/);
      if (h1Match && h1Match[1]) {
        return h1Match[1].replace(/\{.*?\}/g, '').trim() || 'Get started';
      }
      
      const textMatch = content.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
      if (textMatch && textMatch[1]) {
        return textMatch[1].replace(/\{.*?\}/g, '').trim() || 'Get started';
      }
    } catch (e) {}
    return 'Get started';
  };

  const getMockButtonLabel = () => {
    try {
      const content = fileContents['src/App.jsx'] || fileContents['/src/App.jsx'] || '';
      const buttonMatch = content.match(/<button[^>]*>([\s\S]*?)<\/button>/);
      if (buttonMatch && buttonMatch[1]) {
        return buttonMatch[1].replace(/\{count\}/g, mockAppCount).trim();
      }
    } catch (e) {}
    return `Count is ${mockAppCount}`;
  };

  const handleScroll = () => {
    if (textareaRef.current && gutterRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
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
                  <span className="text-[#e2c08d] text-[10px] pl-0.5" title="Modified by AI">●</span>
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
              {isMockMode ? (
                /* High-Fidelity Mock UI rendering */
                <div className="absolute inset-0 bg-[#1e1e1e] text-[#858585] flex flex-col font-sans select-none overflow-y-auto">
                  <div className="bg-[#252526] px-4 py-2 border-b border-[#3e3e42] flex items-center justify-between text-[11px] font-mono text-[#858585]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4ec9b0] animate-pulse" />
                      <span className="text-[#d4d4d4] font-semibold">Demo Sandbox Port: 5173</span>
                    </div>
                    <span className="text-[#6a9955]">HMR: ACTIVE</span>
                  </div>

                  <div className="flex-grow flex-1 flex flex-col items-center justify-center p-8 text-center text-[#d4d4d4] relative">
                    {/* Add drag protection over mock preview area just in case */}
                    {isDragging && (
                      <div style={{
                        position: 'absolute', inset: 0,
                        zIndex: 20, background: 'transparent',
                        cursor: 'inherit'
                      }} />
                    )}
                    <div className="mb-6 relative flex justify-center">
                      <div className="w-16 h-16 rounded-full border border-[#3e3e42] flex items-center justify-center relative bg-[#252526]">
                        <div className="w-12 h-5 border border-[#4ec9b0]/40 rounded-full absolute rotate-45 animate-pulse" />
                        <div className="w-12 h-5 border border-[#4ec9b0]/40 rounded-full absolute -rotate-45 animate-pulse" />
                        <div className="w-2.5 h-2.5 bg-[#4ec9b0] rounded-full" />
                      </div>
                    </div>

                    <div className="space-y-2 mb-6">
                      <h1 className="text-2xl font-bold text-white tracking-tight">
                        {getMockText()}
                      </h1>
                      <p className="text-xs text-[#858585] max-w-sm mx-auto font-mono">
                        Edit <code className="bg-[#252526] text-[#4ec9b0] px-1 py-0.5 rounded font-mono border border-[#3e3e42]">src/App.jsx</code> and save to test Hot Module Replacement.
                      </p>
                    </div>

                    <button
                      onClick={() => setMockAppCount(prev => prev + 1)}
                      className="bg-[#2d2d30] border border-[#3e3e42] hover:border-[#4ec9b0]/50 hover:text-[#4ec9b0] text-[#d4d4d4] font-mono text-xs rounded py-2 px-4 active:scale-95 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#007fd4]"
                    >
                      {getMockButtonLabel()}
                    </button>

                    <div className="mt-8 border-t border-[#3e3e42] pt-4 w-full max-w-xs text-[9px] text-[#858585] font-mono space-y-0.5">
                      <p>Status: Compiles successfully</p>
                      <p>HMR latency: 3ms</p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Live sandbox frame with drag overlay protection */
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                  <iframe
                    key={iframeKey}
                    src={previewUrl}
                    title="Sandbox Live Preview"
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-same-origin allow-scripts allow-top-navigation-by-user-activation"
                  />
                  {isDragging && (
                    <div style={{
                      position: 'absolute', inset: 0,
                      zIndex: 20, background: 'transparent',
                      cursor: 'inherit'
                    }} />
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Read-only Code View Tab Content */
          <div className="flex-grow flex flex-col h-full bg-[#1e1e1e] overflow-hidden">
            {/* Header path details */}
            <div className="h-8 px-4 bg-[#252526] border-b border-[#3e3e42] flex items-center justify-between shrink-0 font-mono text-[10px] text-[#858585]">
              <span>Path: {activeTab}</span>
              <span className="uppercase text-[#858585] text-[9px] tracking-wider font-semibold bg-[#1e1e1e] px-1.5 py-0.5 rounded border border-[#3e3e42]">
                Syntax Highlighted (Read-Only)
              </span>
            </div>

            {/* Syntax Highlighted Viewport */}
            <div className="flex-grow overflow-auto custom-scrollbar bg-[#1e1e1e] font-mono text-[13px] leading-[1.6] py-3 text-[#d4d4d4] tab-size-2 select-text h-full">
              {highlightedLines.map((lineHtml, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveLine(idx)}
                  className={`flex items-start w-full min-w-max leading-[1.6] hover:bg-[#252526]/50 cursor-text select-text ${
                    activeLine === idx ? 'bg-[#2a2d2e]' : ''
                  }`}
                >
                  {/* Line Number Gutter */}
                  <span className="w-10 pr-4 text-right text-[#858585] select-none font-mono text-[13px] flex-shrink-0 border-r border-[#3e3e42]/20">
                    {idx + 1}
                  </span>
                  
                  {/* Highlighted Code Line */}
                  <pre className="pl-4 font-mono text-[13px] whitespace-pre select-text flex-1 hljs m-0 p-0 border-0 outline-none">
                    <code
                      className="font-mono text-[13px] select-text"
                      dangerouslySetInnerHTML={{ __html: lineHtml || '&nbsp;' }}
                    />
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

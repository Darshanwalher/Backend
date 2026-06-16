import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Bot, Terminal, Sparkles, Code, CheckCircle2, 
  AlertCircle, ChevronRight, ChevronDown, Copy, Check, 
  History, X, Trash2, Cpu 
} from 'lucide-react';
import { useAIChat } from '../context/AIChatContext';

// --- UTILITIES FOR PARSING SSE LOGS ---
const parseLogs = (logs) => {
  const steps = [
    { id: 'init', name: 'Initialize AI Agent', status: 'idle', details: '' },
    { id: 'scan', name: 'Explore Workspace Tree', status: 'idle', details: '' },
    { id: 'read', name: 'Read Context Files', status: 'idle', details: '' },
    { id: 'write', name: 'Apply Code Changes', status: 'idle', details: '' },
    { id: 'complete', name: 'Sync Sandbox Environment', status: 'idle', details: '' }
  ];

  if (!logs || logs.length === 0) return steps;

  steps[0].status = 'success';
  steps[0].details = 'Agent connection established';

  logs.forEach(log => {
    const lower = log.toLowerCase();

    // Scan
    if (lower.includes('listing files')) {
      steps[1].status = 'running';
      steps[1].details = 'Scanning files...';
    } else if (lower.includes('files listed successfully')) {
      steps[1].status = 'success';
      const match = log.match(/files:\s*(.*)/i);
      if (match && match[1]) {
        const fileCount = match[1].split(',').filter(Boolean).length;
        steps[1].details = `Found ${fileCount} files`;
      } else {
        steps[1].details = 'Scan completed';
      }
    }

    // Read
    if (lower.includes('reading files')) {
      steps[2].status = 'running';
      const filePart = log.split('Reading files...')[1] || log.split('reading files...')[1] || '';
      steps[2].details = `Reading: ${filePart.trim()}`;
      if (steps[1].status === 'running' || steps[1].status === 'idle') steps[1].status = 'success';
    } else if (lower.includes('files read successfully')) {
      steps[2].status = 'success';
      steps[2].details = 'Context files loaded';
    }

    // Write
    if (lower.includes('updating files')) {
      steps[3].status = 'running';
      const filePart = log.split('Updating files...')[1] || log.split('updating files...')[1] || '';
      steps[3].details = `Writing: ${filePart.trim()}`;
      if (steps[1].status !== 'success') steps[1].status = 'success';
      if (steps[2].status !== 'success') steps[2].status = 'success';
    } else if (lower.includes('files updated successfully')) {
      steps[3].status = 'success';
      steps[3].details = 'File modifications applied';
    }

    // Complete
    if (lower.includes('completed') || lower.includes('invocation completed')) {
      steps[4].status = 'success';
      steps[4].details = 'Workspace reloaded successfully';
      if (steps[3].status === 'running' || steps[3].status === 'idle') steps[3].status = 'success';
    }

    // Errors
    if (lower.includes('error') || lower.includes('failed')) {
      let errorAssigned = false;
      for (let i = 0; i < steps.length; i++) {
        if (steps[i].status === 'running') {
          steps[i].status = 'error';
          steps[i].details = log;
          errorAssigned = true;
          break;
        }
      }
      if (!errorAssigned) {
        let target = steps.findIndex(s => s.status === 'idle');
        if (target === -1) target = steps.length - 1;
        steps[target].status = 'error';
        steps[target].details = log;
      }
    }
  });

  // Backward correction
  let latestActive = 0;
  let hasError = false;
  
  for (let i = 0; i < steps.length; i++) {
    if (steps[i].status === 'error') {
      latestActive = i;
      hasError = true;
      break;
    } else if (steps[i].status === 'running' || steps[i].status === 'success') {
      latestActive = i;
    }
  }

  // Mark all steps BEFORE the latest active as success
  for (let i = 0; i < latestActive; i++) {
    if (steps[i].status === 'idle' || steps[i].status === 'running') {
      steps[i].status = 'success';
      if (!steps[i].details) steps[i].details = 'Done';
    }
  }

  // If there's no error and the latest step is idle, make it running
  if (!hasError && steps[latestActive].status === 'idle') {
    steps[latestActive].status = 'running';
  }

  return steps;
};

// --- SYNTAX HIGHLIGHTER FALLBACK ---
const highlightCode = (code, lang) => {
  let escaped = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  if (window.hljs) {
    try {
      return window.hljs.highlight(code, { language: lang || 'plaintext' }).value;
    } catch {
      return escaped;
    }
  }
  
  if (lang === 'javascript' || lang === 'js' || lang === 'jsx') {
    escaped = escaped.replace(/\b(const|let|var|function|return|import|export|default|from|if|else|for|while|async|await|try|catch|class|extends|new|null|undefined)\b/g, '<span class="text-[#569cd6]">$1</span>');
    escaped = escaped.replace(/(['"`])(.*?)\1/g, '<span class="text-[#ce9178]">$1$2$1</span>');
    escaped = escaped.replace(/(\/\/.*)/g, '<span class="text-[#6a9955]">$1</span>');
    escaped = escaped.replace(/\b(\d+)\b/g, '<span class="text-[#b5cea8]">$1</span>');
  } else if (lang === 'css') {
    escaped = escaped.replace(/([.#][\w-]+)/g, '<span class="text-[#d7ba7d]">$1</span>');
    escaped = escaped.replace(/([\w-]+)\s*:/g, '<span class="text-[#9cdcfe]">$1</span>:');
    escaped = escaped.replace(/:\s*([^;]+);/g, ': <span class="text-[#ce9178]">$1</span>;');
  }
  return escaped;
};

// --- SUB-COMPONENT: CODE BLOCK WITH COPY ---
function CodeBlock({ lang, code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const highlightedHtml = highlightCode(code, lang);

  return (
    <div className="my-3.5 border border-[#2d2d30] hover:border-[#3e3e42] rounded-xl overflow-hidden bg-[#151518] shadow-lg select-text transition-all duration-300">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#1b1b1f] border-b border-[#2d2d30] select-none text-[10px] font-mono text-[#a1a1aa]">
        {/* macOS control dots and Lang Title */}
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#ff5f56]/80 hover:bg-[#ff5f56]" />
            <span className="w-2 h-2 rounded-full bg-[#ffbd2e]/80 hover:bg-[#ffbd2e]" />
            <span className="w-2 h-2 rounded-full bg-[#27c93f]/80 hover:bg-[#27c93f]" />
          </div>
          <div className="h-3.5 w-[1px] bg-[#2d2d30] mx-1" />
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <Code className="w-3.5 h-3.5 text-[#569cd6]" />
            <span className="uppercase tracking-wider text-[10px] font-semibold">{lang || 'code'}</span>
          </div>
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          type="button"
          className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-[#252529] hover:text-[#d4d4d4] transition-all duration-200 focus:outline-none cursor-pointer text-[10px] active:scale-95"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#4ec9b0]" />
              <span className="text-[#4ec9b0] font-medium">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      {/* Code Area */}
      <div className="p-3.5 overflow-x-auto custom-scrollbar text-[11px] font-mono leading-relaxed bg-[#121214]">
        <pre className="hljs p-0 m-0 bg-transparent">
          <code dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
        </pre>
      </div>
    </div>
  );
}

// --- SUB-COMPONENT: INLINE MARKDOWN PARSER ---
function parseInline(line) {
  const regex = /(\*\*.*?\*\*|`.*?`)/g;
  const parts = line.split(regex);
  
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="text-[#f5f5f5] font-semibold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={index} className="px-1.5 py-0.5 rounded bg-[#151518] border border-[#2c2c30] text-[10.5px] font-mono text-[#e2c08d]">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

function TextSection({ text }) {
  const lines = text.split('\n');
  
  return lines.map((line, lIdx) => {
    if (!line.trim()) return <div key={lIdx} className="h-2" />;

    // Headers
    if (line.startsWith('### ')) {
      return <h3 key={lIdx} className="text-xs font-semibold text-[#f5f5f5] mt-3.5 mb-1.5 tracking-wide">{parseInline(line.slice(4))}</h3>;
    }
    if (line.startsWith('## ')) {
      return <h2 key={lIdx} className="text-sm font-bold text-[#f5f5f5] mt-4 mb-2 border-b border-[#2d2d30] pb-1">{parseInline(line.slice(3))}</h2>;
    }
    if (line.startsWith('# ')) {
      return <h1 key={lIdx} className="text-base font-black text-[#f5f5f5] mt-5 mb-2.5 border-b border-[#2d2d30] pb-1.5">{parseInline(line.slice(2))}</h1>;
    }

    // Bullet lists
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const content = line.trim().slice(2);
      return (
        <div key={lIdx} className="flex gap-2 items-start pl-2 text-[11px] text-zinc-300 leading-relaxed my-1">
          <span className="text-[#4ec9b0] font-bold select-none">•</span>
          <span className="flex-1">{parseInline(content)}</span>
        </div>
      );
    }

    // Ordered lists
    const numListMatch = line.trim().match(/^(\d+)\.\s(.*)/);
    if (numListMatch) {
      const num = numListMatch[1];
      const content = numListMatch[2];
      return (
        <div key={lIdx} className="flex gap-2 items-start pl-2 text-[11px] text-zinc-300 leading-relaxed my-1">
          <span className="text-[#569cd6] font-mono text-[10px] select-none">{num}.</span>
          <span className="flex-1">{parseInline(content)}</span>
        </div>
      );
    }

    // Blockquotes
    if (line.startsWith('> ')) {
      return (
        <blockquote key={lIdx} className="border-l-2 border-[#4ec9b0] pl-3 py-1 my-1.5 text-zinc-400 italic text-[10.5px] bg-[#1a1a1d]/40 rounded-r">
          {parseInline(line.slice(2))}
        </blockquote>
      );
    }

    return (
      <p key={lIdx} className="text-[11px] leading-relaxed text-zinc-300 my-1">
        {parseInline(line)}
      </p>
    );
  });
}

function MarkdownRenderer({ text }) {
  if (!text) return null;

  const parts = [];
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)\n```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex, match.index)
      });
    }

    parts.push({
      type: 'code',
      lang: match[1] || 'plaintext',
      content: match[2]
    });

    lastIndex = codeBlockRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.substring(lastIndex)
    });
  }

  return (
    <div className="space-y-1">
      {parts.map((part, index) => {
        if (part.type === 'code') {
          return <CodeBlock key={index} lang={part.lang} code={part.content} />;
        } else {
          return <TextSection key={index} text={part.content} />;
        }
      })}
    </div>
  );
}

// --- SUB-COMPONENT: STEPPER TIMELINE ---
function StepperTimeline({ logs }) {
  const steps = parseLogs(logs);
  return (
    <div className="space-y-4 py-2 font-mono text-[11px]">
      {steps.map((step, idx) => {
        const isLast = idx === steps.length - 1;
        
        let icon = <div className="w-2 h-2 rounded-full bg-zinc-600 mt-1.5" />;
        let iconClass = "bg-[#2d2d30] border-zinc-700 text-zinc-500";
        let titleClass = "text-zinc-500";

        if (step.status === 'success') {
          icon = <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
          iconClass = "text-emerald-400";
          titleClass = "text-[#d4d4d4] font-semibold";
        } else if (step.status === 'running') {
          icon = (
            <div className="relative flex items-center justify-center shrink-0">
              <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-[#4ec9b0] opacity-75"></span>
              <Sparkles className="w-4 h-4 text-[#4ec9b0] relative" />
            </div>
          );
          iconClass = "text-[#4ec9b0]";
          titleClass = "text-[#4ec9b0] font-bold animate-pulse";
        } else if (step.status === 'error') {
          icon = <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />;
          iconClass = "text-rose-500";
          titleClass = "text-rose-500 font-bold";
        }

        return (
          <div key={step.id} className="relative flex gap-3.5 group">
            {!isLast && (
              <div 
                className={`absolute left-[7px] top-[18px] bottom-[-22px] w-[2px] transition-all duration-300 ${
                  step.status === 'success' ? 'bg-emerald-500/30' : 'bg-zinc-700'
                }`} 
              />
            )}

            <div className={`w-4 h-4 flex items-center justify-center shrink-0 z-10 ${iconClass}`}>
              {icon}
            </div>

            <div className="flex-1 min-w-0 pb-1">
              <div className={titleClass}>{step.name}</div>
              {step.details && (
                <div className="text-[10px] text-[#858585] mt-0.5 break-words font-mono">
                  {step.details}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// --- SUB-COMPONENT: RAW LOGS TERMINAL ---
function RawLogsConsole({ logs, onCopy }) {
  const logEndRef = useRef(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const formatLogLine = (log) => {
    const lower = log.toLowerCase();
    let prefix = 'INF';
    let colorClass = 'text-[#569cd6]'; // default blue
    let content = log;

    if (lower.includes('error') || lower.includes('failed')) {
      prefix = 'ERR';
      colorClass = 'text-rose-500 font-bold';
    } else if (lower.includes('completed') || lower.includes('success') || lower.includes('done')) {
      prefix = 'OK ';
      colorClass = 'text-emerald-400 font-semibold';
    } else if (lower.includes('updating') || lower.includes('reading') || lower.includes('scanning') || lower.includes('listing')) {
      prefix = 'RUN';
      colorClass = 'text-amber-400';
    }

    return (
      <div className="break-all font-mono py-0.5 border-b border-white/[0.02] flex items-start gap-2">
        <span className={`${colorClass} opacity-80 select-none shrink-0 font-bold`}>[{prefix}]</span>
        <span className="text-zinc-300 leading-relaxed">{content}</span>
      </div>
    );
  };

  return (
    <div className="w-full bg-[#0c0c0f] border border-[#2d2d30] rounded-xl overflow-hidden flex flex-col font-mono text-[10px] shadow-2xl terminal-crt select-text">
      <div className="h-8 px-4 bg-[#141416]/90 border-b border-[#2d2d30] flex items-center justify-between text-[#858585] select-none tracking-wider shrink-0 z-30">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500/40" />
            <span className="w-2 h-2 rounded-full bg-amber-500/40" />
            <span className="w-2 h-2 rounded-full bg-emerald-500/40" />
          </div>
          <span className="ml-2 text-[9px] text-zinc-400 font-bold tracking-widest uppercase">Agent Console</span>
        </div>
        {logs.length > 0 && (
          <button
            onClick={onCopy}
            type="button"
            className="hover:text-white flex items-center gap-1 transition-colors cursor-pointer p-1 rounded hover:bg-[#252529] active:scale-95"
            title="Copy console logs"
          >
            <Copy className="w-3.5 h-3.5 text-zinc-400 hover:text-white" />
          </button>
        )}
      </div>

      <div className="p-4 bg-[#0a0a0c]/95 h-38 overflow-y-auto custom-scrollbar space-y-1 select-text z-10 relative">
        {logs.map((log, lidx) => (
          <React.Fragment key={lidx}>
            {formatLogLine(log)}
          </React.Fragment>
        ))}
        <div ref={logEndRef} />
        {logs.length === 0 && (
          <span className="text-zinc-600 italic select-none">Connecting to secure tunnel...</span>
        )}
      </div>
    </div>
  );
}

// --- CONSTANTS ---
const SUGGESTIONS = [
  { label: '✨ Landing Page', text: 'Create a beautiful landing page with modern cards, responsive layout, and interactive hero section.' },
  { label: '🎨 Dark Mode', text: 'Add a dark mode toggle button to the top navigation, using Tailwind or CSS variables.' },
  { label: '⚡ Animations', text: 'Add interactive animations, hover states, and smooth transitions to all key elements.' },
  { label: '🐞 Fix Styles', text: 'Fix general layout alignment, spacing issues, and standardize the color palette.' }
];

// --- MAIN COMPONENT ---
export default function AIChatPanel() {
  const { chatMessages, handleSendMessage: onSendMessage, isAiLoading, aiLogs, clearChatMessages } = useAIChat();

  const [input, setInput] = useState('');
  const [logsTab, setLogsTab] = useState('timeline'); // 'timeline' | 'raw'
  const [expandedLogsIndex, setExpandedLogsIndex] = useState(null);
  const [histView, setHistView] = useState({}); // { [index]: 'timeline' | 'raw' }
  
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAiLoading]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
    }
  }, [input]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isAiLoading) return;
    onSendMessage(input);
    setInput('');
  };

  const handleCopyLogs = (logs) => {
    navigator.clipboard.writeText(logs.join('\n'));
  };

  const handleSuggestionClick = (text) => {
    setInput(text);
    textareaRef.current?.focus();
  };

  const toggleHistoricalLogs = (index) => {
    setExpandedLogsIndex(expandedLogsIndex === index ? null : index);
  };

  const toggleHistView = (index, tab) => {
    setHistView(prev => ({
      ...prev,
      [index]: tab
    }));
  };

  return (
    <aside className="w-full h-full flex flex-col overflow-hidden select-none bg-[#252526] font-sans antialiased">
      {/* Header */}
      <div className="h-[48px] px-4 border-b border-[#3e3e42] flex items-center justify-between shrink-0 bg-[#252526]">
        <div className="flex items-center gap-2 font-sans font-semibold text-xs text-white/90 tracking-wider uppercase">
          <div className="w-5 h-5 rounded-lg bg-[#569cd6]/10 flex items-center justify-center border border-[#569cd6]/20">
            <Bot className="w-3.5 h-3.5 text-[#569cd6]" />
          </div>
          <span className="text-gradient-neon font-extrabold tracking-tight">AI Assistant</span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Connection status */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1e1e1e] border border-[#3e3e42] text-[9px] font-mono text-zinc-400 font-medium">
            <span className="w-1 h-1 rounded-full bg-[#4ec9b0] animate-pulse" />
            <span className="tracking-wide">AGENT.READY</span>
          </div>

          {/* Clear history button */}
          {chatMessages.length > 1 && (
            <button
              onClick={clearChatMessages}
              type="button"
              className="p-1.5 rounded-lg hover:bg-rose-950/20 border border-transparent hover:border-rose-900/30 text-zinc-500 hover:text-rose-400 transition-all cursor-pointer active:scale-95 focus:outline-none"
              title="Clear chat history"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Viewport */}
      <div className="flex-grow chat-messages custom-scrollbar p-4 space-y-5 flex flex-col bg-[#252526]">
        {chatMessages.map((msg, index) => {
          const isUser = msg.role === 'user';
          const hasLogs = msg.logs && msg.logs.length > 0;
          const isLogsOpen = expandedLogsIndex === index;
          const currentHistTab = histView[index] || 'timeline';

          return (
            <div 
              key={index} 
              className={`flex flex-col w-full ${isUser ? 'items-end' : 'items-start'} animate-fade-slide-in`}
              style={{ animationDelay: `${Math.min(index * 30, 200)}ms` }}
            >
              <div className="flex items-center gap-1.5 mb-1 px-1.5">
                {isUser ? (
                  <>
                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Developer</span>
                    <div className="w-3.5 h-3.5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                      <Cpu className="w-2 h-2 text-zinc-400" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full bg-[#569cd6]/10 border border-[#569cd6]/20 flex items-center justify-center">
                      <Sparkles className="w-2 h-2 text-[#569cd6]" />
                    </div>
                    <span className="text-[9px] font-mono text-[#569cd6] uppercase tracking-widest font-bold">AI Agent</span>
                  </>
                )}
              </div>
              
              <div
                className={`p-4 text-[11px] leading-relaxed max-w-[95%] transition-all duration-200 ease-in-out border ${
                  isUser
                    ? 'user-msg-gradient text-zinc-100 rounded-2xl rounded-tr-sm font-mono whitespace-pre-wrap select-text'
                    : 'assistant-msg-gradient text-zinc-300 rounded-2xl rounded-tl-sm select-text'
                }`}
              >
                {isUser ? (
                  msg.content
                ) : (
                  <MarkdownRenderer text={msg.content} />
                )}

                {/* Historical Execution Log / Timeline Drawer */}
                {!isUser && hasLogs && (
                  <div className="mt-4 w-full border border-[#3e3e42] rounded-xl overflow-hidden bg-[#1e1e1e]/60 select-none">
                    <button
                      onClick={() => toggleHistoricalLogs(index)}
                      className="w-full px-3.5 py-2.5 flex items-center justify-between text-[10px] font-mono text-zinc-400 hover:text-white bg-[#252526]/60 hover:bg-[#252526]/90 transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2 font-semibold">
                        <History className="w-3.5 h-3.5 text-[#569cd6]" />
                        <span>Execution Steps ({msg.logs.length} entries)</span>
                      </span>
                      {isLogsOpen ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                    
                    {isLogsOpen && (
                      <div className="p-4 border-t border-[#3e3e42] bg-[#1e1e1e]/30 space-y-4">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => toggleHistView(index, 'timeline')}
                            className={`px-2.5 py-1 rounded-md text-[9px] font-mono transition-all cursor-pointer font-bold ${
                              currentHistTab === 'timeline' ? 'bg-[#0e639c] text-white shadow-sm' : 'bg-[#1e1e1e] border border-[#3e3e42] text-zinc-400 hover:text-white'
                            }`}
                          >
                            Timeline
                          </button>
                          <button
                            onClick={() => toggleHistView(index, 'raw')}
                            className={`px-2.5 py-1 rounded-md text-[9px] font-mono transition-all cursor-pointer font-bold ${
                              currentHistTab === 'raw' ? 'bg-[#0e639c] text-white shadow-sm' : 'bg-[#1e1e1e] border border-[#3e3e42] text-zinc-400 hover:text-white'
                            }`}
                          >
                            Terminal Output
                          </button>
                        </div>

                        {currentHistTab === 'timeline' ? (
                          <StepperTimeline logs={msg.logs} />
                        ) : (
                          <RawLogsConsole logs={msg.logs} onCopy={() => handleCopyLogs(msg.logs)} />
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Live SSE progress feedback */}
        {isAiLoading && (
          <div className="flex flex-col items-start w-full space-y-3.5 animate-fade-slide-in">
            <div className="flex items-center gap-1.5 mb-1 px-1.5">
              <div className="relative flex items-center justify-center shrink-0 w-3.5 h-3.5">
                <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-[#4ec9b0] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#4ec9b0]"></span>
              </div>
              <span className="text-[9px] font-mono text-[#4ec9b0] uppercase tracking-widest font-bold animate-pulse">
                NEON_CORE (STREAMING)
              </span>
            </div>
            
            {/* Control bar to toggle timeline vs console */}
            <div className="w-full flex flex-col gap-3.5 p-4 bg-[#2d2d30] border border-[#3e3e42] rounded-xl shadow-lg">
              <div className="flex items-center justify-between border-b border-[#3e3e42] pb-2.5 text-[10px] font-mono text-[#858585]">
                <div className="flex items-center gap-1.5 uppercase font-semibold">
                  <Terminal className="w-3.5 h-3.5 text-[#569cd6]" />
                  <span className="text-zinc-300">Agent Stream Progress</span>
                </div>
                
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setLogsTab('timeline')}
                    className={`px-2.5 py-1 rounded-md text-[9px] transition-all cursor-pointer font-bold ${
                      logsTab === 'timeline' ? 'bg-[#0e639c] text-white shadow-sm' : 'bg-[#1e1e1e] border border-[#3e3e42] text-zinc-400 hover:text-white'
                    }`}
                  >
                    Timeline
                  </button>
                  <button
                    onClick={() => setLogsTab('raw')}
                    className={`px-2.5 py-1 rounded-md text-[9px] transition-all cursor-pointer font-bold ${
                      logsTab === 'raw' ? 'bg-[#0e639c] text-white shadow-sm' : 'bg-[#1e1e1e] border border-[#3e3e42] text-zinc-400 hover:text-white'
                    }`}
                  >
                    Terminal
                  </button>
                </div>
              </div>

              {/* Dynamic View */}
              {logsTab === 'timeline' ? (
                <StepperTimeline logs={aiLogs} />
              ) : (
                <RawLogsConsole logs={aiLogs} onCopy={() => handleCopyLogs(aiLogs)} />
              )}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      {chatMessages.length <= 1 && !isAiLoading && (
        <div className="px-4 py-3 bg-[#252526] flex flex-col gap-2 shrink-0 border-t border-[#3e3e42]">
          <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest px-1 font-bold select-none">Quick Actions</div>
          <div className="grid grid-cols-2 gap-2">
            {SUGGESTIONS.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSuggestionClick(s.text)}
                className="text-left p-3 rounded-xl bg-[#2d2d30] hover:bg-[#323235] border border-[#3e3e42] hover:border-[#4ec9b0]/30 transition-all duration-300 cursor-pointer active:scale-95 group relative overflow-hidden animate-fade-slide-in"
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                <div className="text-[11px] font-bold text-zinc-300 group-hover:text-[#4ec9b0] transition-colors flex items-center gap-1.5 font-mono">
                  {s.label}
                </div>
                <div className="text-[9px] text-zinc-500 group-hover:text-zinc-400 mt-1 line-clamp-1 leading-normal font-sans">
                  {s.text}
                </div>
                {/* Hover neon bottom bar */}
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#569cd6] to-[#4ec9b0] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input container */}
      <form onSubmit={handleSubmit} className="p-4 bg-[#252526] border-t border-[#3e3e42] shrink-0 z-30">
        <div className="relative flex flex-col gap-2">
          <div className="relative rounded-xl border border-[#3e3e42] bg-[#2d2d30] transition-all duration-300 cyber-input-glow focus-within:border-[#569cd6]/50">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isAiLoading}
              placeholder={isAiLoading ? 'Refactoring project files...' : 'Ask AI to generate UI/modify code...'}
              className="w-full bg-transparent text-zinc-200 border-none rounded-xl py-3 pl-3 pr-14 focus:outline-none text-xs font-sans placeholder-zinc-500 resize-none h-12 max-h-40 overflow-y-auto custom-scrollbar transition-all duration-200 ease-in-out disabled:opacity-50"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            
            {/* Input Action Controls */}
            <div className="absolute right-3 top-[10px] flex items-center gap-2">
              {input.trim() && (
                <button
                  type="button"
                  onClick={() => setInput('')}
                  className="text-zinc-500 hover:text-zinc-300 p-1 rounded-md transition-colors cursor-pointer hover:bg-zinc-800/50"
                  title="Clear input"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              
              <button
                type="submit"
                disabled={isAiLoading || !input.trim()}
                className="bg-[#0e639c] hover:bg-[#1177bb] text-white disabled:bg-zinc-800 disabled:text-zinc-600 h-7 w-7 flex items-center justify-center rounded-lg active:scale-95 hover:shadow-[0_0_12px_rgba(86,156,214,0.3)] transition-all duration-250 cursor-pointer focus:outline-none"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Input Details Footer */}
        <div className="mt-2 flex items-center justify-between px-1 text-[8px] font-mono text-zinc-500 uppercase tracking-widest select-none">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4ec9b0] animate-pulse" />
            <span>stitch.tunnel // secured</span>
          </div>
          {input.length > 0 && (
            <span>{input.length} chars</span>
          )}
        </div>
      </form>
    </aside>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, Terminal, Sparkles } from 'lucide-react';

export default function AIChatPanel({
  chatMessages,
  onSendMessage,
  isAiLoading,
  aiLogs
}) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const logEndRef = useRef(null);

  // Smooth scroll to bottom when messages are updated or loading state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAiLoading]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiLogs]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isAiLoading) return;
    onSendMessage(input);
    setInput('');
  };

  const getActiveStatusPill = () => {
    if (!isAiLoading || aiLogs.length === 0) return null;
    for (let i = aiLogs.length - 1; i >= 0; i--) {
      const log = aiLogs[i];
      if (log.toLowerCase().includes('reading files')) {
        const filePart = log.split('Reading files...')[1] || log.split('Reading files...')[1] || '';
        return `Reading files… ${filePart.trim()}`;
      }
      if (log.toLowerCase().includes('updating files')) {
        const filePart = log.split('updating files...')[1] || log.split('Updating files...')[1] || '';
        return `Updating files… ${filePart.trim()}`;
      }
    }
    return 'Processing request…';
  };

  const statusPill = getActiveStatusPill();

  return (
    <aside className="w-full h-full flex flex-col overflow-hidden select-none">
      {/* Chat header */}
      <div className="h-10 px-4 border-b border-[#3e3e42] flex items-center justify-between shrink-0 bg-[#252526]">
        <div className="flex items-center gap-1.5 font-sans font-semibold text-xs text-[#d4d4d4] tracking-wide uppercase">
          <Bot className="w-4 h-4 text-[#569cd6]" />
          <span>AI Assistant</span>
        </div>
        <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#1e1e1e] border border-[#3e3e42] text-[10px] font-mono text-[#858585]">
          <Sparkles className="w-3 h-3 text-[#4ec9b0]" />
          <span>copilot_v2</span>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-grow chat-messages custom-scrollbar p-4 space-y-4 flex flex-col bg-[#252526]">
        {chatMessages.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div key={index} className={`flex flex-col w-full ${isUser ? 'items-end' : 'items-start'}`}>
              <span className="text-[9px] font-mono text-[#858585] mb-1 px-1">
                {isUser ? 'DEVELOPER' : 'NEON_CORE'}
              </span>
              <div
                className={`p-3 text-xs leading-relaxed max-w-[90%] rounded-lg transition-all duration-200 ease-in-out font-mono whitespace-pre-line ${
                  isUser
                    ? 'bg-[#094771] text-[#d4d4d4] rounded-tr-none'
                    : 'bg-[#2d2d30] text-[#d4d4d4] border border-[#3e3e42] rounded-tl-none'
                }`}
              >
                {msg.content}
              </div>
            </div>
          );
        })}

        {/* Live SSE progress feedback */}
        {isAiLoading && (
          <div className="flex flex-col items-start w-full space-y-2">
            <span className="text-[9px] font-mono text-[#4ec9b0] animate-pulse">
              NEON_CORE (STREAMING)
            </span>
            
            {/* Status Pill */}
            {statusPill && (
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#2a2d2e] text-[#858585] border border-[#3e3e42] text-[11px] font-mono animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4ec9b0] animate-ping" />
                <span>{statusPill}</span>
              </div>
            )}

            {/* Live SSE logs console */}
            <div className="w-full bg-[#2d2d30] border border-[#3e3e42] p-2.5 rounded-lg flex flex-col text-[11px] font-mono text-[#858585]">
              <div className="flex items-center gap-1.5 mb-1.5 pb-1 border-b border-[#3e3e42] text-[9px] text-[#858585] uppercase tracking-wider">
                <Terminal className="w-3.5 h-3.5 text-[#569cd6]" />
                <span>Agent SSE Log Feed</span>
              </div>
              <div className="bg-[#1e1e1e] border border-[#3e3e42] rounded p-2 h-24 overflow-y-auto custom-scrollbar text-[10px] text-[#d4d4d4] font-mono space-y-0.5">
                {aiLogs.map((log, lidx) => (
                  <div key={lidx} className="break-all font-mono">
                    <span className="text-[#569cd6] mr-1.5">&gt;</span>
                    {log}
                  </div>
                ))}
                <div ref={logEndRef} />
                {aiLogs.length === 0 && (
                  <span className="text-[#858585]/40 italic">Connecting to agent...</span>
                )}
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input container */}
      <form onSubmit={handleSubmit} className="p-3 bg-[#252526] border-t border-[#3e3e42] shrink-0">
        <div className="relative flex flex-col gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isAiLoading}
            placeholder={isAiLoading ? 'Refactoring project files...' : 'Ask AI to generate UI/modify code...'}
            className="w-full bg-[#3c3c3c] text-[#d4d4d4] border border-[#3e3e42] rounded-lg p-2.5 pr-10 focus:outline-none focus:ring-1 focus:ring-[#007fd4] text-xs font-mono placeholder-[#858585] resize-none h-16 transition-all duration-200 ease-in-out disabled:opacity-50"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <button
            type="submit"
            disabled={isAiLoading || !input.trim()}
            className="absolute right-2 bottom-2 bg-[#0e639c] hover:bg-[#1177bb] text-[#d4d4d4] disabled:bg-[#2d2d30] disabled:text-[#858585]/40 h-7 w-7 flex items-center justify-center rounded-md active:scale-95 transition-all duration-200 ease-in-out cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#007fd4]"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="mt-2 text-center text-[8px] font-mono text-[#858585] uppercase tracking-widest">
          Secured Sandbox SSE Tunnel
        </div>
      </form>
    </aside>
  );
}

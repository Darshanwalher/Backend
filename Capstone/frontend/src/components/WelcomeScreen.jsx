import React, { useState } from 'react';
import { Play, Sparkles, Terminal, Cpu, Layers, HelpCircle, AlertCircle } from 'lucide-react';

export default function WelcomeScreen({ onCreateSandbox }) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleStart = async () => {
    setLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch('/api/sandbox/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }

      const data = await response.json();
      onCreateSandbox({
        sandboxId: data.sandboxId,
        previewUrl: data.previewUrl
      });
    } catch (err) {
      console.warn('API connection failed.', err);
      setErrorMsg('Could not connect to sandbox backend. Please verify that the backend is running.');
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden bg-[#1e1e1e] select-none">
      <div className="max-w-xl w-full bg-[#252526] border border-[#3e3e42] rounded-xl p-8 shadow-2xl relative">
        {/* Glow effect */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-[#4ec9b0]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-[#569cd6]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2a2d2e] border border-[#3e3e42] text-[#4ec9b0] text-[10px] font-semibold uppercase tracking-wider mb-4 font-mono">
            <Cpu className="w-3.5 h-3.5 text-[#4ec9b0]" />
            v1.0.0 Stable
          </div>
          <h1 className="text-4xl font-extrabold text-[#d4d4d4] tracking-tight mb-2 flex justify-center items-center gap-2 font-mono">
            <svg className="w-8 h-8 text-[#569cd6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            CodeSpace
          </h1>
          <p className="text-[#858585] text-xs font-mono">
            Isolated cloud sandbox environments with instant AI-guided generation.
          </p>
        </div>

        {/* Features list */}
        <div className="space-y-3 mb-8">
          <div className="flex gap-4 p-3.5 rounded-lg bg-[#2d2d30] border border-[#3e3e42] transition-all duration-200 hover:border-[#569cd6]/20">
            <div className="w-10 h-10 rounded-lg bg-[#252526] border border-[#3e3e42] flex items-center justify-center text-[#d4d4d4] shrink-0">
              <Terminal className="w-5 h-5 text-[#569cd6]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#d4d4d4] font-mono">Full Terminal Access</h3>
              <p className="text-xs text-[#858585] mt-0.5 font-mono">Interactive bash shell mapped directly to your running virtual container via socket.io.</p>
            </div>
          </div>

          <div className="flex gap-4 p-3.5 rounded-lg bg-[#2d2d30] border border-[#3e3e42] transition-all duration-200 hover:border-[#569cd6]/20">
            <div className="w-10 h-10 rounded-lg bg-[#252526] border border-[#3e3e42] flex items-center justify-center text-[#d4d4d4] shrink-0">
              <Sparkles className="w-5 h-5 text-[#4ec9b0]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#d4d4d4] font-mono">AI-Driven UI Generation</h3>
              <p className="text-xs text-[#858585] mt-0.5 font-mono">Chat with our resident AI code assistant to edit, test, and render react components in real time.</p>
            </div>
          </div>

          <div className="flex gap-4 p-3.5 rounded-lg bg-[#2d2d30] border border-[#3e3e42] transition-all duration-200 hover:border-[#569cd6]/20">
            <div className="w-10 h-10 rounded-lg bg-[#252526] border border-[#3e3e42] flex items-center justify-center text-[#d4d4d4] shrink-0">
              <Layers className="w-5 h-5 text-[#4ec9b0]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#d4d4d4] font-mono">Hot Module Reload Preview</h3>
              <p className="text-xs text-[#858585] mt-0.5 font-mono">See edits render instantly in the preview window iframe as soon as files are patched.</p>
            </div>
          </div>
        </div>

        {/* Error / Fallback Box */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-950/20 border border-red-900/30 text-[#f44747] rounded-lg text-xs flex gap-3 font-mono">
            <AlertCircle className="w-5 h-5 shrink-0 text-[#f44747]" />
            <div className="flex flex-col gap-2">
              <span>{errorMsg}</span>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex flex-col gap-4">
          <button
            onClick={handleStart}
            disabled={loading}
            className="w-full relative overflow-hidden bg-[#0e639c] hover:bg-[#1177bb] disabled:bg-[#2d2d30] text-[#d4d4d4] disabled:text-[#858585] font-bold py-3 rounded-lg active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 font-mono text-xs uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-[#007fd4]"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-[#d4d4d4]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Deploying Container...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-[#d4d4d4] stroke-[#d4d4d4]" />
                Initialize Sandbox Environment
              </>
            )}
          </button>

          <div className="flex items-center justify-between border-t border-[#3e3e42] pt-4 text-xs font-mono">
            <span className="text-[#858585] flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" /> Session state:
            </span>
            <span className="text-[#858585] text-[11px] uppercase tracking-wider">Uninitialized</span>
          </div>
        </div>
      </div>
    </div>
  );
}

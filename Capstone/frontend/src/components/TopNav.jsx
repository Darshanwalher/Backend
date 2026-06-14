import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../store/authSlice';
import { Copy, Check, Plus } from 'lucide-react';

export default function TopNav({ sandboxId, onResetSandbox, connectionStatus }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [copied, setCopied] = useState(false);

  const copyId = () => {
    if (!sandboxId) return;
    navigator.clipboard.writeText(sandboxId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isActive = connectionStatus === 'connected';

  return (
    <header className="h-[48px] px-4 bg-[#3c3c3c] border-b border-[#3e3e42] flex justify-between items-center z-50 shrink-0 select-none">
      {/* Left: CodeSpace Logo */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <svg className="w-5 h-5 text-[#569cd6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          <span className="text-sm font-bold text-[#d4d4d4] font-mono tracking-tight">
            CodeSpace
          </span>
        </div>
        {sandboxId && (
          <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#2a2d2e] border border-[#3e3e42] font-mono text-[10px] text-[#858585]">
            <span className="text-[#858585] font-semibold">ID:</span>
            <span className="text-[#d4d4d4] select-all truncate max-w-[80px]">{sandboxId.substring(0, 8)}...</span>
            <button
              onClick={copyId}
              className="text-[#858585] hover:text-[#569cd6] transition-colors p-0.5 rounded cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#007fd4]"
              title="Copy Sandbox ID"
            >
              {copied ? <Check className="w-3 h-3 text-[#4ec9b0]" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        )}
      </div>

      {/* Center: Sandbox status badge */}
      <div className="flex items-center justify-center">
        {sandboxId ? (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#252526] border border-[#3e3e42] text-xs font-mono">
            {isActive ? (
              <>
                <span className="w-2 h-2 rounded-full bg-[#4ec9b0] animate-pulse" />
                <span className="text-[#4ec9b0] font-semibold uppercase tracking-wider text-[10px]">
                  Sandbox: ACTIVE
                </span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-[#858585]" />
                <span className="text-[#858585] font-semibold uppercase tracking-wider text-[10px]">
                  Sandbox: IDLE
                </span>
              </>
            )}
          </div>
        ) : (
          <div className="text-xs font-mono text-[#858585]">NO ACTIVE SANDBOX</div>
        )}
      </div>

      {/* Right: + New button & User Profile */}
      <div className="flex items-center gap-4">
        <button
          onClick={onResetSandbox}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#0e639c] hover:bg-[#1177bb] text-[#d4d4d4] font-mono text-xs font-bold transition-all duration-200 ease-in-out active:scale-95 cursor-pointer shadow-sm focus:outline-none focus:ring-1 focus:ring-[#007fd4]"
          title="Spin Up New Sandbox"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New</span>
        </button>

        {user && (
          <div className="flex items-center gap-2 border-l border-[#3e3e42] pl-4 font-mono">
            {user.avtar ? (
              <img
                src={user.avtar}
                alt={user.name}
                className="w-7 h-7 rounded-full object-cover border border-[#3e3e42]"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`;
                }}
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[#2a2d2e] border border-[#3e3e42] flex items-center justify-center text-[#569cd6] text-[10px] font-bold font-mono">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <span className="hidden sm:inline text-[11px] text-[#858585] max-w-[100px] truncate">{user.name}</span>
            <button
              onClick={() => dispatch(logoutUser())}
              className="text-[10px] font-semibold text-[#858585] hover:text-[#f44747] transition-colors duration-150 cursor-pointer ml-1"
              title="Sign Out"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

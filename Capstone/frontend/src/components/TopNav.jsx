import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../store/authSlice';
import { Copy, Check, Plus, Cpu } from 'lucide-react';

export default function TopNav({ sandboxId, onResetSandbox, connectionStatus }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [copied, setCopied] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const copyId = () => {
    if (!sandboxId) return;
    navigator.clipboard.writeText(sandboxId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isActive = connectionStatus === 'connected';

  return (
    <header className="h-[48px] px-4 bg-[#121214] border-b border-[#252528] flex justify-between items-center z-50 shrink-0 select-none font-sans antialiased">
      {/* Left: CodeSpace Logo & ID */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Cpu className="w-4.5 h-4.5 text-[#569cd6]" />
          <span className="text-sm font-semibold text-white/95 tracking-tight">
            CodeSpace
          </span>
        </div>
        {sandboxId && (
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1c1c1f] border border-[#2c2c30] text-[10px] text-[#a1a1aa] font-medium">
            <span className="text-[#71717a]">ID:</span>
            <span className="font-mono select-all truncate max-w-[80px]">{sandboxId.substring(0, 8)}...</span>
            <button
              onClick={copyId}
              className="text-[#71717a] hover:text-[#569cd6] transition-colors p-0.5 rounded cursor-pointer focus:outline-none"
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
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#1c1c1f] border border-[#2c2c30] text-[10px] font-medium tracking-wide">
            {isActive ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-[#4ec9b0] animate-pulse" />
                <span className="text-[#4ec9b0] uppercase tracking-wider text-[9px] font-bold">
                  Sandbox: ACTIVE
                </span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-[#71717a]" />
                <span className="text-[#71717a] uppercase tracking-wider text-[9px] font-bold">
                  Sandbox: IDLE
                </span>
              </>
            )}
          </div>
        ) : (
          <div className="text-[10px] uppercase tracking-wider text-[#71717a] font-semibold">NO ACTIVE SANDBOX</div>
        )}
      </div>

      {/* Right: + New button & User Profile */}
      <div className="flex items-center gap-4">
        <button
          onClick={onResetSandbox}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#1c1c1f] hover:bg-[#252529] border border-[#2c2c30] hover:border-[#3f3f46] text-[#e4e4e7] text-xs font-medium transition-all shadow-sm active:scale-95 cursor-pointer focus:outline-none"
          title="Spin Up New Sandbox"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New</span>
        </button>

        {user && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 pl-3 border-l border-[#252528] hover:opacity-85 transition-all focus:outline-none cursor-pointer"
            >
              {user.avtar ? (
                <img
                  src={user.avtar}
                  alt={user.name}
                  className="w-6 h-6 rounded-full object-cover border border-[#2c2c30]"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`;
                  }}
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-[#1c1c1f] border border-[#2c2c30] flex items-center justify-center text-[#569cd6] text-[9px] font-bold">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <span className="hidden sm:inline text-xs text-[#a1a1aa] font-medium max-w-[100px] truncate">{user.name}</span>
              <span className="text-[8px] text-[#71717a] transition-transform duration-200" style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-[38px] w-48 bg-[#18181b] border border-[#27272a] rounded-lg shadow-2xl py-1 z-50 text-xs text-[#e4e4e7] overflow-hidden">
                <div className="px-3 py-2 border-b border-[#27272a] text-[#71717a] text-[10px] truncate select-none leading-normal">
                  Logged in as<br/>
                  <span className="text-white font-medium text-xs">{user.name}</span>
                </div>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    dispatch(logoutUser());
                  }}
                  className="w-full text-left px-3 py-2.5 text-[#f87171] hover:bg-[#27272a] cursor-pointer font-medium transition-colors"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

import React, { useEffect, useRef } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { io } from 'socket.io-client';
import { Terminal as TermIcon } from 'lucide-react';
import 'xterm/css/xterm.css';
import { useSandbox } from '../context/SandboxContext';

export default function TerminalPanel() {
  const { sandboxId } = useSandbox();
  const terminalRef = useRef(null);
  const xtermRef = useRef(null);
  const socketRef = useRef(null);
  const fitAddonRef = useRef(null);

  useEffect(() => {
    // Initialize XTerm
    const term = new XTerm({
      cursorBlink: true,
      cursorStyle: 'block',
      theme: {
        background: '#1e1e1e',
        foreground: '#d4d4d4',
        cursor: '#4ec9b0',
        selectionBackground: '#37373d',
        black: '#1e1e1e',
        red: '#f44747',
        green: '#6a9955',
        yellow: '#dcdcaa',
        blue: '#569cd6',
        magenta: '#c084fc',
        cyan: '#4ec9b0',
        white: '#d4d4d4'
      },
      fontFamily: 'JetBrains Mono, Menlo, monospace',
      fontSize: 12,
      lineHeight: 1.4,
      scrollback: 1000
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    
    const fitTimeout = setTimeout(() => {
      if (terminalRef.current && terminalRef.current.clientWidth > 0 && terminalRef.current.clientHeight > 0) {
        try {
          fitAddon.fit();
        } catch (e) {}
      }
    }, 100);

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    const resizeObserver = new ResizeObserver(() => {
      if (terminalRef.current && terminalRef.current.clientWidth > 0 && terminalRef.current.clientHeight > 0) {
        try {
          fitAddon.fit();
        } catch (e) {}
      }
    });
    if (terminalRef.current) {
      resizeObserver.observe(terminalRef.current);
    }

    // --- REAL SOCKET.IO INTEGRATION ---
    term.writeln('\x1b[36mConnecting to sandbox terminal agent socket...\x1b[0m');
    
    const agentHost = `http://${sandboxId}.agent.localhost`;
    const socket = io(agentHost, {
      transports: ['websocket'],
      timeout: 5000
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      term.writeln('\x1b[32mSuccessfully connected to container shell stream.\x1b[0m\r\n');
      term.write('\x1b[38;5;42mneon@codespace:~$\x1b[0m ');
    });

    socket.on('connect_error', () => {
      term.writeln('\x1b[31mSocket connection failed. Please ensure the sandbox agent is running.\x1b[0m\r\n');
    });

    socket.on('terminal-output', (data) => {
      term.write(data);
    });

    const handleData = term.onData((data) => {
      if (socket.connected) {
        socket.emit('terminal-input', data);
      }
    });

    return () => {
      clearTimeout(fitTimeout);
      resizeObserver.disconnect();
      handleData.dispose();
      if (socket) {
        socket.disconnect();
      }
      term.dispose();
    };
  }, [sandboxId]);

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] overflow-hidden">
      {/* Bash Menu controls */}
      <div className="h-10 px-4 bg-[#252526] border-b border-[#3e3e42] flex items-center justify-between shrink-0 font-sans text-xs select-none">
        <div className="flex items-center gap-1.5 font-sans font-semibold text-xs text-[#d4d4d4]">
          <TermIcon className="w-4 h-4 text-[#569cd6]" />
          <span>Terminal</span>
        </div>
        <div>
          <button 
            onClick={() => {
              if (xtermRef.current) {
                xtermRef.current.clear();
              }
            }}
            className="px-2 py-0.5 rounded bg-[#1e1e1e] border border-[#3e3e42] hover:border-[#4ec9b0]/40 text-[#858585] hover:text-[#4ec9b0] text-[10px] transition-all duration-200 ease-in-out font-mono active:scale-95 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#007fd4]"
          >
            Clear Shell
          </button>
        </div>
      </div>

      {/* Terminal emulator viewport */}
      <div 
        ref={terminalRef} 
        className="flex-1 w-full h-full bg-[#1e1e1e] overflow-hidden custom-scrollbar" 
      />
    </div>
  );
}

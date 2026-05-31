import React, { useEffect, useRef } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { io } from 'socket.io-client';
import { Terminal as TermIcon } from 'lucide-react';
import 'xterm/css/xterm.css';

export default function TerminalPanel({ sandboxId, isMockMode }) {
  const terminalRef = useRef(null);
  const xtermRef = useRef(null);
  const socketRef = useRef(null);
  const fitAddonRef = useRef(null);
  const commandBuffer = useRef('');

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

    if (isMockMode) {
      // --- INTERACTIVE MOCK TERMINAL SIMULATOR ---
      term.writeln('\x1b[38;5;42mWelcome to CodeSpace Simulated Terminal Environment\x1b[0m');
      term.writeln('Type "\x1b[36mhelp\x1b[0m" for a list of available command utilities.');
      term.writeln('');
      term.write('\x1b[38;5;42mneon@codespace:~$\x1b[0m ');

      const handleMockKey = term.onData((data) => {
        const code = data.charCodeAt(0);
        
        if (code === 13) { // Enter Key
          const cmd = commandBuffer.current.trim();
          term.write('\r\n');
          
          if (cmd.length > 0) {
            runMockCommand(cmd, term);
          } else {
            term.write('\x1b[38;5;42mneon@codespace:~$\x1b[0m ');
          }
          commandBuffer.current = '';
        } else if (code === 127) { // Backspace Key
          if (commandBuffer.current.length > 0) {
            commandBuffer.current = commandBuffer.current.slice(0, -1);
            term.write('\b \b');
          }
        } else if (code === 3) { // Ctrl + C
          term.write('^C\r\n');
          term.write('\x1b[38;5;42mneon@codespace:~$\x1b[0m ');
          commandBuffer.current = '';
        } else {
          if (data.length === 1 && code >= 32 && code <= 126) {
            commandBuffer.current += data;
            term.write(data);
          }
        }
      });

      return () => {
        clearTimeout(fitTimeout);
        resizeObserver.disconnect();
        handleMockKey.dispose();
        term.dispose();
      };
    } else {
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
        term.writeln('\x1b[31mSocket connection failed. Spawning fallback local bash shell...\x1b[0m\r\n');
        term.write('\x1b[38;5;42mneon@codespace:~$\x1b[0m ');
        
        const handleFallbackKey = term.onData((data) => {
          const code = data.charCodeAt(0);
          if (code === 13) {
            const cmd = commandBuffer.current.trim();
            term.write('\r\n');
            runMockCommand(cmd, term);
            commandBuffer.current = '';
          } else if (code === 127) {
            if (commandBuffer.current.length > 0) {
              commandBuffer.current = commandBuffer.current.slice(0, -1);
              term.write('\b \b');
            }
          } else {
            commandBuffer.current += data;
            term.write(data);
          }
        });
        
        xtermRef.current._fallbackHandle = handleFallbackKey;
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
        if (xtermRef.current?._fallbackHandle) {
          xtermRef.current._fallbackHandle.dispose();
        }
        if (socket) {
          socket.disconnect();
        }
        term.dispose();
      };
    }
  }, [sandboxId, isMockMode]);

  const runMockCommand = (commandStr, term) => {
    const args = commandStr.split(' ');
    const cmd = args[0].toLowerCase();

    switch (cmd) {
      case 'help':
        term.writeln('CodeSpace Terminal Helper:');
        term.writeln('  \x1b[36mls\x1b[0m          - List workspace files');
        term.writeln('  \x1b[36mcat [file]\x1b[0m   - Display file contents');
        term.writeln('  \x1b[36mclear\x1b[0m        - Clear console screen');
        term.writeln('  \x1b[36mnpm run dev\x1b[0m  - Spin up mock Vite compiler server');
        term.writeln('  \x1b[36mnode -v\x1b[0m      - Print Node.js deployment version');
        term.writeln('  \x1b[36muname -a\x1b[0m     - Output kernel metadata descriptor');
        break;
      case 'ls':
        term.writeln('README.md           package.json        vite.config.js');
        term.writeln('eslint.config.js    public/             src/');
        break;
      case 'cat':
        const file = args[1];
        if (!file) {
          term.writeln('Usage: cat [filename]');
        } else if (file.includes('package.json')) {
          term.writeln('{');
          term.writeln('  "name": "codespace-sandbox-app",');
          term.writeln('  "dependencies": {');
          term.writeln('    "react": "^19.0.0",');
          term.writeln('    "tailwindcss": "^4.0.0"');
          term.writeln('  }');
          term.writeln('}');
        } else if (file.includes('README.md')) {
          term.writeln('# CodeSpace React App Boilerplate');
          term.writeln('This sandbox contains a React environment with Tailwind CSS.');
        } else {
          term.writeln(`cat: ${file}: No such file or directory`);
        }
        break;
      case 'clear':
        term.clear();
        break;
      case 'node':
        if (args[1] === '-v') {
          term.writeln('v20.11.0');
        } else {
          term.writeln('Usage: node -v');
        }
        break;
      case 'npm':
        if (args[1] === 'run' && args[2] === 'dev') {
          term.writeln('\x1b[32m> codespace-app@1.0.0 dev\x1b[0m');
          term.writeln('\x1b[32m> vite\x1b[0m');
          term.writeln('');
          term.writeln('  VITE v5.0.12  ready in 241 ms');
          term.writeln('  \x1b[32m➜\x1b[0m  Local:   \x1b[36mhttp://localhost:5173/\x1b[0m');
          term.writeln('  \x1b[32m➜\x1b[0m  Network: use --host to expose');
          term.writeln('  \x1b[32m➜\x1b[0m  press h + enter to show help');
        } else {
          term.writeln('Usage: npm run dev');
        }
        break;
      case 'uname':
        if (args[1] === '-a') {
          term.writeln('Linux codespace-host 6.5.0-41-generic #41~22.04.2-Ubuntu SMP x86_64 GNU/Linux');
        } else {
          term.writeln('Usage: uname -a');
        }
        break;
      default:
        term.writeln(`bash: command not found: ${cmd}`);
    }
    
    term.write('\r\n\x1b[38;5;42mneon@codespace:~$\x1b[0m ');
  };

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
                if (isMockMode) xtermRef.current.write('\x1b[38;5;42mneon@codespace:~$\x1b[0m ');
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

import React, { useState, useEffect, useRef } from 'react';
import { Cpu, Terminal, ShieldCheck, Wifi, Layers } from 'lucide-react';

export default function ProvisioningScreen({ sandboxId, onComplete }) {
  const [step, setStep] = useState(0);
  const [logs, setLogs] = useState([
    'SYSTEM: Initializing container cluster allocation...',
    'SYSTEM: Target host: 127.0.0.1 (local)',
    'DHCP: Requesting sandbox IP lease...'
  ]);
  const logContainerRef = useRef(null);

  const steps = [
    { label: 'Allocating dedicated container resources', icon: Cpu },
    { label: 'Mounting sandbox virtual file system', icon: Layers },
    { label: 'Starting network bridge proxy', icon: Wifi },
    { label: 'Applying kernel security policies', icon: ShieldCheck }
  ];

  const terminalOutput = [
    'DHCP: Received offer from 192.168.99.105',
    'FS: Mount point /workspace allocated',
    'FS: Restoring boilerplate React template: [src/App.jsx, src/index.css]',
    'NET: Listening on virtual interface agent.localhost:80',
    'KERNEL: Establishing terminal socket multiplexers on event: terminal-input',
    'KERNEL: Sandbox handshake verified. Sandbox ID: ' + sandboxId,
    'SYSTEM: Container environment initialized successfully.',
    'SYSTEM: Spawning Vite Hot Module Reloading server...',
    'VITE: dev server running on http://localhost:5173'
  ];

  // Auto scroll terminal logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Sequential loading and log append
  useEffect(() => {
    let logIndex = 0;
    const logInterval = setInterval(() => {
      if (logIndex < terminalOutput.length) {
        setLogs(prev => [...prev, `BASH: ${terminalOutput[logIndex]}`]);
        logIndex++;
      }
    }, 400);

    let stepIndex = 0;
    const stepInterval = setInterval(() => {
      if (stepIndex < steps.length) {
        setStep(prev => prev + 1);
        stepIndex++;
      } else {
        clearInterval(stepInterval);

        setLogs(prev => [...prev, 'SYSTEM: Verifying agent network propagation...']);
        let attempts = 0;
        const pollInterval = setInterval(async () => {
          attempts++;
          try {
            const res = await fetch(`http://${sandboxId}.agent.localhost/`);
            if (res.ok) {
              setLogs(prev => [...prev, 'SYSTEM: Agent network propagation verified.']);
              clearInterval(pollInterval);
              clearInterval(logInterval);
              setTimeout(() => {
                onComplete();
              }, 800);
            } else {
              setLogs(prev => [...prev, `SYSTEM: Waiting for routing (attempt ${attempts})...`]);
            }
          } catch (err) {
            setLogs(prev => [...prev, `SYSTEM: Waiting for routing (attempt ${attempts})...`]);
          }
        }, 1000);
      }
    }, 1000);

    return () => {
      clearInterval(stepInterval);
      clearInterval(logInterval);
    };
  }, []);

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-[#1e1e1e] select-none">
      <section className="w-full max-w-2xl bg-[#252526] border border-[#3e3e42] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[750px] relative font-mono">
        {/* Panel Header */}
        <div className="h-10 px-4 flex items-center justify-between bg-[#2d2d30] border-b border-[#3e3e42] shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#4ec9b0] animate-pulse"></span>
            <span className="font-mono text-[11px] text-[#858585]">Sandbox Provisioning Manager</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#3e3e42]"></div>
            <div className="w-2 h-2 rounded-full bg-[#3e3e42]"></div>
            <div className="w-2 h-2 rounded-full bg-[#3e3e42]"></div>
          </div>
        </div>

        {/* Central Layout */}
        <div className="flex-1 flex flex-col p-6 items-center text-center bg-[#252526]">
          {/* Circular SVG Spinner */}
          <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
            <svg className="spinner-ring w-full h-full absolute inset-0" viewBox="0 0 50 50">
              <circle
                cx="25"
                cy="25"
                fill="none"
                r="20"
                stroke="#4ec9b0"
                strokeDasharray="90, 150"
                strokeDashoffset="-35"
                strokeLinecap="round"
                strokeWidth="3.5"
              ></circle>
            </svg>
            <div className="text-white font-mono text-xs font-bold">
              {Math.min(Math.round((step / steps.length) * 100), 100)}%
            </div>
          </div>

          <h1 className="text-sm font-bold text-[#d4d4d4] mb-6 tracking-wider uppercase font-mono">
            Provisioning Sandbox Container
          </h1>

          {/* Status Step List */}
          <div className="w-full max-w-md space-y-2 text-left mb-6 font-mono text-[11px]">
            {steps.map((s, idx) => {
              const Icon = s.icon;
              const isDone = step > idx;
              const isActive = step === idx;

              return (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-2.5 rounded border transition-all duration-200 ${isDone
                      ? 'bg-[#2d2d30]/30 border-[#3e3e42] text-[#858585]'
                      : isActive
                        ? 'bg-[#2d2d30] border-[#4ec9b0]/40 text-[#d4d4d4] shadow-sm'
                        : 'border-transparent text-[#858585]/20'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#4ec9b0] animate-pulse' : isDone ? 'text-[#4ec9b0]/65' : 'text-[#858585]/20'}`} />
                    <span>{s.label}...</span>
                  </div>
                  <span>
                    {isDone ? (
                      <span className="text-[#6a9955] font-bold">[ OK ]</span>
                    ) : isActive ? (
                      <span className="text-[#4ec9b0] animate-pulse font-semibold">BOOTING</span>
                    ) : (
                      <span>WAIT</span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Terminal Console Logs */}
          <div className="w-full bg-[#1e1e1e] border border-[#3e3e42] rounded-lg overflow-hidden flex flex-col text-left">
            <div className="flex items-center justify-between px-3 py-1.5 bg-[#252526] border-b border-[#3e3e42]">
              <span className="font-mono text-[9px] text-[#858585] uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-[#569cd6]" />
                Boot Diagnostic Console
              </span>
              <span className="text-[9px] text-[#858585]/40 font-mono">log_feed.txt</span>
            </div>

            <div
              ref={logContainerRef}
              className="p-4 font-mono text-[11px] h-32 overflow-y-auto custom-scrollbar bg-[#1e1e1e] text-[#858585]"
            >
              {logs.map((log, idx) => (
                <div key={idx} className="mb-0.5 leading-relaxed break-all font-mono">
                  <span className="text-[#858585]/45 mr-1.5">$</span>
                  {log}
                </div>
              ))}
              <div className="inline-block w-1.5 h-3 bg-[#4ec9b0] align-middle cursor-blink ml-1"></div>
            </div>
          </div>
        </div>

        {/* Footer Bar */}
        <div className="h-9 px-4 bg-[#2d2d30] flex items-center justify-between border-t border-[#3e3e42] shrink-0 font-mono text-[10px] text-[#858585]">
          <div className="flex items-center gap-4">
            <span>RAM: 512MB limit</span>
            <span>CPU: 1 core allocation</span>
          </div>
          <span>Ref: {sandboxId?.substring(0, 8)}</span>
        </div>
      </section>
    </div>
  );
}

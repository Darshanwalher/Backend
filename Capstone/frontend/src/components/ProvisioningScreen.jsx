import { useState, useEffect, useRef } from 'react';
import { Cpu, Terminal, ShieldCheck, Wifi, Layers } from 'lucide-react';

export default function ProvisioningScreen({ sandboxId, onComplete }) {
  const [step, setStep] = useState(0);
  const [logs, setLogs] = useState([
    'SYSTEM: Initializing container cluster allocation...',
    'SYSTEM: Target host: 127.0.0.1 (local)',
    'DHCP: Requesting sandbox IP lease...'
  ]);
  const logContainerRef = useRef(null);
  const canvasRef = useRef(null);

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

  // Particle background animation (LoginPage vibes)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const particles = [];
    const colors = ['rgba(86, 156, 214, 0.15)', 'rgba(78, 201, 176, 0.15)'];
    const particleCount = Math.min(45, Math.floor((window.innerWidth * window.innerHeight) / 28000));
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
      });
    }

    const animate = () => {
      ctx.fillStyle = '#121214';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw dot grid texture
      ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
      for (let x = 0; x < canvas.width; x += 24) {
        for (let y = 0; y < canvas.height; y += 24) {
          ctx.fillRect(x, y, 1, 1);
        }
      }

      // Draw particles
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
      });

      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

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
          } catch {
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
    <div className="min-h-screen w-screen flex items-center justify-center p-4 sm:p-6 relative bg-[#121214] overflow-hidden select-none">
      {/* Background Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />

      {/* Main Glassmorphic Panel Container */}
      <section className="auth-card z-10 w-full max-w-[650px] p-6 sm:p-8 flex flex-col gap-6 animate-card-entrance relative">
        {/* Top Progress Bar */}
        <div className="w-full h-1 bg-[#1e1e1e] rounded overflow-hidden relative border border-[#3e3e42]/50">
          <div 
            className="h-full bg-[#4ec9b0] transition-all duration-300 shadow-[0_0_12px_rgba(78,201,176,0.5)]"
            style={{ width: `${Math.min(Math.round((step / steps.length) * 100), 100)}%` }}
          ></div>
        </div>

        {/* Loading core & status metadata */}
        <div className="flex flex-col items-center text-center">
          <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
            <div className="absolute inset-0 border border-[#4ec9b0]/20 rounded-full animate-ping"></div>
            <div className="absolute inset-2 border border-[#4ec9b0]/40 rounded-full animate-pulse"></div>
            <Cpu className="w-6 h-6 text-[#4ec9b0] animate-pulse" />
          </div>

          <h2 className="text-sm font-bold text-white tracking-widest uppercase">
            Provisioning Sandbox Container
          </h2>
          <p className="text-[#858585] text-[9px] uppercase tracking-wider font-mono mt-1.5">
            Ref: {sandboxId ? sandboxId.substring(0, 8) : 'allocating'}
          </p>
        </div>

        {/* Status Step List */}
        <div className="space-y-2 text-left font-mono text-[11px] w-full">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isDone = step > idx;
            const isActive = step === idx;

            return (
              <div
                key={idx}
                className={`flex items-center justify-between p-2.5 rounded border transition-all duration-200 ${
                  isDone
                    ? 'bg-[#1a1a1c]/30 border-[#3e3e42]/60 text-[#858585]'
                    : isActive
                      ? 'bg-[#1e1e1e] border-[#4ec9b0]/40 text-[#d4d4d4] shadow-[0_0_10px_rgba(78,201,176,0.05)]'
                      : 'border-transparent text-[#858585]/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#4ec9b0] animate-pulse' : isDone ? 'text-[#4ec9b0]/65' : 'text-[#858585]/20'}`} />
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
        <div className="w-full bg-[#1a1a1c] border border-[#3e3e42] rounded-lg overflow-hidden flex flex-col text-left font-mono">
          <div className="flex items-center justify-between px-3 py-1.5 bg-[#252526] border-b border-[#3e3e42]">
            <span className="text-[9px] text-[#858585] uppercase tracking-wider flex items-center gap-1.5 font-semibold">
              <Terminal className="w-3.5 h-3.5 text-[#569cd6]" />
              Boot Diagnostic Console
            </span>
            <span className="text-[9px] text-[#858585]/40">log_feed.txt</span>
          </div>

          <div
            ref={logContainerRef}
            className="p-3.5 text-[10px] h-32 overflow-y-auto bg-[#121214] text-[#858585] font-mono leading-relaxed"
          >
            {logs.map((log, idx) => (
              <div key={idx} className="mb-0.5 break-all">
                <span className="text-[#858585]/45 mr-1.5">$</span>
                {log}
              </div>
            ))}
            <div className="inline-block w-1.5 h-3 bg-[#4ec9b0] align-middle cursor-blink ml-1"></div>
          </div>
        </div>

        {/* Footer info bar */}
        <div className="flex justify-between items-center border-t border-[#3e3e42]/50 pt-4 font-mono text-[9px] text-[#858585]">
          <div className="flex items-center gap-3">
            <span>RAM: 512MB Limit</span>
            <span>CPU: 1 Core Allocation</span>
          </div>
          <span className="text-[#4ec9b0] animate-pulse uppercase tracking-wider font-bold">telemetry_connected</span>
        </div>
      </section>
    </div>
  );
}

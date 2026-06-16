import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../store/authSlice';
import { Play, Sparkles, Terminal, Cpu, HelpCircle, AlertCircle, Plus, Folder, Check, Pencil, Trash2, X } from 'lucide-react';

export default function WelcomeScreen({ onCreateSandbox }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [newProjectTitle, setNewProjectTitle] = useState('');

  const [loading, setLoading] = useState(false);
  const [creatingProject, setCreatingProject] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');

  const canvasRef = useRef(null);

  // Fetch projects on load
  const fetchProjects = async () => {
    setErrorMsg('');
    try {
      const response = await fetch('/api/sandbox/projects', {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch projects. Status: ${response.status}`);
      }

      const data = await response.json();
      const projectList = data.projects || [];
      setProjects(projectList);

      // Auto-select the first project if available
      if (projectList.length > 0) {
        setSelectedProjectId(projectList[0]._id);
      }
    } catch (err) {
      console.warn('Fetch projects failed:', err);
      setErrorMsg('Could not fetch projects. Please check your sandbox server.');
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

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

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectTitle.trim()) return;

    setCreatingProject(true);
    setErrorMsg('');

    try {
      const response = await fetch('/api/sandbox/project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: newProjectTitle.trim() })
      });

      if (response.status === 401) {
        dispatch(logoutUser());
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to create project: ${response.statusText}`);
      }

      const data = await response.json();
      const createdProj = data.project;
      setProjects(prev => [...prev, createdProj]);
      setSelectedProjectId(createdProj._id);
      setNewProjectTitle('');
    } catch (err) {
      console.error('Project creation failed:', err);
      setErrorMsg(err.message || 'Could not create project. Please try again.');
    } finally {
      setCreatingProject(false);
    }
  };

  const handleStart = async (targetProjectId) => {
    const projectId = targetProjectId || selectedProjectId;
    if (!projectId) {
      setErrorMsg('Please select or create a project first.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch('/api/sandbox/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ projectId })
      });

      if (response.status === 401) {
        dispatch(logoutUser());
        setLoading(false);
        return;
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `Server returned status: ${response.status}`);
      }

      const data = await response.json();
      onCreateSandbox({
        sandboxId: data.sandboxId,
        previewUrl: data.previewUrl
      });
    } catch (err) {
      console.warn('API connection failed.', err);
      setErrorMsg(err.message || 'Could not connect to sandbox backend. Please verify that the backend is running.');
      setLoading(false);
    }
  };

  const handleUpdateProjectTitle = async (projectId) => {
    if (!editingTitle.trim()) return;
    setErrorMsg('');
    try {
      const response = await fetch(`/api/sandbox/project/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: editingTitle.trim() })
      });

      if (response.status === 401) {
        dispatch(logoutUser());
        return;
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `Failed to update project. Status: ${response.status}`);
      }

      const data = await response.json();
      const updatedProj = data.project;

      // Update local state
      setProjects(prev => prev.map(p => p._id === projectId ? { ...p, title: updatedProj.title } : p));
      setEditingProjectId(null);
      setEditingTitle('');
    } catch (err) {
      console.error('Project update failed:', err);
      setErrorMsg(err.message || 'Could not update project.');
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }
    setErrorMsg('');
    try {
      const response = await fetch(`/api/sandbox/project/${projectId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (response.status === 401) {
        dispatch(logoutUser());
        return;
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `Failed to delete project. Status: ${response.status}`);
      }

      // Remove from local state
      setProjects(prev => prev.filter(p => p._id !== projectId));
      
      // If the deleted project was the selected one, select another one or reset
      if (selectedProjectId === projectId) {
        setSelectedProjectId(prev => {
          const remaining = projects.filter(p => p._id !== projectId);
          return remaining.length > 0 ? remaining[0]._id : '';
        });
      }
    } catch (err) {
      console.error('Project deletion failed:', err);
      setErrorMsg(err.message || 'Could not delete project.');
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center p-4 sm:p-6 relative bg-[#121214] overflow-hidden select-none">
      {/* Background Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />

      {/* Main Glassmorphic Bento Container */}
      <div className="auth-card z-10 w-full max-w-[850px] p-6 sm:p-10 transition-all duration-300 ease-in-out flex flex-col md:grid md:grid-cols-12 md:gap-10 animate-card-entrance">
        
        {/* Left Column: Branding and Tech Teaser */}
        <div className="md:col-span-7 flex flex-col justify-between mb-8 md:mb-0">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="relative w-10 h-10 flex items-center justify-center bg-[#1e1e1e] rounded-full border border-white/5 shadow-inner">
                <Cpu className="w-5 h-5 text-[#569cd6] animate-icon-glow rounded-full" />
              </div>
              <span className="font-mono text-[9px] px-2.5 py-0.5 bg-[#252526] text-[#858585] rounded border border-[#3e3e42] tracking-wider uppercase font-semibold">
                v1.0.0 Stable
              </span>
            </div>
            
            <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
              CodeSpace
            </h1>
            <p className="text-[#858585] text-xs font-sans leading-relaxed mb-6">
              The ultra-dense, technical development environment designed for advanced telemetry and AI-native architecture.
            </p>

            {/* Bento-style Features List */}
            <div className="flex flex-col gap-3 font-sans">
              <div className="p-3.5 bg-[#1a1a1c]/60 border-l-2 border-[#3e3e42] hover:border-[#569cd6] transition-all duration-300 rounded-r-lg">
                <div className="flex items-start gap-3">
                  <Terminal className="w-4 h-4 text-[#569cd6] mt-0.5 shrink-0" />
                  <div>
                    <h3 className="text-xs font-bold text-white font-mono">Full Terminal Access</h3>
                    <p className="text-[10px] text-[#858585] font-sans mt-0.5 leading-relaxed">
                      Low-latency shell access with pre-configured container environments and libraries.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-[#1a1a1c]/60 border-l-2 border-[#3e3e42] hover:border-[#4ec9b0] transition-all duration-300 rounded-r-lg">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-4 h-4 text-[#4ec9b0] mt-0.5 shrink-0" />
                  <div>
                    <h3 className="text-xs font-bold text-white font-mono">AI-Driven Co-Development</h3>
                    <p className="text-[10px] text-[#858585] font-sans mt-0.5 leading-relaxed">
                      Instant file tree generation, real-time code edit triggers, and conversational AI workflows.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-8">
            <button
              onClick={() => handleStart()}
              disabled={loading || !selectedProjectId}
              className="animate-border-shimmer w-full bg-[#569cd6] hover:bg-[#6db3f2] active:bg-[#4a8bc2] disabled:bg-[#3e3e42] disabled:opacity-50 text-[#121214] font-semibold py-3.5 rounded-lg active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider border border-[#569cd6] hover:shadow-[0_0_20px_rgba(86,156,214,0.3)] hover:-translate-y-0.5 active:translate-y-0 focus:outline-none font-mono"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#121214] border-t-transparent rounded-full animate-spin"></span>
                  <span>Deploying Container...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-[#121214] stroke-[#121214]" />
                  <span>Initialize Sandbox Environment</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Projects & User Info */}
        <div className="md:col-span-5 flex flex-col justify-between border-t md:border-t-0 md:border-l border-[#3e3e42]/60 pt-6 md:pt-0 md:pl-8">
          <div>
            {/* User Profile Info Badge */}
            {user && (
              <div className="p-3.5 rounded-lg bg-[#1a1a1c]/60 border border-[#3e3e42]/70 flex items-center justify-between gap-3 font-mono mb-5 shadow-sm">
                <div className="flex items-center gap-2.5 min-w-0">
                  {user.avtar ? (
                    <img
                      src={user.avtar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border border-[#3e3e42] shrink-0"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`;
                      }}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#252526] border border-[#3e3e42] flex items-center justify-center text-[#569cd6] text-xs font-bold font-mono shrink-0">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-semibold text-[#d4d4d4] truncate max-w-[120px]">{user.name}</span>
                    <span className="text-[9px] text-[#858585] truncate max-w-[120px]">{user.email}</span>
                  </div>
                </div>

                <button
                  onClick={() => dispatch(logoutUser())}
                  className="text-[9px] uppercase font-semibold text-[#f14c4c] hover:text-[#ff6a6a] border border-[#f14c4c]/20 hover:border-[#f14c4c]/40 px-2 py-1 rounded transition-all duration-150 cursor-pointer shrink-0"
                >
                  Sign Out
                </button>
              </div>
            )}

            {/* Error Message Display */}
            {errorMsg && (
              <div className="mb-4 p-3 bg-red-950/20 border border-[#f14c4c]/30 text-[#f14c4c] rounded-lg text-[10px] flex gap-2.5 animate-fade-in font-mono">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#f14c4c]" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Project Selection / List */}
            <div className="mb-5">
              <h3 className="text-[10px] font-mono font-semibold text-[#858585] mb-2 uppercase tracking-wider">
                Select Active Project
              </h3>

              {projects.length === 0 ? (
                <div className="p-4 rounded-lg bg-[#1a1a1c]/40 border border-dashed border-[#3e3e42] text-center text-[10px] text-[#858585] font-mono">
                  No projects found. Create one below to begin.
                </div>
              ) : (
                <div className="max-h-[160px] overflow-y-auto border border-[#3e3e42]/80 rounded-lg divide-y divide-[#3e3e42]/60 bg-[#1a1a1c]/40 shadow-inner">
                  {projects.map((proj) => {
                    const isSelected = selectedProjectId === proj._id;
                    const isEditing = editingProjectId === proj._id;
                    return (
                      <button
                        key={proj._id}
                        onClick={() => {
                          if (!isEditing) {
                            setSelectedProjectId(proj._id);
                            handleStart(proj._id);
                          }
                        }}
                        className={`group w-full flex items-center justify-between p-2.5 text-left transition-all duration-150 cursor-pointer ${
                          isSelected
                            ? 'bg-[#252526] text-white font-bold'
                            : 'text-[#858585] hover:text-[#d4d4d4] hover:bg-[#202021]/50'
                        }`}
                      >
                        <div className="flex items-center gap-2 font-mono text-[11px] min-w-0 flex-grow" onClick={(e) => isEditing && e.stopPropagation()}>
                          <Folder className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#4ec9b0]' : 'text-[#858585]'}`} />
                          {isEditing ? (
                            <input
                              type="text"
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              className="flex-1 bg-[#252526]/80 border border-[#3e3e42] rounded px-1.5 py-0.5 text-white focus:outline-none focus:border-[#569cd6] text-[11px] font-mono"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleUpdateProjectTitle(proj._id);
                                } else if (e.key === 'Escape') {
                                  setEditingProjectId(null);
                                  setEditingTitle('');
                                }
                              }}
                            />
                          ) : (
                            <span className="truncate">{proj.title}</span>
                          )}
                        </div>
                        {isEditing ? (
                          <div className="flex items-center gap-1.5 shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleUpdateProjectTitle(proj._id)}
                              className="text-[#4ec9b0] hover:text-[#5ce9cc] p-1 transition-colors rounded hover:bg-[#2e2e30] focus:outline-none"
                              title="Save Title"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingProjectId(null);
                                setEditingTitle('');
                              }}
                              className="text-[#f14c4c] hover:text-[#ff6a6a] p-1 transition-colors rounded hover:bg-[#2e2e30] focus:outline-none"
                              title="Cancel Rename"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => {
                                  setEditingProjectId(proj._id);
                                  setEditingTitle(proj.title);
                                }}
                                className="text-[#a1a1aa] hover:text-[#569cd6] p-1 transition-colors rounded hover:bg-[#202021] focus:outline-none"
                                title="Rename Project"
                              >
                                <Pencil className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteProject(proj._id)}
                                className="text-[#a1a1aa] hover:text-[#f14c4c] p-1 transition-colors rounded hover:bg-[#202021] focus:outline-none"
                                title="Delete Project"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-[#4ec9b0] shrink-0" />
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Create New Project Section */}
            <div className="mb-6">
              <h3 className="text-[10px] font-mono font-semibold text-[#858585] mb-2 uppercase tracking-wider">
                Create New Project
              </h3>
              <form onSubmit={handleCreateProject} className="p-2 rounded-lg bg-[#1a1a1c]/40 border border-[#3e3e42]/80 flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="New Project Title..."
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  disabled={creatingProject}
                  className="flex-1 bg-[#252526]/80 border border-[#3e3e42] rounded px-3 py-1.5 font-mono text-[11px] text-[#d4d4d4] focus:outline-none focus:border-[#569cd6] disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={creatingProject || !newProjectTitle.trim()}
                  className="px-3 py-1.5 rounded bg-[#252526] hover:bg-[#2d2d30] border border-[#3e3e42] hover:border-[#569cd6]/30 text-white disabled:text-[#858585] font-mono text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors duration-150 disabled:opacity-50"
                >
                  {creatingProject ? (
                    <span className="w-3 h-3 border-2 border-[#858585] border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                  <span>Create</span>
                </button>
              </form>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-[#3e3e42]/50 pt-4 text-[10px] font-mono">
            <span className="text-[#858585] flex items-center gap-1">
              <HelpCircle className="w-3 h-3" /> Session State:
            </span>
            <span className="text-[#4ec9b0] text-[10px] uppercase tracking-wider font-bold">Authenticated</span>
          </div>
        </div>

      </div>
    </div>
  );
}

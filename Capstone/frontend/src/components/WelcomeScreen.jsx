import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../store/authSlice';
import { Play, Sparkles, Terminal, Cpu, Layers, HelpCircle, AlertCircle, Plus, LogIn, Folder, ChevronRight, Check } from 'lucide-react';

export default function WelcomeScreen({ onCreateSandbox }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [newProjectTitle, setNewProjectTitle] = useState('');

  const [loading, setLoading] = useState(false);
  const [creatingProject, setCreatingProject] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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

  return (
    <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden bg-[#1e1e1e] select-none">
      <div className="max-w-xl w-full bg-[#252526] border border-[#3e3e42] rounded-xl p-8 shadow-2xl relative">
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-[#4ec9b0]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-[#569cd6]/5 rounded-full blur-3xl pointer-events-none" />

        {/* User Profile Info Badge */}
        {user && (
          <div className="mb-6 p-4 rounded-lg bg-[#1e1e1e] border border-[#3e3e42] flex items-center justify-between gap-4 font-mono">
            <div className="flex items-center gap-3">
              {user.avtar ? (
                <img
                  src={user.avtar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover border border-[#3e3e42]"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`;
                  }}
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#2a2d2e] border border-[#3e3e42] flex items-center justify-center text-[#569cd6] text-xs font-bold font-mono">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[#d4d4d4] truncate max-w-[200px]">{user.name}</span>
                <span className="text-[10px] text-[#858585] truncate max-w-[200px]">{user.email}</span>
              </div>
            </div>

            <button
              onClick={() => dispatch(logoutUser())}
              className="text-[10px] uppercase font-semibold text-[#f44747] hover:text-[#ff6a6a] border border-[#f44747]/20 hover:border-[#f44747]/40 px-2.5 py-1.5 rounded transition-all duration-150 cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        )}

        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2a2d2e] border border-[#3e3e42] text-[#4ec9b0] text-[10px] font-semibold uppercase tracking-wider mb-4 font-mono">
            <Cpu className="w-3.5 h-3.5 text-[#4ec9b0]" />
            Developer Dashboard
          </div>
          <h1 className="text-4xl font-extrabold text-[#d4d4d4] tracking-tight mb-2 flex justify-center items-center gap-2 font-mono">
            <svg className="w-8 h-8 text-[#569cd6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            CodeSpace
          </h1>
          <p className="text-[#858585] text-xs font-mono">
            Select an existing sandbox project or deploy a brand new environment.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-950/20 border border-red-900/30 text-[#f44747] rounded-lg text-xs flex gap-3 font-mono">
            <AlertCircle className="w-5 h-5 shrink-0 text-[#f44747]" />
            <div className="flex flex-col gap-2">
              <span>{errorMsg}</span>
            </div>
          </div>
        )}

        {/* Project Selection / List */}
        <div className="mb-6">
          <h3 className="text-xs font-mono font-semibold text-[#858585] mb-2 uppercase tracking-wide">
            Select Active Project
          </h3>

          {projects.length === 0 ? (
            <div className="p-4 rounded-lg bg-[#2d2d30] border border-dashed border-[#3e3e42] text-center text-xs text-[#858585] font-mono">
              No projects found. Create one below to begin.
            </div>
          ) : (
            <div className="max-h-[160px] overflow-y-auto border border-[#3e3e42] rounded-lg divide-y divide-[#3e3e42] custom-scrollbar bg-[#1e1e1e]">
              {projects.map((proj) => {
                const isSelected = selectedProjectId === proj._id;
                return (
                  <button
                    key={proj._id}
                    onClick={() => {
                      setSelectedProjectId(proj._id);
                      handleStart(proj._id);
                    }}
                    className={`w-full flex items-center justify-between p-3 text-left transition-all duration-150 cursor-pointer ${isSelected
                        ? 'bg-[#2d2d30] text-[#d4d4d4]'
                        : 'text-[#858585] hover:text-[#d4d4d4] hover:bg-[#202021]'
                      }`}
                  >
                    <div className="flex items-center gap-2.5 font-mono text-xs">
                      <Folder className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#4ec9b0]' : 'text-[#858585]'}`} />
                      <span className="font-semibold truncate max-w-[280px]">{proj.title}</span>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-[#4ec9b0] stroke-[2.5]" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Create New Project Section */}
        <form onSubmit={handleCreateProject} className="mb-8 p-3 rounded-lg bg-[#2d2d30]/65 border border-[#3e3e42] flex gap-2 items-center">
          <input
            type="text"
            placeholder="New Project Title..."
            value={newProjectTitle}
            onChange={(e) => setNewProjectTitle(e.target.value)}
            disabled={creatingProject}
            className="flex-1 bg-[#1e1e1e] border border-[#3e3e42] rounded px-3 py-1.5 font-mono text-xs text-[#d4d4d4] focus:outline-none focus:ring-1 focus:ring-[#007fd4] disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={creatingProject || !newProjectTitle.trim()}
            className="px-3.5 py-1.5 rounded bg-[#2a2d2e] hover:bg-[#3e3e42] border border-[#3e3e42] hover:border-[#569cd6]/30 text-[#d4d4d4] disabled:text-[#858585] font-mono text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors duration-150 disabled:opacity-50"
          >
            {creatingProject ? (
              <span className="w-3.5 h-3.5 border-2 border-[#858585] border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <Plus className="w-3.5 h-3.5" />
            )}
            <span>Create</span>
          </button>
        </form>

        {/* Action Controls */}
        <div className="flex flex-col gap-4">
          <button
            onClick={() => handleStart()}
            disabled={loading || !selectedProjectId}
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
            <span className="text-[#4ec9b0] text-[11px] uppercase tracking-wider font-bold">Authenticated</span>
          </div>
        </div>
      </div>
    </div>
  );
}

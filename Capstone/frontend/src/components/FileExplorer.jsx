import React, { useState } from 'react';
import { Folder, FolderOpen, FileCode, FolderTree } from 'lucide-react';

function buildFileTree(files) {
  const root = { name: 'Root', isFolder: true, children: {} };
  files.forEach(file => {
    const cleanFile = file.startsWith('/') ? file.slice(1) : file;
    const parts = cleanFile.split('/').filter(Boolean);
    let current = root;
    parts.forEach((part, index) => {
      const isLast = index === parts.length - 1;
      if (!current.children[part]) {
        current.children[part] = {
          name: part,
          path: '/' + parts.slice(0, index + 1).join('/'),
          isFolder: !isLast,
          children: isLast ? null : {}
        };
      }
      current = current.children[part];
    });
  });
  return root;
}

export default function FileExplorer({ files, activeFile, onSelectFile, modifiedFiles = [] }) {
  const [openFolders, setOpenFolders] = useState({ '/src': true, '/public': true });

  const toggleFolder = (path) => {
    setOpenFolders(prev => ({ ...prev, [path]: !prev[path] }));
  };

  const getFileIconClass = (name) => {
    if (name.endsWith('.jsx') || name.endsWith('.js')) return 'text-[#569cd6]';
    if (name.endsWith('.css')) return 'text-[#ce9178]';
    if (name.endsWith('.json')) return 'text-[#dcdcaa]';
    return 'text-[#d4d4d4]';
  };

  const fileTree = buildFileTree(files);

  const renderTree = (node, depth = 0) => {
    if (!node.children) return null;

    const keys = Object.keys(node.children).sort((a, b) => {
      const childA = node.children[a];
      const childB = node.children[b];
      if (childA.isFolder && !childB.isFolder) return -1;
      if (!childA.isFolder && childB.isFolder) return 1;
      return a.localeCompare(b);
    });

    return keys.map(key => {
      const child = node.children[key];

      if (child.isFolder) {
        const isOpen = !!openFolders[child.path];
        return (
          <div key={child.path}>
            <button
              onClick={() => toggleFolder(child.path)}
              style={{ paddingLeft: `${(depth * 8) + 12}px` }}
              className="w-full flex items-center gap-1.5 py-1 text-[#d4d4d4] hover:text-[#e2e8f0] text-xs font-mono font-medium hover:bg-[#37373d] transition-all duration-200 ease-in-out text-left cursor-pointer rounded focus:outline-none focus:ring-1 focus:ring-[#007fd4]"
            >
              {isOpen ? (
                <FolderOpen className="w-3.5 h-3.5 text-[#dcb67a] shrink-0" />
              ) : (
                <Folder className="w-3.5 h-3.5 text-[#dcb67a] shrink-0" />
              )}
              <span className="truncate">{child.name}</span>
            </button>
            {isOpen && renderTree(child, depth + 1)}
          </div>
        );
      } else {
        const isActive = activeFile === child.path;
        const isModified = modifiedFiles.includes(child.path);
        
        return (
          <button
            key={child.path}
            onClick={() => onSelectFile(child.path)}
            style={{ paddingLeft: `${(depth * 8) + 12}px` }}
            className={`w-full flex items-center gap-1.5 py-1 text-xs font-mono rounded transition-all duration-200 ease-in-out text-left cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#007fd4] ${
              isActive
                ? 'bg-[#094771] text-[#d4d4d4] font-semibold'
                : 'text-[#d4d4d4] hover:bg-[#37373d]'
            }`}
          >
            <FileCode className={`w-3.5 h-3.5 shrink-0 ${getFileIconClass(child.name)}`} />
            <span className="truncate flex-1">{child.name}</span>
            {isModified && (
              <span className="text-[#e2c08d] text-[10px] pr-2 ml-auto font-sans" title="Modified by AI">●</span>
            )}
          </button>
        );
      }
    });
  };

  return (
    <aside className="w-full flex flex-col h-full overflow-hidden select-none">
      {/* Explorer header */}
      <div className="h-10 px-4 border-b border-[#3e3e42] flex items-center justify-between shrink-0 bg-[#252526]">
        <div className="flex items-center gap-1.5 font-sans font-semibold text-[11px] text-[#bbbcbd] tracking-widest uppercase">
          <FolderTree className="w-4 h-4 text-[#569cd6]" />
          <span>Explorer</span>
        </div>
      </div>
      
      {/* File Tree lists */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
        <div className="space-y-1">
          {files.length === 0 ? (
            <div className="text-[#858585] text-xs text-center py-8 font-mono">
              Empty Workspace
            </div>
          ) : (
            renderTree(fileTree)
          )}
        </div>
      </div>
    </aside>
  );
}

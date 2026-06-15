import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser } from './store/authSlice';
import { Cpu } from 'lucide-react';
import AppRoutes from './route';
import { SandboxProvider } from './context/SandboxContext';
import { FileSystemProvider } from './context/FileSystemContext';
import { AIChatProvider } from './context/AIChatContext';

export default function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [initialChecked, setInitialChecked] = useState(false);

  useEffect(() => {
    dispatch(fetchCurrentUser()).finally(() => {
      setInitialChecked(true);
    });
  }, [dispatch]);

  if (!initialChecked) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#1e1e1e] font-mono select-none">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
            <svg className="spinner-ring w-full h-full absolute inset-0" viewBox="0 0 50 50">
              <circle
                cx="25"
                cy="25"
                fill="none"
                r="20"
                stroke="#569cd6"
                strokeDasharray="90, 150"
                strokeDashoffset="-35"
                strokeLinecap="round"
                strokeWidth="3"
              ></circle>
            </svg>
            <Cpu className="w-6 h-6 text-[#569cd6] animate-pulse" />
          </div>
          <p className="text-sm text-[#858585] tracking-wide animate-pulse">
            Verifying Authentication...
          </p>
        </div>
      </div>
    );
  }

  return (
    <SandboxProvider>
      <FileSystemProvider>
        <AIChatProvider>
          <AppRoutes isAuthenticated={isAuthenticated} />
        </AIChatProvider>
      </FileSystemProvider>
    </SandboxProvider>
  );
}

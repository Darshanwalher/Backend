import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useSandbox } from './SandboxContext';
import { useFileSystem } from './FileSystemContext';

const AIChatContext = createContext();

const standardizePath = (path) => {
  if (!path) return '';
  return path.startsWith('/') ? path : '/' + path;
};

export function AIChatProvider({ children }) {
  const { sandboxId, sandboxState } = useSandbox();
  const { 
    activeTab, 
    setFileContents, 
    setPreviewKey, 
    fetchFileTree, 
    setModifiedFiles 
  } = useFileSystem();

  const [chatMessages, setChatMessages] = useState(() => {
    try {
      const stored = localStorage.getItem('chatMessages');
      return stored ? JSON.parse(stored) : [
        { role: 'assistant', content: 'Sandbox environment created successfully. Ask me to make changes to your codebase!' }
      ];
    } catch {
      return [
        { role: 'assistant', content: 'Sandbox environment created successfully. Ask me to make changes to your codebase!' }
      ];
    }
  });

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiLogs, setAiLogs] = useState([]);

  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
      if (sandboxState === 'welcome') {
          setChatMessages([
              { role: 'assistant', content: 'Sandbox environment created successfully. Ask me to make changes to your codebase!' }
          ]);
          setAiLogs([]);
          setIsAiLoading(false);
      }
  }, [sandboxState]);

  const handleSendMessage = async (userPrompt) => {
    const userMsg = { role: 'user', content: userPrompt };
    setChatMessages(prev => [...prev, userMsg]);
    setIsAiLoading(true);

    let accumulatedLogs = ['Establishing SSE channel with agent...', 'Initializing AI model context...'];
    setAiLogs(accumulatedLogs);

    try {
      const response = await fetch('/api/ai/invoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          message: userPrompt,
          sandboxId: sandboxId
        })
      });

      if (!response.ok) {
        let errorMsg = `SSE request failed with status: ${response.status}`;
        try {
          const errData = await response.json();
          if (errData.error) errorMsg = errData.error;
        } catch (e) { }
        throw new Error(errorMsg);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let isDone = false;

      while (!isDone) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop();

        for (const part of parts) {
          const line = part.trim();
          if (!line || line.startsWith(':')) continue;

          const dataStr = line.startsWith('data: ') ? line.slice(6) : line;

          try {
            const event = JSON.parse(dataStr);

            if (event.type === 'log') {
              accumulatedLogs.push(event.message);
              setAiLogs([...accumulatedLogs]);

              if (event.message.toLowerCase().includes('updating files')) {
                const filePart = event.message.split('...')[1] || '';
                const files = filePart.split(',').map(f => f.trim()).filter(Boolean);
                files.forEach(f => {
                  setModifiedFiles(prev => [...new Set([...prev, standardizePath(f)])]);
                });
              }

            } else if (event.type === 'chunk') {
              accumulatedLogs.push('Processing response chunk...');
              setAiLogs([...accumulatedLogs]);

            } else if (event.type === 'done') {
              isDone = true;

            } else if (event.type === 'error') {
              throw new Error(event.message);
            }
          } catch (parseErr) {
            accumulatedLogs.push(dataStr);
            setAiLogs([...accumulatedLogs]);
          }
        }
      }

      accumulatedLogs.push('✅ AI invocation completed. Reloading workspace files...');
      setAiLogs([...accumulatedLogs]);

      await fetchFileTree();

      if (activeTab !== 'preview') {
        const activeRes = await fetch(`http://${sandboxId}.agent.localhost/read-files?files=${activeTab}`);
        if (activeRes.ok) {
          const activeData = await activeRes.json();
          let content = '';
          if (activeData.files && activeData.files[0]) {
            const fileObj = activeData.files[0];
            content = fileObj[activeTab] !== undefined ? fileObj[activeTab] : (fileObj[activeTab.slice(1)] || '');
          }
          setFileContents(prev => ({ ...prev, [activeTab]: content }));
        }
      }

      setPreviewKey(prev => prev + 1);

      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: `I've successfully processed the request and updated the files. Take a look at the code changes!`,
        logs: [...accumulatedLogs]
      }]);
      setIsAiLoading(false);
      toast.success('Agent invocation completed');

    } catch (err) {
      console.error('SSE connection error:', err);
      accumulatedLogs.push(`❌ Error: ${err.message.split('\n')[0]}`);
      setAiLogs([...accumulatedLogs]);
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: `**Agent Invocation Failed:**\n\n\`\`\`plaintext\n${err.message}\n\`\`\``,
        logs: [...accumulatedLogs]
      }]);
      setIsAiLoading(false);
      toast.error('Agent invocation failed');
    }
  };

  const clearChatMessages = () => {
    const defaultMsg = [
      { role: 'assistant', content: 'Sandbox environment created successfully. Ask me to make changes to your codebase!' }
    ];
    setChatMessages(defaultMsg);
    localStorage.setItem('chatMessages', JSON.stringify(defaultMsg));
    setAiLogs([]);
    toast.success('Chat history cleared');
  };

  return (
    <AIChatContext.Provider value={{
      chatMessages,
      isAiLoading,
      aiLogs,
      handleSendMessage,
      clearChatMessages
    }}>
      {children}
    </AIChatContext.Provider>
  );
}

export const useAIChat = () => useContext(AIChatContext);

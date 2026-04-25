import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

function renderMarkdownLight(text) {
  const parts = text.split(/(```[\s\S]*?```)/g);
  return parts.map((p, i) => {
    if (p.startsWith('```')) {
      const code = p.replace(/^```\w*\n?/, '').replace(/```$/, '');
      return (
        <pre key={i} className="bg-zinc-900 text-green-300 rounded-lg px-4 py-3 text-xs font-mono overflow-x-auto my-2 whitespace-pre-wrap">
          {code}
        </pre>
      );
    }
    return <span key={i}>{p}</span>;
  });
}

function ScoreBar({ label, score, isWinner }) {
  const pct = Math.round((score / 10) * 100);
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-medium text-zinc-400 w-6">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${isWinner ? 'bg-emerald-500' : 'bg-blue-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-mono text-zinc-400 w-5 text-right">{score}</span>
    </div>
  );
}

function SolutionCard({ label, solution, reasoning, score, isWinner }) {
  return (
    <div className={`flex flex-col rounded-xl border overflow-hidden transition-all ${
      isWinner ? 'border-emerald-500/60' : 'border-zinc-800'
    } bg-zinc-900`}>
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-800/60 border-b border-zinc-800">
        <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">{label}</span>
        {isWinner && (
          <span className="text-xs font-medium bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full">
            Winner
          </span>
        )}
      </div>
      <div className="p-4 text-sm text-zinc-300 leading-relaxed flex-1">
        {renderMarkdownLight(solution)}
      </div>
      {reasoning && (
        <div className="px-4 pb-4 text-xs text-zinc-500 leading-relaxed border-t border-zinc-800 pt-3">
          {reasoning}
        </div>
      )}
    </div>
  );
}

function JudgeStrip({ judge }) {
  const winner = judge.solution_1_score > judge.solution_2_score ? 1
    : judge.solution_2_score > judge.solution_1_score ? 2 : 0;
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-5 py-3 flex items-center gap-5 flex-wrap">
      <span className="text-xs uppercase tracking-widest text-zinc-600 font-medium flex-shrink-0">Score</span>
      <div className="flex-1 min-w-40 flex flex-col gap-2">
        <ScoreBar label="A" score={judge.solution_1_score} isWinner={winner === 1} />
        <ScoreBar label="B" score={judge.solution_2_score} isWinner={winner === 2} />
      </div>
      <span className="text-xs text-zinc-500">
        {winner === 0 ? 'Tie' : `Model ${winner === 1 ? 'A' : 'B'} wins`}
      </span>
    </div>
  );
}

function LoadingDots() {
  return (
    <div className="flex gap-1.5 py-3 px-1 items-center">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-zinc-600 animate-pulse"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
  );
}

export default function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || loading) return;

    const question = inputValue.trim();
    setInputValue('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:3000/invoke', { input: question });
      const data = response.data;

      setMessages(prev => [...prev, {
        id: Date.now(),
        problem: question,
        ...data.result
      }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: Date.now(),
        problem: question,
        error: 'Something went wrong. Please try again.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const winner = (judge) =>
    judge.solution_1_score > judge.solution_2_score ? 1
    : judge.solution_2_score > judge.solution_1_score ? 2 : 0;

  return (
    <div className="flex flex-col h-screen bg-zinc-950 font-sans">
      {/* Header */}
      <header className="py-3.5 px-6 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight text-zinc-100" style={{ fontFamily: 'Georgia, serif' }}>
          AI Arena
        </h1>
        <span className="text-xs font-medium uppercase tracking-widest bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-full">
          Live
        </span>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 md:px-8 py-8 w-full max-w-5xl mx-auto flex flex-col gap-10"
        style={{ scrollbarWidth: 'none' }}>

        {messages.length === 0 && !loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
            <div className="w-12 h-12 rounded-full border border-zinc-800 flex items-center justify-center mb-1">
              <svg className="w-5 h-5 text-zinc-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <p className="text-xl font-light italic text-zinc-400" style={{ fontFamily: 'Georgia, serif' }}>
              Two models enter, one wins.
            </p>
            <p className="text-sm text-zinc-600">Ask any coding question to start the battle.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const w = msg.judge ? winner(msg.judge) : 0;
            return (
              <div key={msg.id} className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-3 duration-400">
                {/* User bubble */}
                <div className="self-end bg-blue-500/10 text-blue-300 text-sm px-4 py-2.5 rounded-2xl rounded-br-sm max-w-[80%]">
                  {msg.problem}
                </div>

                {msg.error ? (
                  <p className="text-sm text-red-400">{msg.error}</p>
                ) : (
                  <>
                    {/* Solutions side by side */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <SolutionCard
                        label="Model A"
                        solution={msg.solution_1}
                        reasoning={msg.judge?.solution_1_reasoning}
                        score={msg.judge?.solution_1_score}
                        isWinner={w === 1}
                      />
                      <SolutionCard
                        label="Model B"
                        solution={msg.solution_2}
                        reasoning={msg.judge?.solution_2_reasoning}
                        score={msg.judge?.solution_2_score}
                        isWinner={w === 2}
                      />
                    </div>

                    {/* Score strip */}
                    {msg.judge && <JudgeStrip judge={msg.judge} />}
                  </>
                )}
              </div>
            );
          })
        )}

        {loading && (
          <div className="flex flex-col gap-3">
            <div className="self-end bg-blue-500/10 text-blue-300 text-sm px-4 py-2.5 rounded-2xl rounded-br-sm">
              {inputValue || '…'}
            </div>
            <LoadingDots />
          </div>
        )}

        <div ref={endRef} />
      </main>

      {/* Input */}
      <div className="border-t border-zinc-800 bg-zinc-950 p-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSend} className="flex items-center gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask a coding question…"
              disabled={loading}
              className="flex-1 bg-zinc-900 text-zinc-100 border border-zinc-800 rounded-full py-3 pl-5 pr-4 text-sm placeholder-zinc-600 focus:outline-none focus:border-zinc-600 disabled:opacity-50 transition-colors"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || loading}
              className="w-9 h-9 rounded-full bg-blue-500/15 hover:bg-blue-500/25 flex items-center justify-center flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z"/>
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useRef, useEffect, useCallback } from 'react';
import hljs from 'highlight.js';
import {
  startBattle,
  onSolutions,
  onJudge,
  onComplete,
  onError,
  removeAllBattleListeners,
} from '../services/socketService.js';
import ArenaResponse from './ArenaResponse.jsx';
import UserMessage from './UserMessage.jsx';

/* ─────────────────────────────────────────────
   Copy Button for Code Blocks
   ───────────────────────────────────────────── */
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`claude-copy-btn ${copied ? 'copied' : ''}`}
      type="button"
    >
      {copied ? (
        <>
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
          </svg>
          Copy
        </>
      )}
    </button>
  );
}

/* ─────────────────────────────────────────────
   Highlight code using highlight.js
   ───────────────────────────────────────────── */
function highlightCode(code, lang) {
  try {
    if (lang && lang !== 'code' && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
    return hljs.highlightAuto(code).value;
  } catch {
    return code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}

/* ─────────────────────────────────────────────
   Lightweight markdown: code blocks with copy
   ───────────────────────────────────────────── */
function renderMarkdownLight(text) {
  if (!text) return null;
  const parts = text.split(/(```[\s\S]*?```)/g);
  return parts.map((p, i) => {
    if (p.startsWith('```')) {
      const langMatch = p.match(/^```(\w+)/);
      const lang = langMatch ? langMatch[1] : 'code';
      const code = p.replace(/^```\w*\n?/, '').replace(/```$/, '');
      const highlighted = highlightCode(code, lang);
      return (
        <div key={i} className="claude-code-block">
          <div className="claude-code-header">
            <span className="claude-code-lang">{lang}</span>
            <CopyButton text={code} />
          </div>
          <pre className="claude-code-pre">
            <code dangerouslySetInnerHTML={{ __html: highlighted }} />
          </pre>
        </div>
      );
    }
    return <span key={i}>{p}</span>;
  });
}

/* ─────────────────────────────────────────────
   Score Bar  (used in JudgeStrip)
   ───────────────────────────────────────────── */
function ScoreBar({ label, score, isWinner }) {
  const pct = Math.round((score / 10) * 100);
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-semibold w-6" style={{ color: 'var(--color-claude-text-muted)' }}>
        {label}
      </span>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-claude-border-subtle)' }}>
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${pct}%`,
            background: isWinner
              ? 'linear-gradient(90deg, #DA7756, #E8825C)'
              : 'linear-gradient(90deg, #A78BFA, #8B5CF6)',
          }}
        />
      </div>
      <span className="text-xs font-mono w-5 text-right" style={{ color: 'var(--color-claude-text-muted)' }}>
        {score}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Solution Card
   ───────────────────────────────────────────── */
function SolutionCard({ label, solution, reasoning, score, isWinner, isLoading }) {
  return (
    <div
      className={`flex flex-col rounded-2xl overflow-hidden transition-all duration-500 ${
        isWinner ? 'claude-pulse-glow' : ''
      }`}
      style={{
        background: 'var(--color-claude-bg-card)',
        border: isWinner
          ? '1px solid var(--color-claude-accent)'
          : '1px solid var(--color-claude-border)',
      }}
    >
      {/* Card header */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{
          background: 'var(--color-claude-bg-elevated)',
          borderBottom: '1px solid var(--color-claude-border)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <span
            className="w-2 h-2 rounded-full"
            style={{
              background: label === 'Model A'
                ? 'var(--color-claude-accent)'
                : '#A78BFA',
            }}
          />
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-claude-text-muted)' }}>
            {label}
          </span>
        </div>
        {isWinner && (
          <span
            className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1"
            style={{
              background: 'var(--color-claude-accent-soft)',
              color: 'var(--color-claude-accent)',
              border: '1px solid rgba(218, 119, 86, 0.2)',
            }}
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            Winner
          </span>
        )}
        {isLoading && (
          <span
            className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full claude-border-glow"
            style={{
              background: 'var(--color-claude-accent-soft)',
              color: 'var(--color-claude-accent)',
              border: '1px solid rgba(218, 119, 86, 0.2)',
            }}
          >
            Judging…
          </span>
        )}
      </div>

      {/* Card body */}
      <div className="p-5 text-sm leading-relaxed flex-1" style={{ color: 'var(--color-claude-text-secondary)' }}>
        {solution ? (
          renderMarkdownLight(solution)
        ) : (
          /* Shimmer loading skeleton */
          <div className="flex flex-col gap-3">
            <div className="claude-shimmer h-4 rounded-lg w-full" />
            <div className="claude-shimmer h-4 rounded-lg w-5/6" style={{ animationDelay: '0.2s' }} />
            <div className="claude-shimmer h-4 rounded-lg w-4/6" style={{ animationDelay: '0.4s' }} />
            <div className="claude-shimmer h-20 rounded-lg w-full mt-1" style={{ animationDelay: '0.6s' }} />
            <div className="claude-shimmer h-4 rounded-lg w-3/4" style={{ animationDelay: '0.8s' }} />
          </div>
        )}
      </div>

      {/* Reasoning footer */}
      {reasoning && (
        <div
          className="flex items-start gap-3 px-5 py-4"
          style={{
            borderTop: '1px solid var(--color-claude-border)',
            background: 'rgba(26, 24, 22, 0.4)',
          }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{
              background: isWinner ? 'var(--color-claude-accent-soft)' : 'var(--color-claude-runner-bg)',
              border: `1px solid ${isWinner ? 'rgba(218,119,86,0.2)' : 'rgba(167,139,250,0.2)'}`,
            }}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke={isWinner ? '#DA7756' : '#A78BFA'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
          </div>
          <p className="text-xs leading-relaxed pt-0.5" style={{ color: 'var(--color-claude-text-muted)' }}>
            {reasoning}
          </p>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Judge Verdict Strip
   ───────────────────────────────────────────── */
function JudgeStrip({ judge }) {
  const winner = judge.solution_1_score > judge.solution_2_score ? 1
    : judge.solution_2_score > judge.solution_1_score ? 2 : 0;
  return (
    <div
      className="claude-glass rounded-2xl px-5 py-4 flex items-center gap-5 flex-wrap claude-fade-in"
    >
      <div className="flex items-center gap-2.5 shrink-0">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{
            background: 'var(--color-claude-accent-soft)',
            border: '1px solid rgba(218, 119, 86, 0.15)',
          }}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="var(--color-claude-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
          </svg>
        </div>
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-claude-text-faint)' }}>
          Verdict
        </span>
      </div>
      <div className="flex-1 min-w-40 flex flex-col gap-2.5">
        <ScoreBar label="A" score={judge.solution_1_score} isWinner={winner === 1} />
        <ScoreBar label="B" score={judge.solution_2_score} isWinner={winner === 2} />
      </div>
      <span
        className="text-xs font-semibold px-3 py-1 rounded-full"
        style={{
          color: winner === 0 ? 'var(--color-claude-text-muted)' : 'var(--color-claude-accent)',
          background: winner === 0 ? 'var(--color-claude-bg-card)' : 'var(--color-claude-accent-soft)',
          border: `1px solid ${winner === 0 ? 'var(--color-claude-border)' : 'rgba(218,119,86,0.2)'}`,
        }}
      >
        {winner === 0 ? 'Tie' : `Model ${winner === 1 ? 'A' : 'B'} wins`}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Loading Dots (Claude warm breathing)
   ───────────────────────────────────────────── */
function LoadingDots() {
  return (
    <div className="flex gap-2 py-4 px-1 items-center">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-2 h-2 rounded-full claude-breathe"
          style={{
            background: 'var(--color-claude-accent)',
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Claude Logo / Sparkle Icon
   ───────────────────────────────────────────── */
function ClaudeIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v1m0 16v1m-9-9h1m16 0h1m-2.636-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707.707"/>
      <circle cx="12" cy="12" r="4" fill="currentColor" opacity="0.15"/>
      <circle cx="12" cy="12" r="2" fill="currentColor"/>
    </svg>
  );
}

/* ═════════════════════════════════════════════
   Main Chat Interface
   ═════════════════════════════════════════════ */
export default function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const currentBattleIdRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    const unsubSolutions = onSolutions(({ solution_1, solution_2 }) => {
      const battleId = currentBattleIdRef.current;
      if (!battleId) return;

      setMessages(prev =>
        prev.map(msg =>
          msg.id === battleId
            ? { ...msg, solution_1, solution_2, status: 'judging' }
            : msg
        )
      );
    });

    const unsubJudge = onJudge(({ judge }) => {
      const battleId = currentBattleIdRef.current;
      if (!battleId) return;

      setMessages(prev =>
        prev.map(msg =>
          msg.id === battleId
            ? { ...msg, judge, status: 'complete' }
            : msg
        )
      );
    });

    const unsubComplete = onComplete(() => {
      currentBattleIdRef.current = null;
      setLoading(false);
    });

    const unsubError = onError(({ message }) => {
      const battleId = currentBattleIdRef.current;

      if (battleId) {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === battleId
              ? { ...msg, error: message || 'Something went wrong. Please try again.', status: 'error' }
              : msg
          )
        );
      }

      currentBattleIdRef.current = null;
      setLoading(false);
    });

    return () => {
      unsubSolutions();
      unsubJudge();
      unsubComplete();
      unsubError();
      removeAllBattleListeners();
    };
  }, []);

  const handleSend = useCallback((e) => {
    e.preventDefault();
    if (!inputValue.trim() || loading) return;

    const question = inputValue.trim();
    const battleId = Date.now();

    setInputValue('');
    setLoading(true);

    setMessages(prev => [...prev, {
      id: battleId,
      problem: question,
      solution_1: null,
      solution_2: null,
      judge: null,
      error: null,
      status: 'waiting',
    }]);

    currentBattleIdRef.current = battleId;
    startBattle(question);
  }, [inputValue, loading]);

  const winner = (judge) =>
    judge.solution_1_score > judge.solution_2_score ? 1
    : judge.solution_2_score > judge.solution_1_score ? 2 : 0;

  return (
    <div
      className="flex flex-col h-screen font-sans"
      style={{ background: 'var(--color-claude-bg)', color: 'var(--color-claude-text-primary)' }}
    >
      {/* ─── Header ─── */}
      <header
        className="claude-glass sticky top-0 z-10 py-3.5 px-6 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--color-claude-glass-border)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center claude-gradient-shift"
            style={{
              background: 'linear-gradient(135deg, #DA7756, #E8825C, #D97706)',
              backgroundSize: '200% 200%',
            }}
          >
            <ClaudeIcon className="w-4 h-4 text-white" />
          </div>
          <h1
            className="text-lg font-semibold tracking-tight"
            style={{ color: 'var(--color-claude-text-primary)' }}
          >
            AI Arena
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="w-1.5 h-1.5 rounded-full claude-breathe"
            style={{ background: 'var(--color-claude-accent)', animationDelay: '0s' }}
          />
          <span
            className="text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full"
            style={{
              background: 'var(--color-claude-accent-soft)',
              color: 'var(--color-claude-accent)',
              border: '1px solid rgba(218, 119, 86, 0.15)',
            }}
          >
            Live
          </span>
        </div>
      </header>

      {/* ─── Messages ─── */}
      <main
        className="flex-1 overflow-y-auto px-4 md:px-8 py-8 w-full max-w-5xl mx-auto flex flex-col gap-10"
      >
        {messages.length === 0 && !loading ? (
          /* ─── Empty State Hero ─── */
          <div className="flex-1 flex flex-col items-center justify-center gap-5 text-center claude-fade-in">
            {/* Animated icon */}
            <div className="relative">
              <div
                className="w-20 h-20 rounded-3xl flex items-center justify-center claude-gradient-shift"
                style={{
                  background: 'linear-gradient(135deg, rgba(218,119,86,0.15), rgba(167,139,250,0.10))',
                  border: '1px solid rgba(218, 119, 86, 0.12)',
                }}
              >
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--color-claude-accent)' }}>
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor" opacity="0.8"/>
                </svg>
              </div>
              {/* Orbiting dot */}
              <div
                className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
                style={{
                  background: 'var(--color-claude-accent)',
                  boxShadow: '0 0 12px rgba(218, 119, 86, 0.4)',
                  animation: 'claude-breathe 2s ease-in-out infinite',
                }}
              />
            </div>

            <div className="flex flex-col gap-2">
              <p
                className="text-2xl font-light"
                style={{ color: 'var(--color-claude-text-primary)' }}
              >
                Two models enter, <span style={{ color: 'var(--color-claude-accent)', fontWeight: 500 }}>one wins.</span>
              </p>
              <p className="text-sm" style={{ color: 'var(--color-claude-text-muted)' }}>
                Ask any coding question to ignite the battle.
              </p>
            </div>

            {/* Suggestion chips */}
            <div className="flex flex-wrap gap-2 mt-2 justify-center max-w-md">
              {[
                'Implement a debounce function',
                'Binary search in Python',
                'React custom hook for fetch',
              ].map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => setInputValue(suggestion)}
                  className="text-xs px-3.5 py-2 rounded-full transition-all duration-300 cursor-pointer hover:scale-105"
                  style={{
                    background: 'var(--color-claude-bg-card)',
                    border: '1px solid var(--color-claude-border)',
                    color: 'var(--color-claude-text-secondary)',
                  }}
                  onMouseEnter={e => {
                    e.target.style.borderColor = 'var(--color-claude-accent)';
                    e.target.style.color = 'var(--color-claude-accent)';
                  }}
                  onMouseLeave={e => {
                    e.target.style.borderColor = 'var(--color-claude-border)';
                    e.target.style.color = 'var(--color-claude-text-secondary)';
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, msgIndex) => {
            const w = msg.judge ? winner(msg.judge) : 0;
            const isJudging = msg.status === 'judging';
            const isWaiting = msg.status === 'waiting';

            return (
              <div
                key={msg.id}
                className="flex flex-col gap-4 claude-slide-up"
                style={{ animationDelay: `${msgIndex * 0.05}s` }}
              >
                {/* User bubble */}
                <UserMessage message={msg.problem} />

                {msg.error ? (
                  <div
                    className="flex items-center gap-2 text-sm px-4 py-3 rounded-xl"
                    style={{
                      background: 'rgba(239, 68, 68, 0.08)',
                      border: '1px solid rgba(239, 68, 68, 0.15)',
                      color: 'var(--color-claude-error)',
                    }}
                  >
                    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                    {msg.error}
                  </div>
                ) : (
                  <ArenaResponse
                    solution1={isWaiting ? null : msg.solution_1}
                    solution2={isWaiting ? null : msg.solution_2}
                    judge={msg.judge}
                    isJudging={isJudging}
                  />
                )}
              </div>
            );
          })
        )}

        {loading && messages.length > 0 && messages[messages.length - 1]?.status === 'waiting' && (
          <LoadingDots />
        )}

        <div ref={endRef} />
      </main>

      {/* ─── Input Area ─── */}
      <div
        className="p-4"
        style={{
          borderTop: '1px solid var(--color-claude-border)',
          background: 'var(--color-claude-bg)',
        }}
      >
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSend} className="flex items-center gap-3">
            <div
              className="flex-1 flex items-center rounded-2xl px-5 transition-all duration-300"
              style={{
                background: 'var(--color-claude-input-bg)',
                border: '1px solid var(--color-claude-input-border)',
                outline: 'none',
              }}
              onFocusCapture={e => e.currentTarget.style.borderColor = 'var(--color-claude-accent)'}
              onBlurCapture={e => e.currentTarget.style.borderColor = 'var(--color-claude-input-border)'}
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask a coding question…"
                disabled={loading}
                className="flex-1 bg-transparent py-3.5 text-sm placeholder-[var(--color-claude-text-faint)] disabled:opacity-50 transition-colors"
                style={{ color: 'var(--color-claude-text-primary)', outline: 'none' }}
              />
            </div>
            <button
              type="submit"
              disabled={!inputValue.trim() || loading}
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 cursor-pointer"
              style={{
                background: !inputValue.trim() || loading
                  ? 'var(--color-claude-bg-card)'
                  : 'linear-gradient(135deg, #DA7756, #E8825C)',
                border: '1px solid',
                borderColor: !inputValue.trim() || loading
                  ? 'var(--color-claude-border)'
                  : 'rgba(218, 119, 86, 0.4)',
                outline: 'none',
              }}
              onMouseEnter={e => {
                if (inputValue.trim() && !loading) {
                  e.currentTarget.style.transform = 'scale(1.08)';
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(218, 119, 86, 0.3)';
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z"/>
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
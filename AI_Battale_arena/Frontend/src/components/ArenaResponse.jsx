import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';

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
   Markdown Components — Claude Warm Theme
   ───────────────────────────────────────────── */
const mdComponents = {
  h1: ({ node, ...props }) => (
    <h1
      className="text-xl font-semibold mt-5 mb-3"
      style={{ color: 'var(--color-claude-text-primary)' }}
      {...props}
    />
  ),
  h2: ({ node, ...props }) => (
    <h2
      className="text-lg font-semibold mt-4 mb-2"
      style={{ color: 'var(--color-claude-text-primary)' }}
      {...props}
    />
  ),
  h3: ({ node, ...props }) => (
    <h3
      className="text-base font-semibold mt-3 mb-1"
      style={{ color: 'var(--color-claude-text-secondary)' }}
      {...props}
    />
  ),
  p: ({ node, ...props }) => (
    <p
      className="mb-3 leading-relaxed text-sm"
      style={{ color: 'var(--color-claude-text-secondary)' }}
      {...props}
    />
  ),
  ul: ({ node, ...props }) => (
    <ul
      className="list-disc pl-5 mb-3 text-sm space-y-1"
      style={{ color: 'var(--color-claude-text-secondary)' }}
      {...props}
    />
  ),
  ol: ({ node, ...props }) => (
    <ol
      className="list-decimal pl-5 mb-3 text-sm space-y-1"
      style={{ color: 'var(--color-claude-text-secondary)' }}
      {...props}
    />
  ),
  li: ({ node, ...props }) => (
    <li className="leading-relaxed" {...props} />
  ),
  a: ({ node, ...props }) => (
    <a
      className="underline underline-offset-2 transition-colors duration-200"
      style={{ color: 'var(--color-claude-accent)' }}
      onMouseEnter={e => e.target.style.color = 'var(--color-claude-accent-hover)'}
      onMouseLeave={e => e.target.style.color = 'var(--color-claude-accent)'}
      {...props}
    />
  ),
  strong: ({ node, ...props }) => (
    <strong
      className="font-semibold"
      style={{ color: 'var(--color-claude-text-primary)' }}
      {...props}
    />
  ),
  blockquote: ({ node, ...props }) => (
    <blockquote
      className="pl-4 my-3 italic text-sm"
      style={{
        borderLeft: '2px solid var(--color-claude-accent)',
        color: 'var(--color-claude-text-muted)',
      }}
      {...props}
    />
  ),
  code: ({ node, inline, className, children, ...props }) => {
    const codeText = String(children).replace(/\n$/, '');
    const langMatch = className?.match(/language-(\w+)/);
    const lang = langMatch ? langMatch[1] : 'code';

    if (!inline) {
      let highlighted;
      try {
        if (lang && lang !== 'code' && hljs.getLanguage(lang)) {
          highlighted = hljs.highlight(codeText, { language: lang }).value;
        } else {
          highlighted = hljs.highlightAuto(codeText).value;
        }
      } catch {
        highlighted = codeText
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
      }

      return (
        <div className="claude-code-block">
          <div className="claude-code-header">
            <span className="claude-code-lang">{lang}</span>
            <CopyButton text={codeText} />
          </div>
          <pre className="claude-code-pre">
            <code dangerouslySetInnerHTML={{ __html: highlighted }} />
          </pre>
        </div>
      );
    }

    return (
      <code className="claude-inline-code" {...props}>
        {children}
      </code>
    );
  },
};

/* ─────────────────────────────────────────────
   Score Ring  (SVG circle)
   ───────────────────────────────────────────── */
function ScoreRing({ score, isWinner }) {
  const radius = 18;
  const circ = 2 * Math.PI * radius;
  const fill = (score / 10) * circ;
  const color = isWinner ? '#DA7756' : '#A78BFA';
  const bgColor = isWinner ? 'rgba(218, 119, 86, 0.08)' : 'rgba(167, 139, 250, 0.08)';

  return (
    <div
      className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
      style={{ background: bgColor }}
    >
      <svg width="48" height="48" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r={radius} fill="none" stroke="var(--color-claude-border)" strokeWidth="3" />
        <circle
          cx="24" cy="24" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeDasharray={`${fill} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 24 24)"
          style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(.4,0,.2,1)' }}
        />
        <text
          x="24" y="28"
          textAnchor="middle"
          fontSize="11"
          fontWeight="600"
          fill={color}
          fontFamily="'Inter', monospace"
        >
          {score}
        </text>
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Solution Card
   ───────────────────────────────────────────── */
function SolutionCard({ label, dotColor, solution, reasoning, score, isWinner, isLoading }) {
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
            style={{ background: dotColor }}
          />
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: 'var(--color-claude-text-muted)' }}
          >
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

      {/* Markdown body */}
      <div className="p-5 flex-1 min-h-0">
        {solution ? (
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
            {solution}
          </ReactMarkdown>
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

      {/* Judge reasoning footer */}
      {reasoning && (
        <div
          className="flex items-start gap-3 px-5 py-4"
          style={{
            borderTop: '1px solid var(--color-claude-border)',
            background: 'rgba(26, 24, 22, 0.4)',
          }}
        >
          <ScoreRing score={score} isWinner={isWinner} />
          <p
            className="text-xs leading-relaxed pt-1.5"
            style={{ color: 'var(--color-claude-text-muted)' }}
          >
            {reasoning}
          </p>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Judge Bar
   ───────────────────────────────────────────── */
function JudgeBar({ label, score, isWinner }) {
  const pct = Math.round((score / 10) * 100);
  return (
    <div className="flex items-center gap-3">
      <span
        className="text-xs font-mono w-5"
        style={{ color: 'var(--color-claude-text-muted)' }}
      >
        {label}
      </span>
      <div
        className="flex-1 h-1.5 rounded-full overflow-hidden"
        style={{ background: 'var(--color-claude-border-subtle)' }}
      >
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
      <span
        className="text-xs font-mono w-8 text-right"
        style={{ color: 'var(--color-claude-text-muted)' }}
      >
        {score}/10
      </span>
    </div>
  );
}

/* ═════════════════════════════════════════════
   Arena Response — Main Export
   ═════════════════════════════════════════════ */
export default function ArenaResponse({ solution1, solution2, judge, isJudging }) {
  const s1 = judge?.solution_1_score ?? 0;
  const s2 = judge?.solution_2_score ?? 0;
  const winner = s1 > s2 ? 1 : s2 > s1 ? 2 : 0;

  return (
    <div className="flex flex-col gap-4 w-full">

      {/* Solutions grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SolutionCard
          label="Model A"
          dotColor="#DA7756"
          solution={solution1}
          reasoning={judge?.solution_1_reasoning}
          score={s1}
          isWinner={winner === 1}
          isLoading={isJudging}
        />
        <SolutionCard
          label="Model B"
          dotColor="#A78BFA"
          solution={solution2}
          reasoning={judge?.solution_2_reasoning}
          score={s2}
          isWinner={winner === 2}
          isLoading={isJudging}
        />
      </div>

      {/* Judge strip */}
      {judge && (
        <div
          className="claude-glass rounded-2xl px-5 py-4 flex items-center gap-6 flex-wrap claude-fade-in"
        >
          <div className="flex items-center gap-2.5 flex-shrink-0">
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
            <span
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: 'var(--color-claude-text-faint)' }}
            >
              Verdict
            </span>
          </div>
          <div className="flex-1 min-w-48 flex flex-col gap-2.5">
            <JudgeBar label="S1" score={s1} isWinner={winner === 1} />
            <JudgeBar label="S2" score={s2} isWinner={winner === 2} />
          </div>
          <span
            className="text-xs font-semibold flex-shrink-0 px-3 py-1 rounded-full"
            style={{
              color: winner === 0 ? 'var(--color-claude-text-muted)' : 'var(--color-claude-accent)',
              background: winner === 0 ? 'var(--color-claude-bg-card)' : 'var(--color-claude-accent-soft)',
              border: `1px solid ${winner === 0 ? 'var(--color-claude-border)' : 'rgba(218,119,86,0.2)'}`,
            }}
          >
            {winner === 0 ? 'Tie' : `Solution ${winner} wins`}
          </span>
        </div>
      )}
    </div>
  );
}
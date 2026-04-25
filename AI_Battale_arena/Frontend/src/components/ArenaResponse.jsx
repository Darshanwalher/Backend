import React, { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';

const mdComponents = {
  h1: ({ node, ...props }) => <h1 className="text-xl font-semibold mt-5 mb-3 text-zinc-100" {...props} />,
  h2: ({ node, ...props }) => <h2 className="text-lg font-semibold mt-4 mb-2 text-zinc-100" {...props} />,
  h3: ({ node, ...props }) => <h3 className="text-base font-semibold mt-3 mb-1 text-zinc-200" {...props} />,
  p: ({ node, ...props }) => <p className="mb-3 leading-relaxed text-zinc-300 text-sm" {...props} />,
  ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-3 text-zinc-300 text-sm space-y-1" {...props} />,
  ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-3 text-zinc-300 text-sm space-y-1" {...props} />,
  li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
  a: ({ node, ...props }) => <a className="text-blue-400 hover:text-blue-300 underline underline-offset-2" {...props} />,
  strong: ({ node, ...props }) => <strong className="font-semibold text-zinc-100" {...props} />,
  blockquote: ({ node, ...props }) => (
    <blockquote className="border-l-2 border-zinc-700 pl-4 my-3 text-zinc-400 italic text-sm" {...props} />
  ),
  code: ({ node, inline, className, children, ...props }) =>
    !inline ? (
      <div className="rounded-lg overflow-hidden my-3 border border-zinc-700/60">
        <pre className="p-4 bg-zinc-950 overflow-x-auto text-xs leading-relaxed">
          <code className={className} {...props}>{children}</code>
        </pre>
      </div>
    ) : (
      <code className="bg-zinc-800 text-emerald-300 px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
        {children}
      </code>
    ),
};

function ScoreRing({ score, color }) {
  const radius = 18;
  const circ = 2 * Math.PI * radius;
  const fill = (score / 10) * circ;
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" className="flex-shrink-0">
      <circle cx="24" cy="24" r={radius} fill="none" stroke="#27272a" strokeWidth="3.5" />
      <circle
        cx="24" cy="24" r={radius}
        fill="none"
        stroke={color}
        strokeWidth="3.5"
        strokeDasharray={`${fill} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 24 24)"
        style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(.4,0,.2,1)' }}
      />
      <text x="24" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill={color} fontFamily="monospace">
        {score}
      </text>
    </svg>
  );
}

function SolutionCard({ label, dotColor, ringColor, solution, reasoning, score, isWinner }) {
  return (
    <div className={`flex flex-col rounded-2xl border overflow-hidden transition-all duration-300 ${
      isWinner
        ? 'border-emerald-500/50 shadow-[0_0_0_1px_rgba(16,185,129,0.15)]'
        : 'border-zinc-800'
    } bg-zinc-900`}>

      {/* Card header */}
      <div className="flex items-center justify-between px-5 py-3 bg-zinc-800/50 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${dotColor}`} />
          <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">{label}</span>
        </div>
        {isWinner && (
          <span className="text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            Winner
          </span>
        )}
      </div>

      {/* Markdown body */}
      <div className="p-5 flex-1 min-h-0">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
          {solution}
        </ReactMarkdown>
      </div>

      {/* Judge reasoning footer */}
      {reasoning && (
        <div className="flex items-start gap-3 px-5 py-4 border-t border-zinc-800 bg-zinc-950/40">
          <ScoreRing score={score} color={isWinner ? '#10b981' : '#6366f1'} />
          <p className="text-xs text-zinc-500 leading-relaxed pt-0.5">{reasoning}</p>
        </div>
      )}
    </div>
  );
}

function JudgeBar({ label, score, isWinner }) {
  const pct = Math.round((score / 10) * 100);
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-mono text-zinc-500 w-5">{label}</span>
      <div className="flex-1 h-1 rounded-full bg-zinc-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${isWinner ? 'bg-emerald-500' : 'bg-indigo-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-mono text-zinc-500 w-8 text-right">{score}/10</span>
    </div>
  );
}

export default function ArenaResponse({ solution1, solution2, judge }) {
  useEffect(() => {
    hljs.highlightAll();
  }, [solution1, solution2]);

  const s1 = judge?.solution_1_score ?? 0;
  const s2 = judge?.solution_2_score ?? 0;
  const winner = s1 > s2 ? 1 : s2 > s1 ? 2 : 0;

  return (
    <div className="flex flex-col gap-4 w-full">

      {/* Solutions grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SolutionCard
          label="Solution 1"
          dotColor="bg-emerald-500"
          ringColor="#10b981"
          solution={solution1}
          reasoning={judge?.solution_1_reasoning}
          score={s1}
          isWinner={winner === 1}
        />
        <SolutionCard
          label="Solution 2"
          dotColor="bg-indigo-500"
          ringColor="#6366f1"
          solution={solution2}
          reasoning={judge?.solution_2_reasoning}
          score={s2}
          isWinner={winner === 2}
        />
      </div>

      {/* Judge strip */}
      {judge && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 px-5 py-4 flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-base">⚖️</span>
            <span className="text-xs font-semibold uppercase tracking-widest text-zinc-600">Verdict</span>
          </div>
          <div className="flex-1 min-w-48 flex flex-col gap-2">
            <JudgeBar label="S1" score={s1} isWinner={winner === 1} />
            <JudgeBar label="S2" score={s2} isWinner={winner === 2} />
          </div>
          <span className="text-xs font-medium text-zinc-400 flex-shrink-0">
            {winner === 0 ? 'Tie' : `Solution ${winner} wins`}
          </span>
        </div>
      )}
    </div>
  );
}
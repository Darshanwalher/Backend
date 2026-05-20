import React from 'react';

export default function UserMessage({ message }) {
  return (
    <div className="flex justify-end my-4">
      <div
        className="px-5 py-3 rounded-2xl rounded-br-sm max-w-[75%] text-sm leading-relaxed transition-all duration-300"
        style={{
          background: 'var(--color-claude-user-bubble)',
          border: '1px solid var(--color-claude-user-border)',
          color: 'var(--color-claude-accent-hover)',
          boxShadow: '0 2px 12px rgba(218, 119, 86, 0.06)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(218, 119, 86, 0.12)';
          e.currentTarget.style.borderColor = 'rgba(218, 119, 86, 0.3)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.boxShadow = '0 2px 12px rgba(218, 119, 86, 0.06)';
          e.currentTarget.style.borderColor = 'var(--color-claude-user-border)';
        }}
      >
        {message}
      </div>
    </div>
  );
}
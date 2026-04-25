import React from 'react';

export default function UserMessage({ message }) {
  return (
    <div className="flex justify-end my-4">
      <div className="bg-blue-500/10 text-blue-300 border border-blue-500/15 px-5 py-3 rounded-2xl rounded-br-sm max-w-[75%] text-sm leading-relaxed">
        {message}
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import ChatBox from './ChatSection';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <ChatBox />
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-6 right-6 z-50 transition-all duration-300 shadow-lg hover:shadow-xl ${
          open ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'
        } text-white px-5 py-3.5 rounded-full font-medium flex items-center gap-2 hover:scale-105 active:scale-95`}
      >
        <span className="text-sm">{open ? 'Close' : 'Chat with AI'}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {open ? (
            <path d="M18 6L6 18M6 6l12 12" />
          ) : (
            <>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </>
          )}
        </svg>
      </button>
    </>
  );
}

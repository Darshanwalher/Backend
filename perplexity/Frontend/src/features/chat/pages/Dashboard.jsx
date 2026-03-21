import React, { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useChat } from '../hooks/useChat'
import useAuth from '../../auth/hook/useAuth'

// ─────────────────────────────────────────────
//  SVG icon paths used in the action buttons
//  below each AI answer (Copy, Retry, Good)
// ─────────────────────────────────────────────
const ACTION_BUTTONS = [
  {
    label: 'Copy',
    d: 'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z',
  },
  {
    label: 'Retry',
    d: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
  },
  {
    label: 'Good',
    d: 'M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5',
  },
]

// ─────────────────────────────────────────────
//  Perplexity-style logo SVG
//  Reused in sidebar header and mobile drawer
// ─────────────────────────────────────────────
const LogoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M5.73486 2L11.4299 7.24715V7.24595V2.01211H12.5385V7.27063L18.2591 2V7.98253H20.6078V16.6118H18.2663V21.9389L12.5385 16.9066V21.9967H11.4299V16.9896L5.74131 22V16.6118H3.39258V7.98253H5.73486V2ZM10.5942 9.0776H4.50118V15.5167H5.73992V13.4856L10.5942 9.0776ZM6.84986 13.9715V19.5565L11.4299 15.5225V9.81146L6.84986 13.9715ZM12.5704 15.4691L17.1577 19.4994V16.6118H17.1518V13.9663L12.5704 9.80608V15.4691ZM18.2663 15.5167H19.4992V9.0776H13.4516L18.2663 13.4399V15.5167ZM17.1505 7.98253V4.51888L13.3911 7.98253H17.1505ZM10.6028 7.98253L6.84346 4.51888V7.98253H10.6028Z"></path></svg>
)

// ─────────────────────────────────────────────
//  Logout arrow SVG
//  Reused in desktop sidebar and mobile drawer
// ─────────────────────────────────────────────
const LogoutIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-3.5 h-3.5 flex-shrink-0"
  >
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
)

// ─────────────────────────────────────────────
//  New Chat icon (plus/pencil)
//  Reused in desktop sidebar and mobile drawer
// ─────────────────────────────────────────────
const NewChatIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-3.5 h-3.5 shrink-0"
  >
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
)

/**
 * Dashboard — Main application page shown after login.
 *
 * Layout:
 *  ┌──────────────┬──────────────────────────────┐
 *  │   Sidebar    │        Chat Area              │
 *  │  (desktop)   │  Messages + Floating Input    │
 *  └──────────────┴──────────────────────────────┘
 *
 * Features:
 *  - Collapsible desktop sidebar (200px ↔ 52px)
 *  - Mobile slide-in drawer with dark overlay
 *  - New Chat button — resets to empty state for a new conversation
 *  - Per-chat lazy-loaded message history from Redux
 *  - AI "Thinking" animation while waiting for response
 *  - ReactMarkdown with GFM (tables, strikethrough, task lists)
 *  - Logout button in sidebar footer
 */
const Dashboard = () => {

  // ── Hooks ──────────────────────────────────
  const chat = useChat()
  const auth = useAuth()
  const navigate = useNavigate()

  // ── Local UI state ─────────────────────────
  const [chatInput, setChatInput] = useState('')              // controlled textarea value
  const [isThinking, setIsThinking] = useState(false)        // shows thinking dots while AI responds
  const [sidebarOpen, setSidebarOpen] = useState(true)       // desktop sidebar open/collapsed
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false) // mobile drawer open/closed

  // ── Refs ───────────────────────────────────
  const messagesEndRef = useRef(null) // anchor element — scrolled into view on new messages

  // ── Redux state ────────────────────────────
  const user = useSelector((state) => state.auth.user)
  const chats = useSelector((state) => state.chat.chats)
  const currentChatId = useSelector((state) => state.chat.currentChatId)

  // ── Derived state ──────────────────────────
  // Messages for the currently active chat; empty array if no chat is selected
  const currentMessages = chats[currentChatId]?.messages || []

  // ─────────────────────────────────────────────────────────────
  //  Effects
  // ─────────────────────────────────────────────────────────────

  /**
   * On mount: initialise WebSocket for real-time updates,
   * then fetch all chats so the sidebar can list them.
   */
  useEffect(() => {
    chat.initializeSocketConnection()
    chat.handleGetChats()
  }, [])

  /**
   * Auto-scroll to the bottom whenever:
   *  - A new message is added (chats object updates)
   *  - The user switches chats (currentChatId changes)
   *  - The thinking indicator appears or disappears
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chats, currentChatId, isThinking])

  // ─────────────────────────────────────────────────────────────
  //  Event Handlers
  // ─────────────────────────────────────────────────────────────

  /**
   * handleNewChat — Resets the view to start a fresh conversation.
   *
   * Sets currentChatId to null in Redux.
   * The next message sent with chatId=null will automatically
   * create a new chat on the backend and register it in the sidebar.
   *
   * Also closes the mobile drawer if open.
   */
  const handleNewChat = () => {
    chat.handleNewChat()
    setMobileSidebarOpen(false)
  }

  /**
   * handleSubmitMessage — Sends the user's message and waits for AI response.
   *
   * Flow:
   *  1. Prevent default form submission
   *  2. Bail out if the input is blank
   *  3. Clear textarea immediately (feels fast/responsive)
   *  4. Show the thinking animation
   *  5. Await the API call — chatId=null means a new chat will be created
   *  6. Always hide thinking animation in finally (even if API throws)
   */
  const handleSubmitMessage = async (event) => {
    event.preventDefault()
    const trimmedMessage = chatInput.trim()
    if (!trimmedMessage) return

    setChatInput('')      // clear input immediately
    setIsThinking(true)  // show thinking dots

    try {
      await chat.handleSendMessage({ message: trimmedMessage, chatId: currentChatId })
    } finally {
      setIsThinking(false) // always stop — even on error
    }
  }

  /**
   * openChat — Switches to an existing chat.
   *
   * Passes the chats object so useChat can lazy-load
   * messages only if they haven't been fetched yet.
   * Closes the mobile drawer after selection.
   */
  const openChat = (chatId) => {
    chat.handleOpenChat(chatId, chats)
    setMobileSidebarOpen(false)
  }

  /**
   * handleLogoutClick — Logs the user out and redirects to /login.
   *
   * Calls the backend to clear the httpOnly cookie,
   * clears the user from Redux, then navigates to /login.
   */
  const handleLogoutClick = async () => {
    await auth.handleLogOut()
    navigate('/login')
  }

  // ─────────────────────────────────────────────────────────────
  //  Shared sidebar content (used in both desktop + mobile)
  // ─────────────────────────────────────────────────────────────

  /**
   * NewChatButton — Triggers a new blank conversation.
   * Shared between desktop sidebar and mobile drawer.
   */
  const NewChatButton = ({ className = '' }) => (
    <button
      onClick={handleNewChat}
      className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-[12px]
        text-[#6a6c6c] border border-[#2a2b2b]
        hover:bg-[#0d1f1f] hover:text-[#20b8cd] hover:border-[#20b8cd44]
        transition-all ${className}`}
    >
      <NewChatIcon />
      New Chat
    </button>
  )

  /**
   * ChatList — Scrollable list of past chats.
   * Highlights the currently active chat.
   * Shared between desktop sidebar and mobile drawer.
   */
  const ChatList = ({ paddingClass = 'px-2' }) => (
    <div className='flex-1 space-y-0.5 overflow-y-auto hide-scrollbar'>
      {Object.values(chats).map((chatItem, index) => (
        <button
          key={index}
          onClick={() => openChat(chatItem.id)}
          className={`sidebar-item w-full text-left ${paddingClass} py-2.5 rounded-lg text-[13px] truncate
            ${chatItem.id === currentChatId
              ? 'bg-[#1a1b1b] text-white'
              : 'text-[#6a6c6c] hover:bg-[#161717] hover:text-[#c0c2c2]'
            }`}
        >
          {chatItem.title || 'New Thread'}
        </button>
      ))}
    </div>
  )

  // ─────────────────────────────────────────────────────────────
  //  Render
  // ─────────────────────────────────────────────────────────────

  return (
    <main className='min-h-screen w-full bg-[#0f1010] text-[#e8e8e8] font-sans'>

      {/* ── Global styles scoped to this component ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

        * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
        code, pre { font-family: 'DM Mono', monospace; }

        /* Hide scrollbars visually while keeping scrollability */
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        /* Sidebar list item transitions */
        .sidebar-item { transition: background 0.15s ease, color 0.15s ease; }

        /* Desktop sidebar — animates between open (200px) and collapsed (52px) */
        .sidebar-desktop {
          transition: width 0.25s cubic-bezier(0.4,0,0.2,1);
          overflow: hidden;
          flex-shrink: 0;
          border-right: 1px solid #1a1b1b;
        }
        .sidebar-desktop.open   { width: 200px; }
        .sidebar-desktop.closed { width: 52px; }

        /* Mobile overlay — dims background when drawer is open */
        .mobile-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.6);
          z-index: 40;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s ease;
        }
        .mobile-overlay.show { opacity: 1; pointer-events: all; }

        /* Mobile drawer — slides in from the left */
        .mobile-drawer {
          position: fixed; top: 0; left: 0; bottom: 0;
          width: 260px;
          background: #0f1010;
          border-right: 1px solid #1a1b1b;
          z-index: 50;
          transform: translateX(-100%);
          transition: transform 0.25s cubic-bezier(0.4,0,0.2,1);
          display: flex; flex-direction: column;
          padding: 24px 12px;
        }
        .mobile-drawer.show { transform: translateX(0); }

        /* User message bubble — right-aligned teal-tinted card */
        .user-bubble {
          background: linear-gradient(135deg, #1e2f2f 0%, #1a2828 100%);
          border: 1px solid #2a3d3d;
          border-radius: 18px 18px 4px 18px; /* clipped bottom-right corner for chat feel */
          box-shadow: 0 2px 12px rgba(0,0,0,0.3);
        }

        /* AI answer block — fades up on mount */
        .ai-answer { animation: fadeSlideIn 0.3s ease forwards; }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Input bar container */
        .input-bar {
          background: #161717;
          border: 1px solid #2a2b2b;
          border-radius: 16px;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .input-bar:focus-within {
          border-color: #20b8cd44;
          box-shadow: 0 0 0 3px rgba(32,184,205,0.06);
        }

        /* Send / submit button */
        .send-btn {
          background: #20b8cd;
          border-radius: 10px;
          transition: background 0.15s ease, transform 0.1s ease;
        }
        .send-btn:hover:not(:disabled) { background: #29cfe0; transform: scale(1.05); }
        .send-btn:disabled { background: #2a2b2b; cursor: not-allowed; }

        /* Sidebar collapse toggle + mobile hamburger button */
        .toggle-btn {
          width: 28px; height: 28px;
          border-radius: 8px;
          background: transparent;
          border: 1px solid #2a2b2b;
          display: flex; align-items: center; justify-content: center;
          color: #4a4c4c;
          transition: background 0.15s, color 0.15s, border-color 0.15s;
          cursor: pointer;
          flex-shrink: 0;
        }
        .toggle-btn:hover { background: #1e1f1f; color: #9ea0a0; border-color: #3a3b3b; }

        /* "ANSWER" / "THINKING" label above AI responses */
        .answer-label {
          letter-spacing: 0.12em;
          font-size: 10px;
          font-weight: 600;
          color: #20b8cd;
          text-transform: uppercase;
        }

        /* Bouncing dots for the thinking animation */
        .typing-dot {
          width: 5px; height: 5px;
          background: #20b8cd;
          border-radius: 50%;
          animation: bounce 1.2s infinite;
          display: inline-block;
        }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30%            { transform: translateY(-6px); }
        }

        /* Gradient overlay that fades messages into the input bar */
        .gradient-fade { background: linear-gradient(to top, #0f1010 60%, transparent); }
      `}</style>

      <section className='flex h-screen w-full'>

        {/* ── Mobile overlay — click to close drawer ── */}
        <div
          className={`mobile-overlay md:hidden ${mobileSidebarOpen ? 'show' : ''}`}
          onClick={() => setMobileSidebarOpen(false)}
        />

        {/* ══════════════════════════════════════
            MOBILE DRAWER
            Visible on small screens only.
            Slides in from the left.
        ══════════════════════════════════════ */}
        <div className={`mobile-drawer md:hidden ${mobileSidebarOpen ? 'show' : ''}`}>

          {/* Header: logo + close (×) button */}
          <div className='flex items-center justify-between mb-5 px-3'>
            <div className='flex items-center gap-2.5'>
              <div className='w-6 h-6 rounded-lg bg-[#20b8cd] flex items-center justify-center'>
                <LogoIcon />
              </div>
              <span className='text-white font-semibold text-[15px]'>perplexity</span>
            </div>
            <button className='toggle-btn' onClick={() => setMobileSidebarOpen(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* New Chat button — starts a fresh conversation */}
          <div className='px-3 mb-4'>
            <NewChatButton />
          </div>

          {/* Section label */}
          <p className='text-[10px] uppercase tracking-widest text-[#3a3b3b] font-semibold px-3 mb-2'>
            Recent
          </p>

          {/* Scrollable list of past chats */}
          <ChatList paddingClass='px-3' />

          {/* Footer: username + logout */}
          <div className='pt-4 border-t border-[#1a1b1b] px-3 flex flex-col gap-1'>
            <div className='flex items-center gap-2.5 px-1 py-1'>
              <div className='w-7 h-7 rounded-full bg-[#1e2f2f] border border-[#2a3d3d] flex items-center justify-center text-[#20b8cd] text-xs font-bold'>
                {user?.username?.charAt(0).toUpperCase() || 'G'}
              </div>
              <p className='text-[12px] text-white font-medium'>{user?.username || 'Guest'}</p>
            </div>
            <button
              onClick={handleLogoutClick}
              className='w-full flex items-center gap-2 px-2 py-2 rounded-lg text-[12px] text-[#6a6c6c] hover:bg-[#1f1212] hover:text-[#f87171] transition-all'
            >
              <LogoutIcon />
              Logout
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════
            DESKTOP SIDEBAR
            Hidden on mobile.
            Collapses to a 52px icon-only rail.
        ══════════════════════════════════════ */}
        <aside
          className={`hidden md:flex flex-col sidebar-desktop ${sidebarOpen ? 'open' : 'closed'}`}
          style={{ padding: '20px 12px' }}
        >
          {/* Logo row — toggle button always visible here */}
          <div className={`flex items-center mb-5 px-1 whitespace-nowrap ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>

            {/* Logo + wordmark — fades + shrinks when sidebar collapses */}
            <div className={`flex items-center gap-2.5 overflow-hidden transition-all duration-200 ${sidebarOpen ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0'}`}>
              <div className='w-6 h-6 rounded-lg bg-[#20b8cd] flex-shrink-0 flex items-center justify-center'>
                <LogoIcon />
              </div>
              <span className='text-white font-semibold text-[15px] tracking-tight'>perplexity</span>
            </div>

            {/* Toggle button — always visible; arrow flips when collapsed */}
            <button
              className='toggle-btn flex-shrink-0'
              onClick={() => setSidebarOpen(p => !p)}
              title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-3.5 h-3.5"
                style={{ transform: sidebarOpen ? 'scaleX(1)' : 'scaleX(-1)', transition: 'transform 0.25s ease' }}
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="9" y1="3" x2="9" y2="21" />
                <polyline points="15 9 12 12 15 15" />
              </svg>
            </button>
          </div>

          {/* Sidebar body — hidden (opacity 0, non-interactive) when collapsed */}
          <div className={`flex flex-col flex-1 overflow-hidden transition-all duration-200 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>

            {/* New Chat button — appears at the top of the sidebar body */}
            <div className='mb-4'>
              <NewChatButton />
            </div>

            {/* Section label */}
            <p className='text-[10px] uppercase tracking-widest text-[#3a3b3b] font-semibold px-2 mb-2 whitespace-nowrap'>
              Recent
            </p>

            {/* Scrollable list of past chats */}
            <ChatList paddingClass='px-2' />

            {/* Footer: username + logout */}
            <div className='pt-4 border-t border-[#1a1b1b] px-2 flex flex-col gap-1'>
              <div className='flex items-center gap-2.5 px-1 py-1'>
                <div className='w-7 h-7 rounded-full bg-[#1e2f2f] border border-[#2a3d3d] flex items-center justify-center text-[#20b8cd] text-xs font-bold flex-shrink-0'>
                  {user?.username?.charAt(0).toUpperCase() || 'G'}
                </div>
                <p className='text-[12px] text-white font-medium whitespace-nowrap truncate'>
                  {user?.username || 'Guest'}
                </p>
              </div>
              <button
                onClick={handleLogoutClick}
                className='w-full flex items-center gap-2 px-2 py-2 rounded-lg text-[12px] text-[#6a6c6c] hover:bg-[#1f1212] hover:text-[#f87171] transition-all cursor-pointer'
              >
                <LogoutIcon />
                Logout
              </button>
            </div>
          </div>
        </aside>

        {/* ══════════════════════════════════════
            MAIN CHAT AREA
            Takes all remaining horizontal space
        ══════════════════════════════════════ */}
        <section className='relative flex flex-1 flex-col items-center overflow-hidden'>

          {/* Mobile top bar — only visible on small screens */}
          <header className='md:hidden w-full flex items-center justify-between px-4 py-3 border-b border-[#1a1b1b]'>
            <div className='flex items-center gap-3'>
              {/* Hamburger — opens the mobile drawer */}
              <button className='toggle-btn' onClick={() => setMobileSidebarOpen(true)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
              <div className='flex items-center gap-2'>
                <div className='w-5 h-5 rounded-md bg-[#20b8cd]' />
                <span className='text-white font-semibold text-[15px]'>perplexity</span>
              </div>
            </div>

            {/* New Chat shortcut in mobile header */}
            <button
              onClick={handleNewChat}
              className='toggle-btn cursor-pointer'
              title='New Chat'
            >
              <NewChatIcon />
            </button>
          </header>

          {/* ── Message list ── */}
          <div className='w-full max-w-2xl flex-1 overflow-y-auto hide-scrollbar px-4 md:px-0 pt-10 pb-44'>

            {/* Empty state — shown when no messages and AI is not thinking */}
            {currentMessages.length === 0 && !isThinking && (
              <div className='flex flex-col items-center justify-center mt-32 gap-3'>
                <div className='w-12 h-12 rounded-2xl bg-[#20b8cd14] border border-[#20b8cd22] flex items-center justify-center'>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#20b8cd" strokeWidth="1.5" className="w-5 h-5">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <p className='text-[14px] text-[#3a3c3c] font-medium'>What do you want to know?</p>
              </div>
            )}

            {/* Render each message in the active chat */}
            {currentMessages.map((message, index) => (
              <div key={index} className="mb-8">

                {message.role === 'user' ? (
                  /* ── User message — right-aligned bubble ── */
                  <div className="flex justify-end">
                    <div className="user-bubble max-w-[78%] px-4 py-3">
                      <p className="text-[15px] text-[#e0e2e2] leading-relaxed">
                        {message.content}
                      </p>
                    </div>
                  </div>

                ) : (
                  /* ── AI response — left-aligned with Markdown rendering ── */
                  <div className="ai-answer flex flex-col gap-3 mt-6">

                    {/* Answer label + teal dot icon */}
                    <div className="flex items-center gap-2.5">
                      <div className='w-5 h-5 rounded-md bg-[#20b8cd14] border border-[#20b8cd22] flex items-center justify-center'>
                        <div className='w-2 h-2 rounded-full bg-[#20b8cd]' />
                      </div>
                      <span className="answer-label">Answer</span>
                    </div>

                    {/* Show typing dots if content is still a placeholder ('...') */}
                    {(!message.content || message.content === '...') ? (
                      <div className="flex items-center gap-1.5 pl-1 h-6">
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                      </div>

                    ) : (
                      /* Markdown-rendered AI response with custom component styles */
                      <div className="text-[#c8caca] leading-[1.8] text-[15px] font-light pl-0.5">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}  // GFM: tables, strikethrough, task lists
                          components={{
                            p:          ({ children }) => <p className='mb-4 last:mb-0 text-[#b8bfbf]'>{children}</p>,
                            strong:     ({ children }) => <strong className="font-semibold text-[#e8eded]">{children}</strong>,
                            em:         ({ children }) => <em className="italic text-[#9ecfcf]">{children}</em>,
                            ul:         ({ children }) => <ul className='mb-4 space-y-2' style={{ listStyleType: 'none', paddingLeft: 0 }}>{children}</ul>,
                            ol:         ({ children }) => <ol className='mb-4 pl-5 space-y-2 list-decimal'>{children}</ol>,
                            li:         ({ children }) => (
                              <li className='leading-relaxed text-[#a8b8b8] flex gap-2 items-start'>
                                <span className='mt-[7px] w-1.5 h-1.5 rounded-full bg-[#20b8cd] flex-shrink-0 opacity-70' />
                                <span>{children}</span>
                              </li>
                            ),
                            // inline code vs fenced code block
                            code:       ({ inline, children }) => inline
                              ? <code className='bg-[#0d1f1f] border border-[#1a3030] px-1.5 py-0.5 rounded-md text-[#4dd8e8] text-[13px]'>{children}</code>
                              : <code className='text-[#4dd8e8]'>{children}</code>,
                            pre:        ({ children }) => (
                              <pre className='bg-[#0a1414] border border-[#152424] p-4 rounded-xl overflow-x-auto my-5 text-[13px]'>
                                {children}
                              </pre>
                            ),
                            h1:         ({ children }) => <h1 className='text-xl font-semibold text-[#7ee8f0] mb-3 mt-6 pb-1 border-b border-[#1a2f2f]'>{children}</h1>,
                            h2:         ({ children }) => <h2 className='text-lg font-semibold text-[#5dd5e0] mb-2 mt-5'>{children}</h2>,
                            h3:         ({ children }) => <h3 className='text-[15px] font-semibold text-[#40c8d8] mb-2 mt-4'>{children}</h3>,
                            blockquote: ({ children }) => (
                              <blockquote className='border-l-2 border-[#20b8cd66] pl-4 my-4 text-[#6a9f9f] italic bg-[#0d1f1f] py-2 rounded-r-lg'>
                                {children}
                              </blockquote>
                            ),
                            a:          ({ href, children }) => (
                              <a href={href} className='text-[#20b8cd] underline underline-offset-2 hover:text-[#4dd8e8] transition-colors'>
                                {children}
                              </a>
                            ),
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    )}

                    {/* Action row (Copy / Retry / Good) — hidden for placeholder messages */}
                    {message.content && message.content !== '...' && (
                      <div className="flex items-center gap-1 mt-1">
                        {ACTION_BUTTONS.map(({ d, label }) => (
                          <button
                            key={label}
                            title={label}
                            className='p-1.5 rounded-lg text-[#3a3b3b] hover:text-[#7a7c7c] hover:bg-[#1a1b1b] transition-all'
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5">
                              <path d={d} strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Thin divider between conversation turns */}
                    <div className='h-px bg-[#1a1b1b] mt-3' />
                  </div>
                )}
              </div>
            ))}

            {/* ── Thinking indicator ──
                Appears immediately after the user sends a message.
                Removed in the handleSubmitMessage finally block. */}
            {isThinking && (
              <div className="ai-answer flex flex-col gap-3 mt-6 mb-8">
                <div className="flex items-center gap-2.5">
                  <div className='w-5 h-5 rounded-md bg-[#20b8cd14] border border-[#20b8cd22] flex items-center justify-center'>
                    <div className='w-2 h-2 rounded-full bg-[#20b8cd]' />
                  </div>
                  <span className="answer-label">Thinking</span>
                </div>
                <div className="flex items-center gap-1.5 pl-1 h-6">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            )}

            {/* Invisible scroll anchor */}
            <div ref={messagesEndRef} />
          </div>

          {/* ── Floating Input Bar ──
              Sits at the bottom of the chat area.
              Gradient above fades the message list into it. */}
          <footer className='gradient-fade absolute bottom-0 w-full max-w-2xl px-4 pb-8 pt-10'>
            <div className='input-bar flex flex-col'>

              {/* Textarea — Enter to send, Shift+Enter for new line */}
              <textarea
                rows={2}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder='Ask anything...'
                className='w-full bg-transparent outline-none py-4 px-5 text-[15px] resize-none placeholder:text-[#333535] text-white leading-relaxed'
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmitMessage(e)
                  }
                }}
              />

              <div className='flex justify-between items-center px-3 pb-3'>
                <div className="flex items-center gap-0.5" />

                {/* Send button — spinner while thinking, up-arrow when ready */}
                <button
                  onClick={handleSubmitMessage}
                  disabled={!chatInput.trim() || isThinking}
                  className='send-btn p-2 flex items-center justify-center'
                >
                  {isThinking ? (
                    // Spinning circle while AI responds
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 animate-spin">
                      <path d="M21 12a9 9 0 11-6.219-8.56" />
                    </svg>
                  ) : (
                    // Up arrow when idle
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <line x1="12" y1="19" x2="12" y2="5" />
                      <polyline points="5 12 12 5 19 12" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <p className='text-center text-[11px] text-[#252626] mt-3'>
              Perplexity can make mistakes. Verify important information.
            </p>
          </footer>
        </section>
      </section>
    </main>
  )
}

export default Dashboard
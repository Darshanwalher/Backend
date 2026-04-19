import React, { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useChat } from '../hooks/useChat'
import useAuth from '../../auth/hook/useAuth'

// ─────────────────────────────────────────────
//  SVG icon paths for action buttons
// ─────────────────────────────────────────────
const ACTION_BUTTONS = [
  { label: 'Copy',  d: 'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z' },
  { label: 'Retry', d: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' },
  { label: 'Good',  d: 'M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5' },
]

// ─────────────────────────────────────────────
//  Official Perplexity logo SVG
// ─────────────────────────────────────────────
const LogoIcon = ({ className = 'w-4 h-4' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M5.73486 2L11.4299 7.24715V7.24595V2.01211H12.5385V7.27063L18.2591 2V7.98253H20.6078V16.6118H18.2663V21.9389L12.5385 16.9066V21.9967H11.4299V16.9896L5.74131 22V16.6118H3.39258V7.98253H5.73486V2ZM10.5942 9.0776H4.50118V15.5167H5.73992V13.4856L10.5942 9.0776ZM6.84986 13.9715V19.5565L11.4299 15.5225V9.81146L6.84986 13.9715ZM12.5704 15.4691L17.1577 19.4994V16.6118H17.1518V13.9663L12.5704 9.80608V15.4691ZM18.2663 15.5167H19.4992V9.0776H13.4516L18.2663 13.4399V15.5167ZM17.1505 7.98253V4.51888L13.3911 7.98253H17.1505ZM10.6028 7.98253L6.84346 4.51888V7.98253H10.6028Z" />
  </svg>
)

// ─────────────────────────────────────────────
//  Logout arrow SVG
// ─────────────────────────────────────────────
const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 flex-shrink-0">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
)

// ─────────────────────────────────────────────
//  New Chat pencil icon
// ─────────────────────────────────────────────
const NewChatIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 shrink-0">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
)

// ─────────────────────────────────────────────
//  Trash / delete icon
// ─────────────────────────────────────────────
const DeleteIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
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
 * Color palette — matches real Perplexity:
 *  Background:  #1C1C1C  (main dark bg)
 *  Sidebar:     #191919  (slightly darker panel)
 *  Border:      #2E2E2E  (subtle dividers)
 *  Text:        #EDEDEC  (primary), #9B9B9B (muted)
 *  Accent:      #20B8CD  (teal — search/actions)
 *  Input bg:    #252525
 */
const Dashboard = () => {

  // ── Hooks ──────────────────────────────────
  const chat = useChat()
  const auth = useAuth()
  const navigate = useNavigate()

  // ── Local UI state ─────────────────────────
  const [chatInput, setChatInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [deletingChatId, setDeletingChatId] = useState(null)

  // ── Refs ───────────────────────────────────
  const messagesEndRef = useRef(null)

  // ── Redux state ────────────────────────────
  const user = useSelector((state) => state.auth.user)
  const chats = useSelector((state) => state.chat.chats)
  const currentChatId = useSelector((state) => state.chat.currentChatId)

  // ── Derived ────────────────────────────────
  const currentMessages = chats[currentChatId]?.messages || []

  // ─────────────────────────────────────────────────────────────
  //  Effects
  // ─────────────────────────────────────────────────────────────

  useEffect(() => {
    chat.initializeSocketConnection()
    chat.handleGetChats()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chats, currentChatId, isThinking])

  // ─────────────────────────────────────────────────────────────
  //  Handlers
  // ─────────────────────────────────────────────────────────────

  const handleNewChat = () => {
    chat.handleNewChat()
    setMobileSidebarOpen(false)
  }

  const handleSubmitMessage = async (event) => {
    event.preventDefault()
    const trimmedMessage = chatInput.trim()
    if (!trimmedMessage) return
    setChatInput('')
    setIsThinking(true)
    try {
      await chat.handleSendMessage({ message: trimmedMessage, chatId: currentChatId })
    } finally {
      setIsThinking(false)
    }
  }

  const openChat = (chatId) => {
    chat.handleOpenChat(chatId, chats)
    setMobileSidebarOpen(false)
  }

  const handleDeleteChat = async (e, chatId) => {
    e.stopPropagation()
    if (deletingChatId) return
    setDeletingChatId(chatId)
    try {
      await chat.handleDeleteChat(chatId)
    } finally {
      setDeletingChatId(null)
    }
  }

  const handleLogoutClick = async () => {
    await auth.handleLogOut()
    navigate('/login')
  }

  // ─────────────────────────────────────────────────────────────
  //  Shared sub-components
  // ─────────────────────────────────────────────────────────────

  const NewChatButton = () => (
    <button
      onClick={handleNewChat}
      className='w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[12px]
        text-[#9B9B9B] border border-[#2E2E2E]
        hover:bg-[#252525] hover:text-[#EDEDEC] hover:border-[#3E3E3E]
        transition-all font-medium'
    >
      <NewChatIcon />
      New Thread
    </button>
  )

  /**
   * ChatList — isMobile=true makes delete always visible (no hover needed on touch)
   */
  const ChatList = ({ px = 'px-2', isMobile = false }) => (
    <div className='flex-1 space-y-0.5 overflow-y-auto hide-scrollbar'>
      {Object.values(chats).map((chatItem, index) => (
        <div
          key={index}
          className={`group flex items-center rounded-lg transition-all
            ${chatItem.id === currentChatId
              ? 'bg-[#252525]'
              : 'hover:bg-[#222222]'
            }`}
        >
          {/* Chat title */}
          <button
            onClick={() => openChat(chatItem.id)}
            className={`flex-1 text-left ${px} py-2 text-[13px] truncate
              ${chatItem.id === currentChatId
                ? 'text-[#EDEDEC] font-medium'
                : 'text-[#9B9B9B] group-hover:text-[#EDEDEC]'
              }`}
          >
            {chatItem.title || 'New Thread'}
          </button>

          {/* Delete button */}
          <button
            onClick={(e) => handleDeleteChat(e, chatItem.id)}
            title="Delete"
            disabled={deletingChatId === chatItem.id}
            className={`pr-2 flex-shrink-0 transition-all
              disabled:opacity-40 disabled:cursor-not-allowed
              ${isMobile
                ? 'opacity-100 text-[#555555] active:text-[#f87171]'
                : 'opacity-100 text-[#555555] hover:text-[#f87171]'
              }`}
          >
            {deletingChatId === chatItem.id ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 animate-spin">
                <path d="M21 12a9 9 0 11-6.219-8.56" />
              </svg>
            ) : (
              <DeleteIcon />
            )}
          </button>
        </div>
      ))}
    </div>
  )

  // ─────────────────────────────────────────────────────────────
  //  Render
  // ─────────────────────────────────────────────────────────────

  return (
    <main className='min-h-screen w-full text-[#EDEDEC] font-sans' style={{ background: '#1C1C1C' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

        * { font-family: 'Sora', sans-serif; box-sizing: border-box; }
        code, pre { font-family: 'DM Mono', monospace; }

        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        /* Desktop sidebar */
        .sidebar-desktop {
          transition: width 0.25s cubic-bezier(0.4,0,0.2,1);
          overflow: hidden;
          flex-shrink: 0;
          background: #191919;
          border-right: 1px solid #2E2E2E;
        }
        .sidebar-desktop.open   { width: 220px; }
        .sidebar-desktop.closed { width: 52px; }

        /* Mobile overlay */
        .mobile-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.7);
          z-index: 40;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s ease;
        }
        .mobile-overlay.show { opacity: 1; pointer-events: all; }

        /* Mobile drawer */
        .mobile-drawer {
          position: fixed; top: 0; left: 0; bottom: 0;
          width: 270px;
          background: #191919;
          border-right: 1px solid #2E2E2E;
          z-index: 50;
          transform: translateX(-100%);
          transition: transform 0.25s cubic-bezier(0.4,0,0.2,1);
          display: flex; flex-direction: column;
          padding: 20px 12px;
        }
        .mobile-drawer.show { transform: translateX(0); }

        /* User message bubble */
        .user-bubble {
          background: #252525;
          border: 1px solid #2E2E2E;
          border-radius: 18px 18px 4px 18px;
        }

        /* AI answer fade-in */
        .ai-answer { animation: fadeSlideIn 0.3s ease forwards; }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Input bar */
        .input-bar {
          background: #252525;
          border: 1px solid #2E2E2E;
          border-radius: 14px;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .input-bar:focus-within {
          border-color: #3E3E3E;
          box-shadow: 0 0 0 3px rgba(32,184,205,0.05);
        }

        /* Send button */
        .send-btn {
          background: #EDEDEC;
          border-radius: 8px;
          transition: background 0.15s ease, transform 0.1s ease;
        }
        .send-btn:hover:not(:disabled) { background: #ffffff; transform: scale(1.03); }
        .send-btn:disabled { background: #2E2E2E; cursor: not-allowed; }

        /* Icon buttons (toggle, hamburger) */
        .toggle-btn {
          width: 28px; height: 28px;
          border-radius: 7px;
          background: transparent;
          border: 1px solid #2E2E2E;
          display: flex; align-items: center; justify-content: center;
          color: #666666;
          transition: background 0.15s, color 0.15s, border-color 0.15s;
          cursor: pointer;
          flex-shrink: 0;
        }
        .toggle-btn:hover { background: #252525; color: #EDEDEC; border-color: #3E3E3E; }

        /* Answer / Thinking label */
        .answer-label {
          letter-spacing: 0.08em;
          font-size: 10px;
          font-weight: 600;
          color: #9B9B9B;
          text-transform: uppercase;
        }

        /* Bouncing typing dots */
        .typing-dot {
          width: 5px; height: 5px;
          background: #9B9B9B;
          border-radius: 50%;
          animation: bounce 1.2s infinite;
          display: inline-block;
        }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30%            { transform: translateY(-5px); }
        }

        /* Gradient fade above input */
        .gradient-fade { background: linear-gradient(to top, #1C1C1C 55%, transparent); }

        /* Perplexity heading in empty state */
        .perplexity-heading {
          font-size: clamp(2rem, 6vw, 3.5rem);
          font-weight: 700;
          letter-spacing: -0.03em;
          color: #EDEDEC;
          line-height: 1.1;
        }
      `}</style>

      <section className='flex h-screen w-full'>

        {/* Mobile overlay */}
        <div
          className={`mobile-overlay lg:hidden ${mobileSidebarOpen ? 'show' : ''}`}
          onClick={() => setMobileSidebarOpen(false)}
        />

        {/* ══════════════════════════════════════
            MOBILE DRAWER
        ══════════════════════════════════════ */}
        <div className={`mobile-drawer lg:hidden ${mobileSidebarOpen ? 'show' : ''}`}>

          {/* Header */}
          <div className='flex items-center justify-between mb-5 px-2'>
            <div className='flex items-center gap-2.5'>
              <div className='w-6 h-6 flex items-center justify-center text-[#20B8CD]'>
                <LogoIcon className='w-5 h-5' />
              </div>
              <span className='text-[#EDEDEC] font-semibold text-[15px] tracking-tight'>perplexity</span>
            </div>
            <button className='toggle-btn' onClick={() => setMobileSidebarOpen(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className='px-2 mb-4'><NewChatButton /></div>

          <p className='text-[10px] uppercase tracking-widest text-[#555555] font-semibold px-3 mb-2'>
            Threads
          </p>

          <ChatList px='px-3' isMobile={true} />

          {/* Footer */}
          <div className='pt-4 border-t border-[#2E2E2E] px-2 flex flex-col gap-1'>
            <div className='flex items-center gap-2.5 px-1 py-1'>
              <div className='w-7 h-7 rounded-full bg-[#252525] border border-[#2E2E2E] flex items-center justify-center text-[#20B8CD] text-xs font-bold'>
                {user?.username?.charAt(0).toUpperCase() || 'G'}
              </div>
              <p className='text-[13px] text-[#EDEDEC] font-medium'>{user?.username || 'Guest'}</p>
            </div>
            <button onClick={handleLogoutClick} className='w-full flex items-center gap-2 px-2 py-2 rounded-lg text-[12px] text-[#666666] hover:bg-[#2A1515] hover:text-[#f87171] transition-all'>
              <LogoutIcon />Logout
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════
            DESKTOP SIDEBAR
        ══════════════════════════════════════ */}
        <aside
          className={`hidden lg:flex flex-col sidebar-desktop ${sidebarOpen ? 'open' : 'closed'}`}
          style={{ padding: '20px 12px' }}
        >
          {/* Logo row */}
          <div className={`flex items-center mb-5 px-1 whitespace-nowrap ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>

            {/* Logo + wordmark */}
            <div className={`flex items-center gap-2.5 overflow-hidden transition-all duration-200 ${sidebarOpen ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0'}`}>
              <div className='w-6 h-6 shrink-0 flex items-center justify-center text-[#20B8CD]'>
                <LogoIcon className='w-5 h-5' />
              </div>
              <span className='text-[#EDEDEC] font-semibold text-[15px] tracking-tight'>perplexity</span>
            </div>

            {/* Collapse toggle */}
            <button
              className='toggle-btn shrink-0'
              onClick={() => setSidebarOpen(p => !p)}
              title={sidebarOpen ? 'Collapse' : 'Expand'}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"
                style={{ transform: sidebarOpen ? 'scaleX(1)' : 'scaleX(-1)', transition: 'transform 0.25s ease' }}>
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="9" y1="3" x2="9" y2="21" />
                <polyline points="15 9 12 12 15 15" />
              </svg>
            </button>
          </div>

          {/* Sidebar body */}
          <div className={`flex flex-col flex-1 overflow-hidden transition-all duration-200 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>

            <div className='mb-4'><NewChatButton /></div>

            <p className='text-[10px] uppercase tracking-widest text-[#555555] font-semibold px-2 mb-2 whitespace-nowrap'>
              Threads
            </p>

            <ChatList px='px-2' />

            {/* Footer */}
            <div className='pt-4 border-t border-[#2E2E2E] px-2 flex flex-col gap-1'>
              <div className='flex items-center gap-2.5 px-1 py-1'>
                <div className='w-7 h-7 rounded-full bg-[#252525] border border-[#2E2E2E] flex items-center justify-center text-[#20B8CD] text-xs font-bold shrink-0'>
                  {user?.username?.charAt(0).toUpperCase() || 'G'}
                </div>
                <p className='text-[13px] text-[#EDEDEC] font-medium whitespace-nowrap truncate'>
                  {user?.username || 'Guest'}
                </p>
              </div>
              <button onClick={handleLogoutClick} className='w-full flex items-center gap-2 px-2 py-2 rounded-lg text-[12px] text-[#666666] hover:bg-[#2A1515] hover:text-[#f87171] transition-all cursor-pointer'>
                <LogoutIcon />Logout
              </button>
            </div>
          </div>
        </aside>

        {/* ══════════════════════════════════════
            MAIN CHAT AREA
        ══════════════════════════════════════ */}
        <section className='relative flex flex-1 flex-col items-center overflow-hidden'>

          {/* Mobile top bar */}
          <header className='lg:hidden w-full flex items-center justify-between px-4 py-3 border-b border-[#2E2E2E]' style={{ background: '#191919' }}>
            <div className='flex items-center gap-3'>
              <button className='toggle-btn' onClick={() => setMobileSidebarOpen(true)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                  <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
              <div className='flex items-center gap-2 text-[#20B8CD]'>
                <LogoIcon className='w-4 h-4' />
                <span className='text-[#EDEDEC] font-semibold text-[15px]'>perplexity</span>
              </div>
            </div>
            <button onClick={handleNewChat} className='toggle-btn cursor-pointer' title='New Thread'>
              <NewChatIcon />
            </button>
          </header>

          {/* ── Message list ── */}
          <div className='w-full max-w-2xl flex-1 overflow-y-auto hide-scrollbar px-4 md:px-0 pt-10 pb-44'>

            {/* ── Empty state — large Perplexity heading ── */}
            {currentMessages.length === 0 && !isThinking && (
              <div className='flex flex-col items-center justify-center mt-24 gap-6'>

                {/* Big logo */}
                <div className='text-[#20B8CD]'>
                  <LogoIcon className='w-12 h-12' />
                </div>

                {/* Big heading */}
                <h1 className='perplexity-heading text-center'>
                  perplexity
                </h1>

                {/* Subtitle */}
                <p className='text-[#9B9B9B] text-[15px] font-normal text-center max-w-xs leading-relaxed'>
                  Ask anything. Get instant, accurate answers.
                </p>

                {/* Suggestion chips */}
                
              </div>
            )}

            {/* Messages */}
            {currentMessages.map((message, index) => (
              <div key={index} className="mb-8">

                {message.role === 'user' ? (
                  /* User bubble — right aligned */
                  <div className="flex justify-end">
                    <div className="user-bubble max-w-[78%] px-4 py-3">
                      <p className="text-[15px] text-[#EDEDEC] leading-relaxed">{message.content}</p>
                    </div>
                  </div>

                ) : (
                  /* AI response */
                  <div className="ai-answer flex flex-col gap-3 mt-6">

                    {/* Answer label */}
                    <div className="flex items-center gap-2">
                      <div className='text-[#20B8CD]'>
                        <LogoIcon className='w-4 h-4' />
                      </div>
                      <span className="answer-label">Answer</span>
                    </div>

                    {/* Typing dots placeholder */}
                    {(!message.content || message.content === '...') ? (
                      <div className="flex items-center gap-1.5 pl-1 h-6">
                        <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
                      </div>

                    ) : (
                      /* Markdown response */
                      <div className="text-[#EDEDEC] leading-[1.8] text-[15px] font-light pl-1">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p:          ({ children }) => <p className='mb-4 last:mb-0 text-[#CCCCCC]'>{children}</p>,
                            strong:     ({ children }) => <strong className="font-semibold text-[#EDEDEC]">{children}</strong>,
                            em:         ({ children }) => <em className="italic text-[#AAAAAA]">{children}</em>,
                            ul:         ({ children }) => <ul className='mb-4 space-y-2' style={{ listStyleType: 'none', paddingLeft: 0 }}>{children}</ul>,
                            ol:         ({ children }) => <ol className='mb-4 pl-5 space-y-2 list-decimal'>{children}</ol>,
                            li:         ({ children }) => (
                              <li className='leading-relaxed text-[#CCCCCC] flex gap-2 items-start'>
                                <span className='mt-[8px] w-1 h-1 rounded-full bg-[#666666] shrink-0' />
                                <span>{children}</span>
                              </li>
                            ),
                            code:       ({ inline, children }) => inline
                              ? <code className='bg-[#252525] border border-[#2E2E2E] px-1.5 py-0.5 rounded text-[#20B8CD] text-[13px]'>{children}</code>
                              : <code className='text-[#20B8CD]'>{children}</code>,
                            pre:        ({ children }) => (
                              <pre className='bg-[#1A1A1A] border border-[#2E2E2E] p-4 rounded-xl overflow-x-auto my-5 text-[13px]'>
                                {children}
                              </pre>
                            ),
                            h1:         ({ children }) => <h1 className='text-xl font-semibold text-[#EDEDEC] mb-3 mt-6 pb-1 border-b border-[#2E2E2E]'>{children}</h1>,
                            h2:         ({ children }) => <h2 className='text-lg font-semibold text-[#EDEDEC] mb-2 mt-5'>{children}</h2>,
                            h3:         ({ children }) => <h3 className='text-[15px] font-semibold text-[#CCCCCC] mb-2 mt-4'>{children}</h3>,
                            blockquote: ({ children }) => (
                              <blockquote className='border-l-2 border-[#3E3E3E] pl-4 my-4 text-[#9B9B9B] italic bg-[#1F1F1F] py-2 rounded-r-lg'>
                                {children}
                              </blockquote>
                            ),
                            a:          ({ href, children }) => (
                              <a href={href} className='text-[#20B8CD] underline underline-offset-2 hover:text-[#4dd8e8] transition-colors'>
                                {children}
                              </a>
                            ),
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    )}

                    {/* Action buttons */}
                    {message.content && message.content !== '...' && (
                      <div className="flex items-center gap-1 mt-1">
                        {ACTION_BUTTONS.map(({ d, label }) => (
                          <button key={label} title={label} className='p-1.5 rounded-lg text-[#555555] hover:text-[#9B9B9B] hover:bg-[#252525] transition-all'>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5">
                              <path d={d} strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                        ))}
                      </div>
                    )}

                    <div className='h-px bg-[#2E2E2E] mt-3' />
                  </div>
                )}
              </div>
            ))}

            {/* Thinking indicator */}
            {isThinking && (
              <div className="ai-answer flex flex-col gap-3 mt-6 mb-8">
                <div className="flex items-center gap-2">
                  <div className='text-[#20B8CD]'><LogoIcon className='w-4 h-4' /></div>
                  <span className="answer-label">Thinking</span>
                </div>
                <div className="flex items-center gap-1.5 pl-1 h-6">
                  <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ── Floating Input Bar ── */}
          <footer className='gradient-fade absolute bottom-0 w-full max-w-2xl px-4 pb-8 pt-10'>
            <div className='input-bar flex flex-col'>

              <textarea
                rows={2}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder='Ask anything...'
                className='w-full bg-transparent outline-none py-4 px-5 text-[15px] resize-none text-[#EDEDEC] leading-relaxed'
                style={{ '::placeholder': { color: '#555555' } }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmitMessage(e)
                  }
                }}
              />

              <div className='flex justify-between items-center px-3 pb-3'>
                <span className='text-[11px] text-[#444444]'>
                  {chatInput.length > 0 ? `${chatInput.length} chars` : ''}
                </span>

                {/* Send button */}
                <button
                  onClick={handleSubmitMessage}
                  disabled={!chatInput.trim() || isThinking}
                  className='send-btn p-2 flex items-center justify-center'
                >
                  {isThinking ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="#1C1C1C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 animate-spin">
                      <path d="M21 12a9 9 0 11-6.219-8.56" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="#1C1C1C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <line x1="12" y1="19" x2="12" y2="5" />
                      <polyline points="5 12 12 5 19 12" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <p className='text-center text-[11px] text-[#444444] mt-3'>
              Perplexity can make mistakes. Verify important information.
            </p>
          </footer>
        </section>
      </section>
    </main>
  )
}

export default Dashboard
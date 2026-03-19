// import React, { useEffect, useState } from 'react'
// import ReactMarkdown from 'react-markdown'
// import { useSelector } from 'react-redux'
// import { useChat } from '../hooks/useChat'

// const Dashboard = () => {
//   const chat = useChat()
//   const [chatInput, setChatInput] = useState('')
//   const chats = useSelector((state) => state.chat.chats)
//   const currentChatId = useSelector((state) => state.chat.currentChatId)

//   useEffect(() => {
//     chat.initializeSocketConnection();
//     chat.handleGetChats();
//   }, [])

//   const handleSubmitMessage = (event) => {
//     event.preventDefault()

//     const trimmedMessage = chatInput.trim()
//     if (!trimmedMessage) return

//     chat.handleSendMessage({ message: trimmedMessage, chatId: currentChatId })
//     setChatInput('')
//   }

//   const openChat = (chatId)=>{
//     chat.handleOpenChat(chatId)
//   }

//   return (
//     <main className='min-h-screen w-full bg-[#0b0f14] text-[#e5e7eb] p-4'>
//       <section className='flex h-[calc(100vh-2rem)] w-full gap-4'>

//         {/* Sidebar */}
//         <aside className='hidden md:flex flex-col w-72 bg-[#0f172a] border border-[#1f2937] rounded-2xl p-5'>
//           <h1 className='text-2xl font-semibold mb-6 tracking-tight'>
//             perplexity
//           </h1>

//           <div className='space-y-3'>
//             {Object.values(chats).map((chat, index) => (
//               <button
//                 onClick={()=>{openChat(chat.id)}}
//                 key={index}
//                 className='w-full text-left px-4 py-3 rounded-xl border border-[#1f2937] bg-[#111827] text-[#d1d5db] transition 
//                 hover:border-[#3b82f6] hover:shadow-[0_0_10px_rgba(59,130,246,0.25)] hover:text-white'
//               >
//                 {chat.title}
//               </button>
//             ))}
//           </div>
//         </aside>

//         {/* Main Chat */}
//         <section className='relative flex flex-1 flex-col'>

//           {/* Messages */}
//           <div className='flex-1 overflow-y-auto space-y-4 pr-2 pb-32 scrollbar-thin scrollbar-thumb-[#1f2937]'>

//             {chats[currentChatId]?.messages?.map((message, index) => (
//               <div
//                 key={index}
//                 className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
//               >
//                 <div
//                   className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm md:text-base transition-all duration-200
//                   ${
//                     message.role === 'user'
//                       ? 'bg-[#1f2937] text-white rounded-br-none'
//                       : 'bg-[#111827] border border-[#1f2937] text-[#e5e7eb] rounded-bl-none'
//                   }`}
//                 >
//                   {message.role === 'user' ? (
//                     <p className="leading-relaxed">{message.content}</p>
//                   ) : (
//                     <ReactMarkdown
//                       components={{
//                         p: ({ children }) => (
//                           <p className='mb-2 last:mb-0 leading-relaxed'>
//                             {children}
//                           </p>
//                         ),
//                         ul: ({ children }) => (
//                           <ul className='mb-2 list-disc pl-5 space-y-1'>
//                             {children}
//                           </ul>
//                         ),
//                         ol: ({ children }) => (
//                           <ol className='mb-2 list-decimal pl-5 space-y-1'>
//                             {children}
//                           </ol>
//                         ),
//                         code: ({ children }) => (
//                           <code className='bg-black/40 px-1 py-0.5 rounded text-sm'>
//                             {children}
//                           </code>
//                         ),
//                         pre: ({ children }) => (
//                           <pre className='bg-black/50 p-3 rounded-xl overflow-x-auto mb-2 text-sm'>
//                             {children}
//                           </pre>
//                         )
//                       }}
//                     >
//                       {message.content}
//                     </ReactMarkdown>
//                   )}
//                 </div>
//               </div>
//             ))}

//           </div>

//           {/* Input */}
//           <footer className='absolute bottom-4 w-full px-2'>
//             <form
//               onSubmit={handleSubmitMessage}
//               className='flex items-center gap-3 bg-[#111827] border border-[#1f2937] rounded-2xl p-3 transition 
//               focus-within:border-[#3b82f6] focus-within:shadow-[0_0_12px_rgba(59,130,246,0.25)]'
//             >
//               <input
//                 type='text'
//                 value={chatInput}
//                 onChange={(e) => setChatInput(e.target.value)}
//                 placeholder='Ask anything...'
//                 className='flex-1 bg-transparent outline-none text-lg placeholder:text-[#6b7280]'
//               />

//               <button
//                 type='submit'
//                 disabled={!chatInput.trim()}
//                 className='px-5 py-2 rounded-xl border border-[#1f2937] text-white transition 
//                 hover:border-[#3b82f6] hover:shadow-[0_0_10px_rgba(59,130,246,0.3)]
//                 disabled:opacity-50 disabled:cursor-not-allowed'
//               >
//                 Send
//               </button>
//             </form>
//           </footer>

//         </section>
//       </section>
//     </main>
//   )
// }

// export default Dashboard

import React, { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { useSelector } from 'react-redux'
import { useChat } from '../hooks/useChat'

const Dashboard = () => {
  const chat = useChat()
  
  const [chatInput, setChatInput] = useState('')
  const chats = useSelector((state) => state.chat.chats)
  const currentChatId = useSelector((state) => state.chat.currentChatId)

  useEffect(() => {
    chat.initializeSocketConnection();
    chat.handleGetChats();
  }, [])

  const handleSubmitMessage = (event) => {
    event.preventDefault()
    const trimmedMessage = chatInput.trim()
    if (!trimmedMessage) return
    chat.handleSendMessage({ message: trimmedMessage, chatId: currentChatId })
    setChatInput('')
  }

  const openChat = (chatId) => {
    chat.handleOpenChat(chatId)
  }

  return (
    <main className='min-h-screen w-full bg-[#191a1a] text-[#e8e8e8] font-sans'>
      {/* Inline style to hide scrollbar globally for this component */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <section className='flex h-screen w-full'>
        {/* Sidebar */}
        <aside className='hidden md:flex flex-col w-64 bg-[#191a1a] border-r border-[#2d2e2e] p-4'>
          <div className='flex items-center gap-2 mb-8 px-2'>
            <div className='w-5 h-5 bg-[#20b8cd] rounded-full' />
            <h1 className='text-lg font-semibold tracking-tight text-white'>perplexity</h1>
          </div>

          <div className='flex-1 space-y-1 overflow-y-auto hide-scrollbar'>
            {Object.values(chats).map((chatItem, index) => (
              <button
                onClick={() => openChat(chatItem.id)}
                key={index}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all truncate
                ${chatItem.id === currentChatId ? 'bg-[#2d2e2e] text-white' : 'text-[#9ea0a0] hover:bg-[#2d2e2e]'}`}
              >
                {chatItem.title || 'New Thread'}
              </button>
            ))}
          </div>
        </aside>

        {/* Main Chat Area */}
        <section className='relative flex flex-1 flex-col items-center overflow-hidden'>
          
          {/* Messages Container */}
          <div className='w-full max-w-3xl flex-1 overflow-y-auto hide-scrollbar px-6 md:px-0 pt-12 pb-48 scroll-smooth'>
            {chats[currentChatId]?.messages?.map((message, index) => (
              <div key={index} className="mb-14">
                
                {message.role === 'user' ? (
                  /* User Question Style */
                  <h2 className="text-3xl font-medium text-white mb-8 tracking-tight">
                    {message.content}
                  </h2>
                ) : (
                  /* AI Answer Style */
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-[#20b8cd] font-bold text-[10px] uppercase tracking-[0.15em]">
                      <span className='w-3 h-[1.5px] bg-[#20b8cd]'></span>
                      Answer
                    </div>
                    
                    <div className="text-[#e8e8e8] leading-relaxed text-[17px] font-normal">
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p className='mb-5 last:mb-0'>{children}</p>,
                          strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
                          ul: ({ children }) => <ul className='mb-5 list-disc pl-5 space-y-3'>{children}</ul>,
                          li: ({ children }) => <li className='leading-relaxed'>{children}</li>,
                          code: ({ children }) => <code className='bg-[#2d2e2e] px-1.5 py-0.5 rounded text-[#20b8cd] font-mono text-sm'>{children}</code>,
                          pre: ({ children }) => (
                            <pre className='bg-[#111111] border border-[#2d2e2e] p-4 rounded-xl overflow-x-auto my-6'>
                              {children}
                            </pre>
                          )
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                    {/* Divider line like in screenshot */}
                    <hr className="border-[#2d2e2e] mt-8" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Floating Input Bar */}
          <footer className='absolute bottom-0 w-full max-w-3xl px-4 pb-10 bg-gradient-to-t from-[#191a1a] via-[#191a1a] to-transparent'>
            <form
              onSubmit={handleSubmitMessage}
              className='flex flex-col bg-[#202222] border border-[#3a3b3b] rounded-xl shadow-2xl focus-within:border-[#4a4b4b] overflow-hidden'
            >
              <textarea
                rows={2}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder='Ask anything...'
                className='w-full bg-transparent outline-none py-4 px-5 text-[16px] resize-none placeholder:text-[#636464] text-white'
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmitMessage(e);
                  }
                }}
              />

              <div className='flex justify-between items-center px-4 pb-3'>
                <div className="flex gap-4 items-center">
                    <span className='text-[10px] text-[#636464] font-bold uppercase tracking-widest'>Focus: All</span>
                    <span className='text-[10px] text-[#636464] font-bold uppercase tracking-widest'>Pro: Off</span>
                </div>
                
                <button
                  type='submit'
                  disabled={!chatInput.trim()}
                  className='bg-[#2d2e2e] text-[#636464] hover:text-white rounded-full p-1.5 transition-colors disabled:opacity-20'
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <line x1="12" y1="19" x2="12" y2="5"></line>
                    <polyline points="5 12 12 5 19 12"></polyline>
                  </svg>
                </button>
              </div>
            </form>
          </footer>
        </section>
      </section>
    </main>
  )
}

export default Dashboard
import { createSlice } from '@reduxjs/toolkit'

// 🔹 Initial structure of your chat state
// chats: stores all chats in key-value format -> { chatId: chatObject }
// currentChatId: which chat is currently open
// isLoading: used for showing loader while API call is happening
// error: stores error messages (if any)
const chatSlice = createSlice({
    name: 'chat',
    initialState: {
        chats: {},
        currentChatId: null,
        isLoading: false,
        error: null
    },

    reducers: {

        // ✅ Create a new chat (only when user starts a fresh conversation)
        createNewChat: (state, action) => {
            const { chatId, title } = action.payload

            // Add new chat inside chats object using chatId as key
            state.chats[chatId] = {
                id: chatId,
                title,              // Chat title (generated from first message)
                messages: [],       // Initially no messages
                lastUpdated: new Date().toISOString(), // Track last activity
            }
        },

        // ✅ Add a single message (user or AI)
        addNewMessage: (state, action) => {
            const { chatId, content, role } = action.payload

            // Push new message into that chat's messages array
            state.chats[chatId].messages.push({
                content,   // message text
                role       // "user" or "ai"
            })
        },

        // ✅ Add multiple messages (used when loading old chat history)
        addMessages: (state, action) => {
            const { chatId, messages } = action.payload

            // Add all messages at once (spread operator)
            state.chats[chatId].messages.push(...messages)
        },

        // ✅ Replace all chats (used when fetching chats from backend)
        setChats: (state, action) => {
            state.chats = action.payload
        },

        // ✅ Set currently active chat (when user clicks a chat)
        setCurrentChatId: (state, action) => {
            state.currentChatId = action.payload
        },

        // ✅ Set loading state (true when API call starts, false when ends)
        setLoading: (state, action) => {
            state.isLoading = action.payload
        },

        // ✅ Store error message (if API fails)
        setError: (state, action) => {
            state.error = action.payload
        },

        // Add inside reducers:
        deleteChat: (state, action) => {
            const chatId = action.payload

            // Remove chat from state
            delete state.chats[chatId]

            // If deleted chat was the active one, reset to null
            if (state.currentChatId === chatId) {
                state.currentChatId = null
            }
        },
        
    }
})

// Export all actions so you can dispatch them
export const {
    createNewChat,
    setChats,
    setCurrentChatId,
    setLoading,
    setError,
    addNewMessage,
    addMessages,
    deleteChat
} = chatSlice.actions

// Export reducer to use in store
export default chatSlice.reducer
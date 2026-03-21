import { initializeSocketConnection } from "../service/chat.socket.js";
import { sendMessage, getChats, getMessages, deleteChat } from "../service/chat.api.js";
import {
    setChats,
    setCurrentChatId,
    setLoading,
    setError,
    createNewChat,
    addNewMessage,
    addMessages
} from "../chat.slice.js";

import { useDispatch } from "react-redux";

/**
 * useChat — Custom hook that manages all chat-related operations.
 * 
 * Handles:
 *  - Sending messages and receiving AI responses
 *  - Fetching all chat history from the server
 *  - Opening a chat and lazily loading its messages
 *  - Initializing the socket connection for real-time updates
 * 
 * All state updates go through Redux via dispatch.
 */
export const useChat = () => {

    const dispatch = useDispatch();

    /**
     * handleSendMessage — Sends a user message and stores the AI response.
     * 
     * Flow:
     *  1. Sets loading state to true
     *  2. Calls the API with the message and optional chatId
     *  3. If no chatId (new conversation), creates a new chat in Redux
     *  4. Adds the user message to Redux state
     *  5. Adds the AI response message to Redux state
     *  6. Sets the current active chat to this chat
     *  7. On error, stores the error message in Redux
     *  8. Always turns off loading in finally (so UI never gets stuck)
     * 
     * @param {string} message   - The user's message text
     * @param {string} chatId    - Existing chat ID, or null/undefined for a new chat
     */
    async function handleSendMessage({ message, chatId }) {
        try {
            dispatch(setLoading(true))

            // Call backend — returns the chat object and the AI's reply
            const data = await sendMessage({ message, chatId })
            const { chat, aiMessage } = data

            // If this is a brand new chat (no chatId passed), register it in Redux
            if (!chatId) {
                dispatch(createNewChat({
                    chatId: chat._id,
                    title: chat.title,
                }))
            }

            // Add the user's message to the chat in Redux
            dispatch(addNewMessage({
                chatId: chatId || chat._id, // use existing or newly created chat ID
                content: message,
                role: "user",
            }))

            // Add the AI's response message to the same chat in Redux
            dispatch(addNewMessage({
                chatId: chatId || chat._id,
                content: aiMessage.content,
                role: aiMessage.role,  // typically "assistant"
            }))

            // Make this chat the currently active/open chat
            dispatch(setCurrentChatId(chat._id))

        } catch (error) {
            // Store a readable error message in Redux for the UI to display
            dispatch(setError(error.response?.data?.message || "Failed to send message"))
        } finally {
            // Always turn off loading — even if an error occurred
            // Without this, isThinking in Dashboard would never reset
            dispatch(setLoading(false))
        }
    }

    /**
     * handleGetChats — Fetches all chats for the logged-in user from the server.
     * 
     * Flow:
     *  1. Sets loading true
     *  2. Fetches all chats from the API
     *  3. Transforms the array into a keyed object (chatId → chatData) for O(1) lookup
     *  4. Stores the result in Redux
     *  5. Sets loading false
     * 
     * Note: Messages are NOT loaded here — they are lazily loaded when a chat is opened.
     *       This keeps the initial load fast.
     */
    async function handleGetChats() {
        dispatch(setLoading(true))

        const data = await getChats()
        const { chats } = data

        // Transform array → object keyed by chat._id for fast Redux lookups
        // e.g. { "abc123": { id, title, messages: [], lastUpdated }, ... }
        dispatch(setChats(chats.reduce((acc, chat) => {
            acc[chat._id] = {
                id: chat._id,
                title: chat.title,
                messages: [],           // messages start empty — loaded lazily on open
                lastUpdated: chat.updatedAt,
            }
            return acc
        }, {})))

        dispatch(setLoading(false))
    }

    /**
     * handleOpenChat — Opens a chat and loads its messages if not already loaded.
     * 
     * Flow:
     *  1. Checks if the chat's messages are already in Redux (lazy load check)
     *  2. If messages array is empty, fetches them from the API
     *  3. Formats the messages into the shape Redux expects
     *  4. Dispatches messages into Redux for that chat
     *  5. Sets this chat as the currently active chat
     * 
     * This avoids re-fetching messages every time a chat is clicked.
     * 
     * @param {string} chatId  - The ID of the chat to open
     * @param {object} chats   - Current chats object from Redux (used to check if messages exist)
     */
    async function handleOpenChat(chatId, chats) {

        // Only fetch messages if they haven't been loaded yet (lazy loading)
        if (chats[chatId]?.messages.length === 0) {
            const data = await getMessages(chatId)
            const { message } = data

            // Reshape API response to match Redux message shape
            const formattedMessages = message.map(msg => ({
                content: msg.content,
                role: msg.role,  // "user" or "assistant"
            }))

            dispatch(addMessages({
                chatId,
                messages: formattedMessages,
            }))
        }

        // Set this chat as active so the UI renders its messages
        dispatch(setCurrentChatId(chatId))
    }

    function handleNewChat() {
    // Clear current chat selection — sets currentChatId to null
    // so the message area shows the empty state and next message
    // creates a brand new chat automatically
    dispatch(setCurrentChatId(null))
}


    return {
        initializeSocketConnection, // Initializes WebSocket for real-time AI streaming (optional)
        handleSendMessage,          // Send a message and get AI response
        handleGetChats,             // Load all chats on app start
        handleOpenChat,  
        handleNewChat,           // Open a chat and lazy-load its messages
    }
}
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

// 🔹 Custom hook to manage all chat-related operations
export const useChat = () => {

    const dispatch = useDispatch();

    // ============================================================
    // ✅ SEND MESSAGE (Main function for chat interaction)
    // ============================================================
    async function handleSendMessage({ message, chatId }) {

        // 🔄 Start loading (show spinner in UI)
        dispatch(setLoading(true));

        // 📡 Call backend API to send message + get AI response
        const data = await sendMessage({ message, chatId });

        // Extract response
        const { chat, aiMessage } = data;

        // 🧠 Decide final chatId
        // If chat already exists → use old chatId
        // If new chat → use newly created chat._id
        const finalChatId = chatId || chat._id;

        // ✅ If this is a NEW chat → create it in Redux
        if (!chatId) {
            dispatch(createNewChat({
                chatId: chat._id,
                title: chat.title,
            }));
        }

        // ✅ Add USER message to Redux store
        dispatch(addNewMessage({
            chatId: finalChatId,
            content: message,
            role: "user"
        }));

        // ✅ Add AI response to Redux store
        dispatch(addNewMessage({
            chatId: finalChatId,
            content: aiMessage.content,
            role: aiMessage.role, // usually "ai"
        }));

        // 🎯 Set this chat as currently active
        dispatch(setCurrentChatId(finalChatId));

        // 🔄 Stop loading
        dispatch(setLoading(false));
    }


    // ============================================================
    // ✅ FETCH ALL CHATS (Sidebar / Chat list)
    // ============================================================
    async function handleGetChats() {

        dispatch(setLoading(true));

        // 📡 Fetch all chats from backend
        const data = await getChats();
        const { chats } = data;

        // 🔁 Convert array → object format for Redux
        // WHY? Faster access using chatId
        const formattedChats = chats.reduce((acc, chat) => {

            acc[chat._id] = {
                id: chat._id,
                title: chat.title,
                messages: [], // messages will be loaded separately
                lastUpdated: new Date().toISOString(),
            };

            return acc;

        }, {});

        // 🧠 Store all chats in Redux
        dispatch(setChats(formattedChats));

        dispatch(setLoading(false));
    }


    // ============================================================
    // ✅ OPEN A CHAT (Load old messages)
    // ============================================================
    async function handleOpenChat(chatId) {

        // 📡 Fetch messages for selected chat
        const data = await getMessages(chatId);
        const { message } = data;

        // 🔄 Format backend messages → frontend format
        const formattedMessages = message.map(msg => ({
            content: msg.content,
            role: msg.role,
        }));

        // ✅ Add all old messages into Redux
        dispatch(addMessages({
            chatId,
            messages: formattedMessages,
        }));

        // 🎯 Set this chat as active
        dispatch(setCurrentChatId(chatId));
    }


    // ============================================================
    // 🔄 RETURN ALL FUNCTIONS (used in components)
    // ============================================================
    return {
        initializeSocketConnection, // for real-time chat (optional)
        handleSendMessage,
        handleGetChats,
        handleOpenChat,
    }
}
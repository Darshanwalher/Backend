import { genrateResponse, genrateChatTitle } from "../services/ai.service.js";
import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";

/**
 * sendMessage — Handles sending a user message and generating an AI response.
 *
 * Flow:
 *  1. Extract message text and optional chatId from request body
 *  2. If no chatId → this is a new conversation:
 *       a. Generate a short title from the first message (via Mistral)
 *       b. Create a new Chat document in MongoDB
 *  3. Save the user's message to the messages collection
 *  4. Fetch full message history for this chat (needed for AI context)
 *  5. Pass history to the AI agent and get a response
 *  6. Save the AI response as a message
 *  7. Return the new chat (if created), and the AI message to the frontend
 *
 * Why fetch all messages before calling AI?
 *  The AI needs the full conversation history to give contextually
 *  accurate follow-up answers, not just the latest message.
 *
 * @route  POST /api/chats/send
 * @access Private (requires authUser middleware)
 * @body   { message: string, chat: string | undefined }
 */
export async function sendMessage(req, res) {
    const { message, chat: chatId } = req.body;

    let title = null, chat = null;

    // ── New conversation: no chatId provided ──
    if (!chatId) {
        // Generate a 2-4 word title from the user's first message
        title = await genrateChatTitle(message);

        // Create the chat document, linked to the logged-in user
        chat = await chatModel.create({
            user: req.user.id,
            title
        });
    }

    // ── Save user message to DB ──
    // Uses existing chatId if continuing a conversation,
    // or the newly created chat._id if this is a new one
    const userMessage = await messageModel.create({
        chat: chatId || chat._id,
        content: message,
        role: "user"
    });

    // ── Fetch full chat history for AI context ──
    // The AI agent needs all previous messages to understand the conversation
    const messages = await messageModel.find({
        chat: chatId || chat._id
    });

    // ── Generate AI response ──
    // genrateResponse passes history to the LangChain agent,
    // which may use the searchInternet tool if needed
    const result = await genrateResponse(messages);

    // ── Save AI response to DB ──
    const aiMessage = await messageModel.create({
        chat: chatId || chat._id,
        content: result,
        role: "ai"
    });

    // ── Respond to frontend ──
    // Frontend uses `chat` to register a new chat in the sidebar (if new)
    // and `aiMessage` to display the AI response
    res.status(201).json({
        title,
        chat,
        aiMessage
    });
}

/**
 * getChats — Fetches all chats belonging to the logged-in user.
 *
 * Used by the frontend on Dashboard mount to populate the sidebar
 * with the user's conversation history.
 *
 * Note: Messages are NOT returned here — they are lazy-loaded
 * per chat when the user clicks on one (see getMessages).
 *
 * @route  GET /api/chats
 * @access Private
 */
export async function getChats(req, res) {
    const user = req.user;

    // Only return chats that belong to this user
    const chats = await chatModel.find({ user: user.id });

    res.status(200).json({
        message: "Chats retrieved successfully",
        chats
    });
}

/**
 * getMessages — Fetches all messages for a specific chat.
 *
 * Called when the user clicks on a chat in the sidebar.
 * The frontend lazy-loads messages only when needed,
 * avoiding loading the entire history on startup.
 *
 * Security: verifies the chat belongs to the requesting user
 * before returning any messages — prevents users from reading
 * other users' chats by guessing a chatId.
 *
 * Note: There is a variable name conflict in the response —
 * both the success message string and the messages array are
 * named `message`. This works at runtime but should be fixed
 * by renaming the array to `messages` in both the query and response.
 *
 * @route  GET /api/chats/:chatId/messages
 * @access Private
 * @param  chatId - MongoDB ObjectId of the chat
 */
export async function getMessages(req, res) {
    const { chatId } = req.params;

    // ── Ownership check ──
    // Ensures the chat exists AND belongs to the requesting user
    const chat = await chatModel.findOne({
        _id: chatId,
        user: req.user.id
    });

    if (!chat) {
        return res.status(400).json({
            message: "Chat not found",
            success: false,
            err: "Chat not found"
        });
    }

    // ── Fetch messages ──
    // Returns all messages in insertion order (oldest first)
    const message = await messageModel.find({
        chat: chatId
    });

    res.status(200).json({
        message: "Messages fetched successfully",
        success: true,
        message  // ⚠️ naming conflict — consider renaming to `messages`
    });
}

/**
 * deleteChat — Deletes a chat and all its messages.
 *
 * Flow:
 *  1. Find the chat — verify it exists AND belongs to this user
 *  2. Return 404 if not found or unauthorized
 *  3. Delete the chat document
 *  4. Delete all messages linked to this chat
 *  5. Return success
 *
 * Why find before delete?
 *  If we call findOneAndDelete directly without checking first,
 *  and the chat doesn't exist, the 404 response never fires
 *  because deleteMany runs regardless. Finding first ensures
 *  the ownership check happens before any destructive operation.
 *
 * Why delete messages separately?
 *  MongoDB does not cascade deletes automatically. Deleting the
 *  Chat document does not remove its associated Message documents —
 *  messageModel.deleteMany() handles that cleanup explicitly.
 *
 * @route  DELETE /api/chats/:chatId
 * @access Private
 * @param  chatId - MongoDB ObjectId of the chat to delete
 */
export async function deleteChat(req, res) {
    const { chatId } = req.params;

    // ── Step 1: Verify chat exists and belongs to this user ──
    const chat = await chatModel.findOne({
        _id: chatId,
        user: req.user.id  // prevents users from deleting other users' chats
    });

    // Return 404 if chat not found or user doesn't own it
    if (!chat) {
        return res.status(404).json({
            message: "Chat not found",
            success: false,
            err: "Chat not found"
        });
    }

    // ── Step 2: Delete the chat document ──
    await chatModel.findByIdAndDelete(chatId);

    // ── Step 3: Delete all messages belonging to this chat ──
    // Must be done explicitly — MongoDB has no automatic cascade delete
    await messageModel.deleteMany({ chat: chatId });

    res.status(200).json({
        message: "Chat deleted successfully",
        success: true
    });
}
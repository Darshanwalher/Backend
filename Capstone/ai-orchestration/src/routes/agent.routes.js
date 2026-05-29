import { Router } from "express";
import agent from "../agents/code.agent.js";

const agentRouter = Router();

agentRouter.post('/invoke', async (req, res) => {
    try {
        const { message } = req.body;
        const response = await agent.invoke({
            messages: [
                {
                    role: "user",
                    content: message
                }
            ]
        });

        const finalMessage = response.messages[response.messages.length - 1];

        res.json({
            response: finalMessage.content
        });
    } catch (error) {
        console.error("Error invoking agent:", error);
        res.status(500).json({
            error: "An error occurred while invoking the agent."
        });
    }
});


export default agentRouter;


import { Router } from "express";
import agent from "../agents/code.agent.js";

const agentRouter = Router();

function getSandboxId(req) {
    if (req.body && req.body.sandboxId) {
        return req.body.sandboxId;
    }
    if (req.headers['x-sandbox-id']) {
        return req.headers['x-sandbox-id'];
    }
    const host = req.headers.host;
    if (host) {
        const parts = host.split('.');
        if (parts.length > 1 && (parts[1] === 'preview' || parts[1] === 'agent')) {
            return parts[0];
        }
    }
    const referer = req.headers.referer;
    if (referer) {
        try {
            const url = new URL(referer);
            const parts = url.hostname.split('.');
            if (parts.length > 1 && (parts[1] === 'preview' || parts[1] === 'agent')) {
                return parts[0];
            }
        } catch (e) {
            // Ignore URL parsing errors
        }
    }
    return null;
}

agentRouter.post('/invoke', async (req, res) => {
    try {
        const { message } = req.body;
        const sandboxId = getSandboxId(req);

        console.log(`[Agent API] Invoking agent for sandboxId: ${sandboxId}`);

        if (!sandboxId) {
            return res.status(400).json({
                error: "sandboxId is required. Please pass it in the request body ('sandboxId'), in the 'x-sandbox-id' header, or make the request through your sandbox subdomain (e.g., http://{sandboxId}.preview.localhost/api/ai/invoke)."
            });
        }

        const response = await agent.invoke(
            {
                messages: [
                    {
                        role: "user",
                        content: message
                    }
                ]
            },
            {
                configurable: {
                    sandboxId: sandboxId
                }
            }
        );

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


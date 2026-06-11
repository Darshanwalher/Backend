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

        if (!sandboxId) {
            return res.status(400).json({
                error: "sandboxId is required. Please pass it in the request body ('sandboxId'), in the 'x-sandbox-id' header, or make the request through your sandbox subdomain (e.g., http://{sandboxId}.preview.localhost/api/ai/invoke)."
            });
        }

        // SSE headers — keep-alive is critical for long-running AI streams
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no',   // Disable nginx buffering for SSE
        });

        // Heartbeat: send a comment every 15s to prevent proxy/browser timeouts
        const heartbeat = setInterval(() => {
            res.write(': heartbeat\n\n');
        }, 15000);

        // writer is injected into config.writer — tools call it to stream status messages
        const writer = (msg) => {
            res.write(`data: ${JSON.stringify({ type: 'log', message: msg })}\n\n`);
        };

        const response = await agent.stream(
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
                    sandboxId: sandboxId,
                },
                streamMode: "custom",
                // LangGraph injects this into config.writer inside tools
                writer,
            }
        );

        for await (const chunk of response) {
            console.log('[agent stream chunk]', chunk);
            res.write(`data: ${JSON.stringify({ type: 'chunk', data: chunk })}\n\n`);
        }

        clearInterval(heartbeat);
        res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
        res.end();

    } catch (error) {
        console.error("Error invoking agent:", error);
        if (!res.headersSent) {
            res.status(500).json({
                error: error.stack || error.message || "An error occurred while invoking the agent."
            });
        } else {
            res.write(`data: ${JSON.stringify({ type: 'error', message: error.stack || error.message })}\n\n`);
            res.end();
        }
    }
});


export default agentRouter;


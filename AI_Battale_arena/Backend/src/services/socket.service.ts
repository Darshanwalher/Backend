import { Server as SocketIOServer } from "socket.io";
import type { Server as HTTPServer } from "node:http";
import { runSolutions, runJudge } from "./graph.ai.service.js";

export function setupSocketIO(httpServer: HTTPServer): SocketIOServer {
    const io = new SocketIOServer(httpServer, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"],
            credentials: true,
        },
    });

    io.on("connection", (socket) => {
        console.log(`🔌 Client connected: ${socket.id}`);

        socket.on("battle:start", async (data: { problem: string }) => {
            const { problem } = data;

            if (!problem || typeof problem !== "string") {
                socket.emit("battle:error", {
                    message: "A valid problem string is required.",
                });
                return;
            }

            console.log(`⚔️  Battle started by ${socket.id}: "${problem.slice(0, 60)}..."`);

            try {
                // Step 1 – Run solutions (Mistral + Cohere in parallel)
                const { solution_1, solution_2 } = await runSolutions(problem);

                // Emit solutions as soon as they are ready
                socket.emit("battle:solutions", { solution_1, solution_2 });
                console.log(`✅ Solutions ready for ${socket.id}`);

                // Step 2 – Run judge
                const judge = await runJudge(problem, solution_1, solution_2);

                // Emit judge result
                socket.emit("battle:judge", { judge });
                console.log(`⚖️  Judge ready for ${socket.id}`);

                // Step 3 – Emit complete with full payload
                socket.emit("battle:complete", {
                    problem,
                    solution_1,
                    solution_2,
                    judge,
                });
                console.log(`🏁 Battle complete for ${socket.id}`);
            } catch (error: unknown) {
                const message =
                    error instanceof Error ? error.message : "An unexpected error occurred.";
                console.error(`❌ Battle error for ${socket.id}:`, message);
                socket.emit("battle:error", { message });
            }
        });

        socket.on("disconnect", (reason) => {
            console.log(`🔌 Client disconnected: ${socket.id} (${reason})`);
        });
    });

    return io;
}

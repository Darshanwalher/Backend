import "dotenv/config";
import app from "./src/app.js";
import connectDB from "./src/config/database.js";
import { initSocketServer } from "./src/sockets/server.socket.js";
import http from "http";

const httpServer = http.createServer(app);

initSocketServer(httpServer);

connectDB();

httpServer.listen(3000, () => {
    console.log(`Server running on port 3000`);
});
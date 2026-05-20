import { createServer } from "node:http";
import app from "./src/app.js";
import { setupSocketIO } from "./src/services/socket.service.js";

const httpServer = createServer(app);

setupSocketIO(httpServer);

httpServer.listen(3000, () => {
    console.log("Server is running on port 3000");
});
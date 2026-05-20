import express from "express";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import chatRouter from "./routes/chat.routes.js";
import morgan from "morgan";
import cors from "cors";
import path from "path";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(cors({
    origin: "https://perolexity.onrender.com",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
}))
app.use(express.static("./public"));


// Health check
app.get("/api/health", (req, res) => {
    res.json({ message: "Server is running" });
});

app.use("/api/auth", authRouter);
app.use("/api/chats", chatRouter);

// Catch-all route to serve the frontend React/Vue app for any unknown routes (Fixes "Cannot GET /login")
app.get(/.*/, (req, res) => {
    res.sendFile(path.resolve("public", "index.html"));
});

export default app;


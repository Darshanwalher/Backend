const express = require("express");
const authRoutes = require("../src/routes/auth.routes");
const songRoutes = require("../src/routes/song.routes");
const cookieParser = require("cookie-parser")
const cors = require("cors")


const app = express();
app.use(express.json());
app.use(cookieParser())
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}))

app.use("/api/auth",authRoutes);
app.use("/api/songs",songRoutes);



module.exports = app;
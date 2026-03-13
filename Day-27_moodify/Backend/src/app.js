const express = require("express");
const authRoutes = require("../src/routes/auth.routes");
const songRoutes = require("../src/routes/song.routes");
const cookieParser = require("cookie-parser")
const cors = require("cors")


const app = express();
app.use(express.json());
app.use(cookieParser())
app.use(cors({
    origin:"https://moodify-41fv.onrender.com",
    credentials:true
}))
app.use(express.static("./public"))

app.use("/api/auth",authRoutes);
app.use("/api/songs",songRoutes);



module.exports = app;
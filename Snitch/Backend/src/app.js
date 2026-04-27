import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.route.js";
import cors from "cors";

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:true}));
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true,
}))

app.get("/",(req,res)=>{
    res.status(200).json({message:"server is running"});
})

app.use("/api/auth", authRouter);


export default app;
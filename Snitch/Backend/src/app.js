import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.route.js";
import ProductRouter from "./routes/product.route.js";
import cors from "cors";
import passport from "passport";
import {Strategy as GoogleStrategy} from "passport-google-oauth20";
import {config} from "./config/config.js";

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:true}));
// app.use(cors({
//     origin:"http://localhost:5173",
//     credentials:true,
// }))

app.use(passport.initialize());
passport.use(new GoogleStrategy({
    clientID: config.GOOGLE_CLIENT_ID,
    clientSecret: config.GOOGLE_CLIENT_SECRET,
    callbackURL:"/api/auth/google/callback"
},(accessToken, refreshToken, profile, done)=>{
    return done(null,profile);
}))

app.get("/",(req,res)=>{
    res.status(200).json({message:"server is running"});
})

app.use("/api/auth", authRouter);
app.use("/api/products", ProductRouter);

export default app;
import "dotenv/config";
import express from 'express';
import morgan from "morgan";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import cookieParser from "cookie-parser";
import passport from "passport";

import authRoutes from "./routes/auth.routes.js";

const app = express();

app.use(morgan("dev"));
app.use(cookieParser());
app.use(passport.initialize());

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
}, (accessToken, refreshToken, profile, done) => {
    // Handle user authentication logic here

    return done(null, profile);
}));

app.get("/_status/healthz", (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.get("/_status/readyz", (req, res) => {
    res.status(200).json({ status: 'ready' });
});

app.use('/api/auth', authRoutes);


export default app;
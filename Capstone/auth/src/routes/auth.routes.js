import { Router } from "express";
import userModel from "../models/user.model.js";
import passport from "passport";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendAuthNotification } from "../config/mq.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

// Password hashing & verification helpers
function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
    return `${salt}:${hash}`;
}

function verifyPassword(password, storedPassword) {
    if (!storedPassword || !storedPassword.includes(":")) return false;
    const [salt, hash] = storedPassword.split(":");
    const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
    return hash === verifyHash;
}

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', { 
    session: false,
    failureRedirect: '/' }), async(req, res) => {
    try {
        const { id, displayName, emails, photos } = req.user;
        let user = await userModel.findOne({ googleId: id });

        if (!user) {
            user = new userModel({
                googleId: id,
                email: emails[0].value,
                name: displayName,
                avtar: photos[0].value
            });
            await user.save();
        }

        await sendAuthNotification({
            userId: user._id,
            action: 'google_login',
            timestamp: new Date(),
            email: emails[0].value
        });
        // Generate JWT token
        const token = jwt.sign({ id: user._id }, process.env.jwt_secret, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true });
        // Localhost API: res.redirect('http://localhost:5173');
        res.redirect('https://www.code-spaces.online');
    } catch (err) {
        console.error('Error occurred while processing Google login:', err);
    }
});

// Local Registration
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email is already registered" });
        }

        const hashedPassword = hashPassword(password);
        const user = new userModel({
            name,
            email,
            password: hashedPassword,
            avtar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`
        });

        await user.save();

        await sendAuthNotification({
            userId: user._id,
            action: 'register',
            timestamp: new Date(),
            email: email
        });

        const token = jwt.sign({ id: user._id }, process.env.jwt_secret, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true });

        const userObj = user.toObject();
        delete userObj.password;

        res.status(201).json({ user: userObj });
    } catch (err) {
        console.error('Error in /register:', err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Local Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await userModel.findOne({ email });
        if (!user || !user.password) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isMatch = verifyPassword(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        await sendAuthNotification({
            userId: user._id,
            action: 'login',
            timestamp: new Date(),
            email: email
        });

        const token = jwt.sign({ id: user._id }, process.env.jwt_secret, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true });

        const userObj = user.toObject();
        delete userObj.password;

        res.status(200).json({ user: userObj });
    } catch (err) {
        console.error('Error in /login:', err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get Current User Profile
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const userObj = req.user.toObject();
        delete userObj.password;
        res.status(200).json({ user: userObj });
    } catch (err) {
        console.error('Error in /me:', err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Logout
const handleLogout = (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: "Logged out successfully" });
};
router.post('/logout', handleLogout);
router.get('/logout', handleLogout);

export default router;
import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";

export async function authMiddleware(req, res, next) {
    const token = req.cookies?.token || req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Authentication token is missing' });
    }

    try {
        const decoded = jwt.verify(token, process.env.jwt_secret);
        const user = await userModel.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        req.user = user;
        next();
    } catch (error) {
        console.error("Token verification failed in auth middleware:", error);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
}

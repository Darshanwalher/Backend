import jwt from "jsonwebtoken";

export function verifyToken(token) {
    try{
        return jwt.verify(token, process.env.jwt_secret);
    }catch(error){
        console.error("Token verification failed:", error);
        return null;
    }
}
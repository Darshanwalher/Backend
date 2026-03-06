const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const blackList = require("../models/blacklist.model");
const redius = require("../config/cache")



async function authUser(req,res,next){
    const token = req.cookies.token;

    if(!token){
        return res.status(401).json({
            message:"token not provided."
        })
    }

    const isBlackListed = await redius.get(token);

    if(isBlackListed){
        return res.status(401).json({
            message:"token is blacklisted."
        })
    }


    let decode;

    try{
        decode = jwt.verify(token,process.env.JWT_SECRET_KEY)
        req.user = decode
        next();
    }
    catch(err){
        return res.status(401).json({
            message:"invalid token."
        })
    
    }

}

module.exports = authUser;
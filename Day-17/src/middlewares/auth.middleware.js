const express = require('express');
const jwt = require('jsonwebtoken');


async function identifyUser(req,res,next){
    const token = req.cookies.token


    if(!token){
        return res.status(404).json({
            message:"Token Not Provided, Unotherized access"
        })
    }

    let decoded = null;
    
   try{
      decoded = jwt.verify(token,process.env.JWT_SECRET_KEY)
   }
   catch{
        return res.status(401).json({
            message:"user is not unotherized"
        })
   }
   req.user = decoded;
   next();
}

module.exports = identifyUser;
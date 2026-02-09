const express = require("express")
const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")
const authRouter = express.Router()
const crypto = require("crypto")

authRouter.post("/register",async(req,res)=>{
    const {name,email,password} = req.body

    const isUserAlreadyExists = await userModel.findOne({email})

    if(isUserAlreadyExists){
        return res.status(409).json({
            message:"With These Email User Account Already Exists ! pls Try Different One"
        })
    }

    const hash = crypto.createHash("md5").update(password).digest("hex")
    const user = await userModel.create({
        name,email,password:hash
    })

    const token = jwt.sign({
        id:user._id
    },
    process.env.JWT_SECRET
    )

    res.cookie("jwt_token",token)

    res.status(201).json({
        message:"User Register.",
        user,
        token
    })
})

authRouter.post("/protected",(req,res)=>{
    console.log(req.cookies);

    res.status(200).json({
        message:"These is protected route"
    })
    
})

authRouter.post("/login",async(req,res)=>{

    const {email,password} = req.body;

    const user = await userModel.findOne({email})

    if(!user){
        return res.status(404).json({
            message:"User Not Found With Email Address"
        })
    }

    const isPasswordMatched = user.password ===  crypto.createHash("md5").update(password).digest("hex")
    if(!isPasswordMatched){
        return res.status(401).json({
            message:"Invalid Password"
        })
    }

    const token = jwt.sign({
        id:user._id
    },process.env.JWT_SECRET)

    res.cookie("jwt_token",token)

    res.status(200).json({
        message:"User Logged In",
        user,
    })
})


module.exports = authRouter
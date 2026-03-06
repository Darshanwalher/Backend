const userModel = require("../models/user.model")
// const blackList = require("../models/blacklist.model")
const redius = require("../config/cache")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")

async function register(req,res){

    const {username,password,email} = req.body;
    
    const isAlreadyExist = await userModel.findOne({
        $or:[{username},{email}]
    }).select("+password")


    if(isAlreadyExist){
        return res.status(400).json({
            message:"user already exist"
        })
    }

    const hashedPassword = await bcrypt.hash(password,10)

    const user = await userModel.create({
        username,
        password:hashedPassword,
        email
    })

    const token = jwt.sign({
        id:user._id,
        username:user.username
    },process.env.JWT_SECRET_KEY,{
        expiresIn:"3d"
    })

    res.cookie("token",token)

    res.status(201).json({
        message:"user created",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })

}

async function login(req,res){
    const {username,email,password} = req.body;

    const user = await userModel.findOne({
        $or:[{username},{email}]
    }).select("+password")


    if(!user){
        return res.status(400).json({
            message:"Invalid creaditonals"
        })
    }

    const isPasswordMatch = await bcrypt.compare(password,user.password)

    if(!isPasswordMatch){
        return res.status(400).json({
            message:"invalid password"
        })
    }

    const token = jwt.sign({
        id:user.id,
        username:user.username
    },process.env.JWT_SECRET_KEY,{
        expiresIn:"3d"  
    })

    res.cookie("token",token)

    res.status(200).json({
        message:"user logged in successfully.",
        user
    })
}

async function getMe(req,res){
    const user =await userModel.findById(req.user.id);

    if(!user){
        return res.status(404).json({
            message:"user not found"
        })
    }

    res.status(200).json({
        message:"user found",
        user:{
            id:user._id,
            username:user.username,
            email:user.email
        }
    })

}

async function logoutUser(req, res) {

    const token = req.cookies.token;   

    if (!token) {
        return res.status(400).json({
            message: "No token found"
        });
    }

    res.clearCookie("token");

    await redius.set(token,Date.now().toString(),'EX',60*60)

    res.status(200).json({
        message: "User logged out successfully"
    });
}

module.exports={
    register,
    login,
    getMe,
    logoutUser
}
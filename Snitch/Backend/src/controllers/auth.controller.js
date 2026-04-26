import userModel from "../models/user.model";
import jwt from "jsonwebtoken";
import { config } from "../config/config";


async function sendTokenResponse(user,res,message){
    const token = jwt.sign(
        {id:user._id}
    , config.JWT_SECRET_KEY
    , {expiresIn:"7d"});
    
    res.cookie("token", token)

    res.status(200).json({
        message,
        success: true,
        user: {
            id: user._id,
            email: user.email,
            contact: user.contact,
            fullname: user.fullname,
            role: user.role
        }
    })
}

export const register = async (req,res)=>{
    const {email,contact,password,fullName} = req.body;

    try {
        const isUserExist = await userModel.findOne({
            $or:[
                {email},
                {contact}
            ]
        });

        if(isUserExist){
            return res.status(400).json({
                message:"User with this email or contact already exists"
            })
        }

        const user = await userModel.create({
            email,
            contact,
            password,
            fullName,
            role:isSeller ? "seller" : "buyer"
        })

        await sendTokenResponse(user, res, "User registered successfully")
    }
    catch(error){
        console.log(error)
        res.status(500).json({
            message:"Internal server error"
        })
    }
}
import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken"
import { sendEmail } from "../service/mail.service.js";


/**
 * @desc Register a new user
 * @route POST /api/auth/register
 * @access Public
 * @body { username, email, password }
 */
export async function register(req, res) {
    const { username, email, password } = req.body;

    const isUserAlreadyExist = await userModel.findOne({
        $or: [{ username }, { email }]
    })

    if(isUserAlreadyExist){
        return res.status(400).json({
            message: "User With this username or email already exist",
            success: false,
            err:"User already exist"
        });
    }

    const user = await userModel.create({
        username,
        email,
        password
    })

    const emailVerificationToken = jwt.sign({
        email:user.email,
    },process.env.JWT_SECRET)

    await sendEmail({
  to: email,
  subject: "Verify Your Email - Perplexity",
  html: `
  <div style="font-family: Arial, sans-serif; background-color:#f4f6f8; padding:40px;">
    
    <div style="max-width:600px; margin:auto; background:white; border-radius:10px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.1);">
      
      <div style="background:#111827; color:white; padding:20px; text-align:center;">
        <h2 style="margin:0;">Welcome to Perplexity 🚀</h2>
      </div>

      <div style="padding:30px; color:#333;">
        <h3>Hi ${username},</h3>

        <p>
          Thank you for creating an account with <strong>Perplexity</strong>.  
          We're excited to have you with us!
        </p>

        <p>
          Please confirm your email address by clicking the button below:
        </p>

        <div style="text-align:center; margin:30px 0;">
          <a href="http://localhost:3000/api/auth/verify-email?token=${emailVerificationToken}" 
             style="background:#2563eb; color:white; padding:14px 28px; text-decoration:none; border-radius:6px; font-weight:bold; display:inline-block;">
             Verify Email
          </a>
        </div>

        <p style="font-size:14px; color:#555;">
          This verification link will expire in <strong>10 minutes</strong>.
        </p>

        <p style="font-size:14px;">
          If you didn’t create this account, you can safely ignore this email.
        </p>

        <hr style="margin:25px 0;">

        <p style="font-size:13px; color:#777;">
          Need help? Contact our support team anytime.
        </p>

        <p style="font-size:13px; color:#777;">
          — The Perplexity Team
        </p>
      </div>

      <div style="background:#f9fafb; padding:15px; text-align:center; font-size:12px; color:#888;">
        © ${new Date().getFullYear()} Perplexity. All rights reserved.
      </div>

    </div>
  </div>
  `
});

    res.status(201).json({
        message: "User registered successfully",
        success: true,
        user:{
            id:user._id,
            username:user.username,
            email:user.email
        }

    })

}


/**
 * @desc Get current logged in user's details
 * @route GET /api/auth/get-me
 * @access Private
 */
export async function verifyEmail(req, res) {
    try {
        const { token } = req.query;

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await userModel.findOne({
            email: decoded.email
        });

        if (!user) {
            return res.status(400).json({
                message: "Invalid token.",
                success: false,
                err: "User not found"
            });
        }

        user.verified = true;
        await user.save();

        const html = `
            <h1>Email Verified Successfully!</h1>
            <p>Your email has been verified. You can now log in to your account.</p>
            <a href="http://localhost:3000/login">Go to Login</a>
        `;

        return res.send(html);

    } catch (error) {
        console.error("Email verification error:", error);

        return res.status(500).json({
            success: false,
            message: "Email verification failed",
            error: error.message
        });
    }
}


/**
 * @desc Login user and return JWT token
 * @route POST /api/auth/login
 * @access Public
 * @body { email, password }
 */
export async function login(req,res){

    const {email,password} = req.body;

    const user = await userModel.findOne({ email})

    if(!user){
        return res.status(400).json({
            message:"Invalid credentials",
            success:false,
            err:"User not found"
        })
    }

    const isPasswordMatch = await user.comparePassword(password);

    if(!isPasswordMatch){
        return res.status(400).json({
            message:"Invalid credentials",
            success:false,
            err:"Password is incorrect"
        })
    }

    if(!user.verified){
        return res.status(400).json({
            message:"Please verify your email",
            success:false,
            err:"Email not verified"
        })
    }

    const token = jwt.sign({
        id:user._id,
        username:user.username,
    },process.env.JWT_SECRET,{
        expiresIn:"7d"
    })

    res.cookie("token",token)

    res.status(200).json({
        message:"Login successful",
        success:true,
        user:{
            id:user._id,
            username:user.username,
            email:user.email
        }
    })



}


export async function getMeController(req, res) {
    try {
        const userId = req.user.id;

        const user = await userModel
            .findById(userId)
            .select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false,
                err: "User not found"
            });
        }

        res.status(200).json({
            message: "User details fetched successfully",
            success: true,
            user
        });

    } catch (error) {
        console.error("GetMe error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch user",
            error: error.message
        });
    }
}
import dotenv from "dotenv";
dotenv.config();
import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../services/mail.service.js";


/**
 * @desc Register a new user
 * @route POST /api/auth/register
 * @access Public
 * @body { username, email, password }
 */
export async function register(req, res) {

    const { username, email, password } = req.body;

    const isUserAlreadyExists = await userModel.findOne({
        $or: [ { email }, { username } ]
    })

    if (isUserAlreadyExists) {
        return res.status(400).json({
            message: "User with this email or username already exists",
            success: false,
            err: "User already exists"
        })
    }

    const user = await userModel.create({ username, email, password })

    const emailVerificationToken = jwt.sign({
        email: user.email,
    }, process.env.JWT_SECRET)

    await sendEmail({
        to: email,
        subject: "Welcome to Perplexity!",
        html: `
        <div style="font-family: Arial, sans-serif; background-color: #191A19; padding: 40px 0; color: #E8E8E3;">
        
        <div style="max-width: 500px; margin: auto; background-color: #202222; border: 1px solid #333; border-radius: 12px; padding: 30px; text-align: center;">
            
            <!-- Logo / Brand -->
            <h2 style="color: #ffffff; margin-bottom: 10px;">
            <span style="color:#20B8CD;">●</span> Perplexity
            </h2>

            <!-- Heading -->
            <h3 style="color: #ffffff; margin-bottom: 20px;">
            Verify Your Email
            </h3>

            <!-- Message -->
            <p style="color: #B0B0B0; font-size: 14px; line-height: 1.6;">
            Hi <strong>${username}</strong>,
            </p>

            <p style="color: #B0B0B0; font-size: 14px; line-height: 1.6;">
            Welcome to <strong>Perplexity</strong> 🚀 <br/>
            We're excited to have you on board.
            </p>

            <p style="color: #B0B0B0; font-size: 14px; margin-bottom: 25px;">
            Please confirm your email address by clicking the button below:
            </p>

            <!-- CTA Button -->
            <a href="http://localhost:3000/api/auth/verify-email?token=${emailVerificationToken}"
            style="
                display: inline-block;
                padding: 12px 24px;
                background-color: #20B8CD;
                color: #000;
                text-decoration: none;
                border-radius: 6px;
                font-weight: bold;
                font-size: 14px;
            ">
            Verify Email
            </a>

            <!-- Divider -->
            <div style="margin: 25px 0; border-top: 1px solid #333;"></div>

            <!-- Footer -->
            <p style="color: #777; font-size: 12px; line-height: 1.5;">
            If you did not create this account, you can safely ignore this email.
            </p>

            <p style="color: #777; font-size: 12px;">
            © ${new Date().getFullYear()} Perplexity. All rights reserved.
            </p>

        </div>

        </div>
`
    })

    res.status(201).json({
        message: "Registration successful. Please verify your email.",
        success: true,
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    });
}

/**
 * @desc Login user and return JWT token
 * @route POST /api/auth/login
 * @access Public
 * @body { email, password }
 */
export async function login(req, res) {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email })

    if (!user) {
        return res.status(400).json({
            message: "Invalid email or password",
            success: false,
            err: "User not found"
        })
    }

    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
        return res.status(400).json({
            message: "Invalid email or password",
            success: false,
            err: "Incorrect password"
        })
    }

    if (!user.verified) {
        return res.status(400).json({
            message: "Please verify your email before logging in",
            success: false,
            err: "Email not verified"
        })
    }

    const token = jwt.sign({
        id: user._id,
        username: user.username,
    }, process.env.JWT_SECRET, { expiresIn: '7d' })

    res.cookie("token", token)

    res.status(200).json({
        message: "Login successful",
        success: true,
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })

}


/**
 * @desc Get current logged in user's details
 * @route GET /api/auth/get-me
 * @access Private
 */
export async function getMe(req, res) {
    const userId = req.user.id;

    const user = await userModel.findById(userId).select("-password");

    if (!user) {
        return res.status(404).json({
            message: "User not found",
            success: false,
            err: "User not found"
        })
    }

    res.status(200).json({
        message: "User details fetched successfully",
        success: true,
        user
    })
}


/**
 * @desc Verify user's email address
 * @route GET /api/auth/verify-email
 * @access Public
 * @query { token }
 */
export async function verifyEmail(req, res) {
    const { token } = req.query;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const user = await userModel.findOne({ email: decoded.email });

        if (!user) {
            return res.status(400).json({
                message: "Invalid token",
                success: false,
                err: "User not found"
            })
        }

        user.verified = true;

        await user.save();

        const html = `
        <div style="font-family: Arial, sans-serif; background-color: #191A19; height: 100vh; display: flex; align-items: center; justify-content: center; margin:0; padding:0;">

        <div style="max-width: 420px; width: 100%; background-color: #202222; border: 1px solid #333; border-radius: 12px; padding: 30px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.4);">
            
            <!-- Logo -->
            <h2 style="color: #ffffff; margin-bottom: 10px;">
            <span style="color:#20B8CD;">●</span> Perplexity
            </h2>

            <!-- Success Icon -->
            <div style="font-size: 50px; margin: 15px 0;">✅</div>

            <!-- Heading -->
            <h1 style="color: #ffffff; font-size: 22px; margin-bottom: 10px;">
            Email Verified!
            </h1>

            <!-- Message -->
            <p style="color: #B0B0B0; font-size: 14px; line-height: 1.6; margin-bottom: 25px;">
            Your email has been successfully verified.  
            You can now log in and start using your account 🚀
            </p>

            <!-- Button -->
            <a href="http://localhost:5173/login"
            style="
                display: inline-block;
                padding: 12px 24px;
                background-color: #20B8CD;
                color: #000;
                text-decoration: none;
                border-radius: 6px;
                font-weight: bold;
                font-size: 14px;
            ">
            Go to Login
            </a>

            <!-- Footer -->
            <p style="margin-top: 25px; color: #777; font-size: 12px;">
            © ${new Date().getFullYear()} Perplexity
            </p>

        </div>

        </div>
        `;

        return res.send(html);
    } catch (err) {
        return res.status(400).json({
            message: "Invalid or expired token",
            success: false,
            err: err.message
        })
    }
}


export async function logOut(req,res){

    const token = req.cookies.token;

    if(!token){
        return resizeBy.status(400).json({
            message:"User not logged in",
            success:false,
            err:"User not logged in"
        })
    }
    res.clearCookie("token");
    res.status(200).json({
        message:"Logout successful",
        success:true
    })

}
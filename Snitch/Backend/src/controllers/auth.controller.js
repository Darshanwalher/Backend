import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { config } from "../config/config.js";


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
    const {email,contact,password,fullname,isSeller} = req.body;

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
            fullname,
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

export const login = async (req,res)=>{
    const {email,password} = req.body;

    try{
        const user = await userModel.findOne({email});
        if(!user){
            return res.status(400).json({
                message:"User with this email does not exist"
            })
        }

        const isPasswordMatch = await user.comparePassword(password);
        if(!isPasswordMatch){
            return res.status(400).json({
                message:"Invalid email or password"
            })
        }

        await sendTokenResponse(user,res,"User logged in successfully")
        
    }catch(error){
        console.log(error);
        res.status(500).json({
            message:"Internal server error"
        })
    }

}

export const googleCallback = async (req,res)=>{

    const {id,displayName,emails,photos} = req.user;

    const email = emails[0].value;
    const profilePic = photos[0].value;

    let user = await userModel.findOne({email});

    if(!user){
        user = await userModel.create({
            email,
            fullname:displayName,
            googleId:id,
        })
    }

    const token = jwt.sign(
        {id:user._id}
    , config.JWT_SECRET_KEY
    , {expiresIn:"7d"});
    res.cookie("token", token)  

    

    res.redirect("http://localhost:5173/");
}

export const getMe = async (req,res)=>{
    const user = req.user;

    res.status(200).json({
        message: "User fetched successfully",
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

export const logout = async (req, res) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(400).json({
                message: "No token found"
            });
        }

        res.clearCookie("token");

        return res.status(200).json({
            message: "User logged out successfully"
        });
        
    } catch (error) {
        console.error("Logout Error:", error);
        return res.status(500).json({
            message: "An internal server error occurred during logout"
        });
    }
};

export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: "User with this email does not exist"
            });
        }

        if (user.googleId) {
            return res.status(400).json({
                message: "This account is registered via Google. Please sign in using Google."
            });
        }

        // Generate a 6-digit numeric OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetOtp = otp;
        user.resetOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await user.save();

        // Check for RESEND_API_KEY
        const apiKey = config.RESEND_API_KEY;
        if (!apiKey) {
            console.log(`\n==================================================`);
            console.log(`[DEVELOPMENT] Password Reset OTP for ${email}: ${otp}`);
            console.log(`==================================================\n`);
            return res.status(200).json({
                message: "OTP generated successfully (logged to server console in development)."
            });
        }

        // Send email via Resend API
        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                from: "Snitch <onboarding@resend.dev>",
                to: email,
                subject: "Snitch - Password Reset OTP",
                html: `
                    <div style="background-color: #000000; margin: 0; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; min-height: 100%;">
                        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; background-color: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 4px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                            <!-- Header Accent Line -->
                            <tr>
                                <td height="3" style="background: linear-gradient(to right, #ffffff, #2a2a2a, #ffffff);"></td>
                            </tr>
                            
                            <!-- Brand Logo -->
                            <tr>
                                <td align="center" style="padding: 40px 20px 20px 20px;">
                                    <h1 style="margin: 0; font-size: 36px; font-weight: 900; letter-spacing: 0.1em; color: #ffffff; text-transform: uppercase; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">SNITCH</h1>
                                    <p style="margin: 5px 0 0 0; font-size: 10px; font-weight: 700; letter-spacing: 0.3em; color: #52525b; text-transform: uppercase;">Security Studio</p>
                                </td>
                            </tr>
                            
                            <!-- Content -->
                            <tr>
                                <td style="padding: 20px 40px 40px 40px; text-align: center;">
                                    <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #a1a1aa; font-weight: 400;">
                                        We received a request to reset the password associated with your account. Use the authorization code below to establish a new password.
                                    </p>
                                    
                                    <!-- OTP Box -->
                                    <div style="background-color: #121212; border: 1px solid #27272a; padding: 24px; border-radius: 2px; margin-bottom: 24px; display: inline-block; width: 80%;">
                                        <span style="font-size: 10px; font-weight: 800; letter-spacing: 0.2em; color: #71717a; text-transform: uppercase; display: block; margin-bottom: 12px;">Verification Code</span>
                                        <span style="font-size: 38px; font-weight: 900; letter-spacing: 8px; color: #ffffff; font-family: 'Courier New', Courier, monospace; display: block;">${otp}</span>
                                    </div>
                                    
                                    <p style="margin: 0 0 32px 0; font-size: 11px; line-height: 1.6; color: #71717a; font-weight: 500;">
                                        This verification code is strictly confidential and will expire in <strong style="color: #a1a1aa;">10 minutes</strong>.
                                    </p>
                                    
                                    <hr style="border: 0; border-top: 1px solid #1a1a1a; margin: 0 0 24px 0;" />
                                    
                                    <p style="margin: 0; font-size: 11px; line-height: 1.6; color: #52525b;">
                                        If you did not initiate this request, you can safely ignore this email. Your password will remain unchanged.
                                    </p>
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td align="center" style="background-color: #050505; padding: 24px 20px; border-top: 1px solid #101010; text-align: center;">
                                    <p style="margin: 0; font-size: 9px; font-weight: 700; letter-spacing: 0.25em; color: #3f3f46; text-transform: uppercase;">
                                        Snitch Streetwear © 2025
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </div>
                `
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Resend API Error:", errorData);
            return res.status(500).json({
                message: "Failed to send OTP email via Resend"
            });
        }

        return res.status(200).json({
            message: "OTP sent successfully to your email."
        });

    } catch (error) {
        console.error("Forgot Password Error:", error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

export const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: "User with this email does not exist"
            });
        }

        if (user.googleId) {
            return res.status(400).json({
                message: "This account is registered via Google. Please sign in using Google."
            });
        }

        if (!user.resetOtp || user.resetOtp !== otp || !user.resetOtpExpires || user.resetOtpExpires < new Date()) {
            return res.status(400).json({
                message: "Invalid or expired OTP code"
            });
        }

        // OTP is valid! Reset password.
        user.password = newPassword;
        user.resetOtp = undefined;
        user.resetOtpExpires = undefined;

        await user.save();

        return res.status(200).json({
            message: "Password reset successfully. You can now log in."
        });

    } catch (error) {
        console.error("Reset Password Error:", error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};
    
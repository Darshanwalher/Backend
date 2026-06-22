import {Router} from "express";
import { validateRegisterUser, validateLoginUser, validateForgotPassword, validateResetPassword } from "../validator/auth.validator.js";
import {register,login,googleCallback, getMe, logout, forgotPassword, resetPassword} from "../controllers/auth.controller.js"
import passport from "passport";
import { authtenticateUser } from "../middleware/auth.middleware.js";
import { config } from "../config/config.js";


const authRouter = Router();

authRouter.post("/register", validateRegisterUser,register);
authRouter.post("/login",validateLoginUser,login);
authRouter.post("/forgot-password", validateForgotPassword, forgotPassword);
authRouter.post("/reset-password", validateResetPassword, resetPassword);

authRouter.get("/google", passport.authenticate("google", {scope:["profile","email"]}));

authRouter.get("/google/callback", passport.authenticate("google",{session:false,failureRedirect:`${config.FRONTEND_URL}/login`}), googleCallback);

authRouter.get("/me",authtenticateUser,getMe);

authRouter.get("/logout",logout);


export default authRouter;
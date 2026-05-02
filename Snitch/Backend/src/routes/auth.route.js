import {Router} from "express";
import { validateRegisterUser} from "../validator/auth.validator.js";
import { validateLoginUser } from "../validator/auth.validator.js";
import {register,login,googleCallback, getMe} from "../controllers/auth.controller.js"
import passport from "passport";
import { authtenticateUser } from "../middleware/auth.middleware.js";


const authRouter = Router();

authRouter.post("/register", validateRegisterUser,register);
authRouter.post("/login",validateLoginUser,login);

authRouter.get("/google", passport.authenticate("google", {scope:["profile","email"]}));

authRouter.get("/google/callback", passport.authenticate("google",{session:false,failureRedirect:"http://localhost:5173/login"}), googleCallback);

authRouter.get("/me",authtenticateUser,getMe);


export default authRouter;
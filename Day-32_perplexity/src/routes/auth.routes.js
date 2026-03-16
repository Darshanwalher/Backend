import { Router } from "express";
import { registerValidator,loginValidator} from "../validation/auth.validator.js";
import { getMeController, login, register } from "../controllers/auth.controller.js";
import { verifyEmail } from "../controllers/auth.controller.js";
import { authUser } from "../middlewares/auth.middleware.js";



const authRouter = Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 * @body { username, email, password }
 */
authRouter.post("/register",registerValidator,register)

authRouter.get("/verify-email",verifyEmail)

authRouter.post("/login",loginValidator,login)

authRouter.get("/get-me",authUser,getMeController)


export default authRouter;


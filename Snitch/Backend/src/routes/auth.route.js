import {Router} from "express";
import { validateRegisterUser} from "../validator/auth.validator.js";
import { validateLoginUser } from "../validator/auth.validator.js";
import {register} from "../controllers/auth.controller.js"
import {login} from "../controllers/auth.controller.js"

const authRouter = Router();

authRouter.post("/register", validateRegisterUser,register);
authRouter.post("/login",validateLoginUser,login);


export default authRouter;
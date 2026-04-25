import {Router} from "express";
import { validateRegisterUser} from "../validator/auth.validator.js";

const authRouter = Router();

authRouter.post("/register", validateRegisterUser);

export default authRouter;
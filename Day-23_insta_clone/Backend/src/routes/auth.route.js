const express = require("express")
const { registerUser, loginUser,getMeController } = require("../controllers/auth.controller")
const identifyUser = require("../middlewares/auth.middleware")

const authRouter = express.Router()

authRouter.post("/register",registerUser)

authRouter.post("/login",loginUser)

authRouter.get("/getme",identifyUser,getMeController)  
    

module.exports = authRouter
const express = require("express");
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/register",authController.register)

router.post("/login",authController.login)

router.get("/get-me",authMiddleware,authController.getMe)

router.get("/logout",authController.logoutUser)

module.exports = router;
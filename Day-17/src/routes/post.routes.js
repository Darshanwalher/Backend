const express = require("express");
const postRouter = express.Router()
const PostController = require("../controllers/post.controller")
const identfyUser = require("../middlewares/auth.middleware")
const multer = require("multer")
const upload = multer({storage:multer.memoryStorage()})


postRouter.post("/",upload.single("image"),identfyUser,PostController.createPostController)
postRouter.get("/",identfyUser,PostController.getPostController)
postRouter.get("/details/:postId",identfyUser,PostController.getPostDetailsController)

module.exports = postRouter
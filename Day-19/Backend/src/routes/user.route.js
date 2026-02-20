const express = require('express');
const UserRouter = express.Router();
const userController = require("../controllers/user.controller")
const identifyUser = require("../middlewares/auth.middleware")

// follow user route
UserRouter.post("/follow/:username",identifyUser,userController.followUserController)

// unfollow user route
UserRouter.post("/unfollow/:username",identifyUser,userController.unfollowUserController)

// pending follow request route
UserRouter.get("/follow/requests",identifyUser,userController.pendingFollowRequestController)

// accept follow request route
UserRouter.post("/follow/accept/:username",identifyUser,userController.acceptFollowRequestController)

// reject follow request route
UserRouter.post("/follow/reject/:username",identifyUser,userController.rejectFollowRequestController)


module.exports = UserRouter;
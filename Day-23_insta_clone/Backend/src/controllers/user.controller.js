const followModel = require("../models/follow.model");
const userModel = require("../models/user.model");

/* =========================================
   SEND FOLLOW REQUEST
========================================= */
async function followUserController(req, res) {
    try {
        const follower = req.user.username;
        const followee = req.params.username;

        if (follower === followee) {
            return res.status(400).json({
                message: "You cannot follow yourself"
            });
        }

        const userExists = await userModel.findOne({ username: followee });

        if (!userExists) {
            return res.status(404).json({
                message: "User does not exist"
            });
        }

        let existing = await followModel.findOne({ follower, followee });

        if (existing) {

            if (existing.status === "pending") {
                return res.status(400).json({
                    message: "Follow request already sent"
                });
            }

            if (existing.status === "accepted") {
                return res.status(400).json({
                    message: "You are already following this user"
                });
            }

            if (existing.status === "rejected") {
                existing.status = "pending";
                await existing.save();
                return res.status(200).json({
                    message: "Follow request sent again"
                });
            }
        }

        await followModel.create({ follower, followee });

        return res.status(201).json({
            message: `Follow request sent to ${followee}`
        });

    } catch (error) {
        return res.status(500).json({
            message: "Server Error",
            error: error.message
        });
    }
}

/* =========================================
   ACCEPT FOLLOW REQUEST
========================================= */
async function acceptFollowRequestController(req, res) {
    try {
        const followee = req.user.username;
        const follower = req.params.username;

        const request = await followModel.findOne({
            follower,
            followee,
            status: "pending"
        });

        if (!request) {
            return res.status(404).json({
                message: "No pending follow request from this user"
            });
        }

        request.status = "accepted";
        await request.save();

        return res.status(200).json({
            message: `${follower} is now your follower`
        });

    } catch (error) {
        return res.status(500).json({
            message: "Server Error",
            error: error.message
        });
    }
}

/* =========================================
   REJECT FOLLOW REQUEST
========================================= */
async function rejectFollowRequestController(req, res) {
    try {
        const followee = req.user.username;
        const follower = req.params.username;

        const request = await followModel.findOne({
            follower,
            followee,
            status: "pending"
        });

        if (!request) {
            return res.status(404).json({
                message: "No pending follow request from this user"
            });
        }

        request.status = "rejected";
        await request.save();

        return res.status(200).json({
            message: "Follow request rejected"
        });

    } catch (error) {
        return res.status(500).json({
            message: "Server Error",
            error: error.message
        });
    }
}

/* =========================================
   GET PENDING REQUESTS
========================================= */
async function pendingFollowRequestController(req, res) {
    try {
        const followee = req.user.username;

        const requests = await followModel.find({
            followee,
            status: "pending"
        });

        return res.status(200).json({
            message: "Pending follow requests fetched successfully",
            requests
        });

    } catch (error) {
        return res.status(500).json({
            message: "Server Error",
            error: error.message
        });
    }
}

/* =========================================
   UNFOLLOW USER
========================================= */
async function unfollowUserController(req, res) {
    try {
        const follower = req.user.username;
        const followee = req.params.username;

        const existing = await followModel.findOne({
            follower,
            followee,
            status: "accepted"
        });

        if (!existing) {
            return res.status(400).json({
                message: `You are not following ${followee}`
            });
        }

        await followModel.findByIdAndDelete(existing._id);

        return res.status(200).json({
            message: `You have unfollowed ${followee}`
        });

    } catch (error) {
        return res.status(500).json({
            message: "Server Error",
            error: error.message
        });
    }
}

module.exports = {
    followUserController,
    acceptFollowRequestController,
    rejectFollowRequestController,
    pendingFollowRequestController,
    unfollowUserController
};

const mongoose = require("mongoose")

const followSchema = new mongoose.Schema({
    follower:{
        type:mongoose.Types.ObjectId,
        ref:"users",
        required:[true,"follower id is required to create a follower"]
    },
    followee:{
        type:mongoose.Type.ObjectId,
        ref:"users",
        required:[true,"followee id is requied to create followee"]
    }
})

const followModel = mongoose.model("follows",followSchema)

module.exports = followModel; 
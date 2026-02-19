const mongoose = require("mongoose")

const followSchema = new mongoose.Schema({
    follower:{                  // user who sends the follow request
        type:String
        
    },
    followee:{                     // user who receives the follow request
        type:String
    },
    status:{
        type:String,
        default:"pending",
        enum:{
            values:["pending","accepted","rejected"],
            message:"status can only be pending, accepted or rejected"
        }
    }
},{
    timestamps:true
},
{createdAt:"createdAt",updatedAt:"updatedAt"})

followSchema.index({
    follower:1,
    followee:1
},{
    unique:true
})

const followModel = mongoose.model("follows",followSchema)

module.exports = followModel; 
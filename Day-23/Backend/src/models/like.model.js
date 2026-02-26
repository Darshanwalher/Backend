const mongoose = require("mongoose")

const likeSchema = new mongoose.Schema({
    post:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"posts",
        required:[true,"post id is required creating like"]
    },
    user:{
        type:String,
        required:[true,"user name is required creating like"],
    }
},{timestamps:true},{createdAt:"createdAt",updatedAt:"updatedAt"})

likeSchema.index({
    post:1,
    user:1
},{unique:true})

const likeModel = mongoose.model("likes",likeSchema)

module.exports = likeModel;
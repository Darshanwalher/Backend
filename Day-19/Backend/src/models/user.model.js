const mongoose = require("mongoose")

const userModel = mongoose.Schema({
    username:{
        type:String,
        required:[true,"username is required"],
        unique:[true,"username already exists"] 
    },
    email:{
        type:String,
        required:[true,"email is required"],
        unique:[true,"email already exists"]
    },
    password:{
        type:String,
        required:[  true,"password is required"]
    },
    bio:{
        type:String,
    },
    profileImage:{
        type:String,
        default:"https://ik.imagekit.io/darshanwalher/image.avif"
    },
    


})

module.exports = mongoose.model("user",userModel)
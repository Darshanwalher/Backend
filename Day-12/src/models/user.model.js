const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    name:String,
    email: {
    type: String,
    unique: [true, "With These Email User Account Already Exists ! pls Try Different One"]
    },

    password:String

})

const userModel = mongoose.model("users",userSchema)

module.exports = userModel
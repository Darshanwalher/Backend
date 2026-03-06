const mongoose = require("mongoose");

const songSchema = new mongoose.Schema({
    url:{
        type:String,
        required:[true,"url ie required"]
    },
    posterUrl:{
        type:String,
        required:[true,"posterUrl is required"]
    },
    title:{
        type:String,
        required:[true,"title is required"]
    },
    mood:{
        type:String,
        enum:{
            values:["happy","sad","surprised"],
            message:"these is enum"
        }
    }
})

const songModel = mongoose.model("songs",songSchema)

module.exports = songModel;
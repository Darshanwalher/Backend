const mangoose = require("mongoose");

const blackListSchema = new mangoose.Schema({
    token:{
        type:String,
        required:[true,"token is required for blacklisting ."]
    }
},{
    timestamps:true
})

const blackList = mangoose.model("blackList",blackListSchema)

module.exports = blackList;
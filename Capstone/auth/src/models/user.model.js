import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    name: { 
        type: String,
        required: true
    },
    avtar: {
        type: String
    },
    password: {
        type: String
    }
}, { timestamps: true });   


const userModel = mongoose.model('user', userSchema);

export default userModel;
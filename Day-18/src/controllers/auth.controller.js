const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")

const registerUser = async (req, res) => {
    try {
        const { username, email, password, bio, profileImage } = req.body;

        const isUserExists = await userModel.findOne({
            $or: [{ username }, { email }]
        });

        if (isUserExists) {
            return res.status(409).json({
                message: `User already exists`
            });
        }

        const hash = await bcrypt.hash(password,10);

        const user = await userModel.create({
            username,
            email,
            password: hash,
            bio,
            profileImage
        });

        const token = jwt.sign(
            { id: user._id ,username:user.username},
            process.env.JWT_SECRET_KEY,
            { expiresIn: "1d" }
        );

        res.cookie("token", token);

        res.status(201).json({
            message: "User created successfully",
            user: {
                username: user.username,
                email: user.email,
                bio: user.bio,
                profileImage: user.profileImage
            }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const user = await userModel.findOne({
            $or: [{ username }, { email }]
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const hash = await bcrypt.compare(password,user.password)

        if (!hash) {
            return res.status(401).json({
                message: "Password is incorrect"
            });
        }

        const token = jwt.sign(
            { id: user._id ,username:user.username},
            process.env.JWT_SECRET_KEY,
            { expiresIn: "1d" }
        );

        res.cookie("token", token);

        res.status(200).json({
            message: "User logged in successfully",
            user: {
                username: user.username,
                email: user.email,
                bio: user.bio,
                profileImage: user.profileImage
            }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, loginUser };
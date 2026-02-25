const postModel = require("../models/post.model")
const likeModel = require("../models/like.model")
const ImageKit = require("@imagekit/nodejs")
const {toFile} = require("@imagekit/nodejs")
const jwt = require("jsonwebtoken")

const imagekit = new ImageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY
});

async function createPostController(req,res) {
    console.log(req.body,req.file);


    const file = await imagekit.files.upload({
        file:await toFile(Buffer.from(req.file.buffer), 'file'),
        fileName: 'fileName',
        folder:"cohort-2-instaClone-post"
    })

    const post = await postModel.create({
        caption:req.body.caption,
        imgUrl:file.url,
        user:req.user.id,

    })

    res.status(201).json({
        message:"Post Is Created ..",
        post
    })
    
}

async function getPostController(req,res){

   const post = await postModel.find({
        user:req.user.id,

   })
   res.status(200).json({
    message:"post fetched successfully.",
    post
   })
}

async function getPostDetailsController(req,res){
    
    const userId = req.user.id
    const postId = req.params.postId;

    const post = await postModel.findById(postId);

    if(!post){
        return res.status(404).json({
            message:"post not found."
        })
    }

    const isValidUser = post.user.toString() === userId

    if(!isValidUser){
        return res.status(403).json({
            message:"Forbbiden content."
        })
    }

    return res.status(200).json({
        message:"post fetched successfully.",
        post
    })

}

async function likePostController(req,res){

    const username = req.user.username;
    const postId = req.params.postId;

    const post = await postModel.findById(postId);

    if(!post){
        return res.status(404).json({
            message:"post not found."
        })
    }

    const like = await likeModel.create({
        post:postId,
        user:username
    })

    res.status(200).json({
        message:"post liked successfully.",
        like
    })


}

async function getFeedController(req, res) {
    try {
        const userId = req.user;

        // First fetch posts
        const posts = await postModel
            .find()
            .populate("user")
            .lean();   // returns plain JS objects

        // Then process likes in parallel
        const updatedPosts = await Promise.all(
            posts.map(async (post) => {
                const isLiked = await likeModel.findOne({
                    user: userId.username,
                    post: post._id
                });

                post.isLiked = !!isLiked;  // true / false
                return post;
            })
        );

        res.status(200).json({
            message: "Post feed fetched successfully.",
            posts: updatedPosts
        });

    } catch (error) {
        res.status(500).json({
            message: "Something went wrong",
            error: error.message
        });
    }
}


module.exports = {
    createPostController,
    getPostController,
    getPostDetailsController,
    likePostController,
    getFeedController
}
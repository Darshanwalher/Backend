const postModel = require("../models/post.model")
const ImageKit = require("@imagekit/nodejs")
const {toFile} = require("@imagekit/nodejs")
const jwt = require("jsonwebtoken")

const imagekit = new ImageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY
});

async function createPostController(req,res) {
    console.log(req.body,req.file);

    const token = req.cookies.token


    if(!token){
        return res.status(404).json({
            message:"Token Not Provided, Unotherized access"
        })
    }

    let decoded = null;
    
   try{
      decoded = jwt.verify(token,process.env.JWT_SECRET_KEY)
   }
   catch{
        return res.status(401).json({
            message:"user is not unotherized"
        })
   }

    // console.log(decoded);
    

    const file = await imagekit.files.upload({
        file:await toFile(Buffer.from(req.file.buffer), 'file'),
        fileName: 'fileName',
        folder:"cohort-2-instaClone-post"
    })

    const post = await postModel.create({
        caption:req.body.caption,
        imgUrl:file.url,
        user:decoded.id

    })

    res.status(201).json({
        message:"Post Is Created ..",
        post
    })
    
}

async function getPostController(req,res){

    const token = req.cookies.token;

    if(!token){
        return res.status(401).json({
            message:"Unotheried Access",
        })
    }

    let decode = null;
   try{
      decode = jwt.verify(token,process.env.JWT_SECRET_KEY)
   }
   catch(err){
        return res.status(401).json({
            message:"Token Invalid"
        })
   }

   const userId = decode.id;

   const post = await postModel.find({
        user:userId,

   })
   res.status(200).json({
    message:"post fetched successfully.",
    post
   })
}

async function getPostDetailsController(req,res){
    const token = req.cookies.token;

    if(!token){
        return res.status(401).json({
            message:"Unotheried Access",
        })
    }

    let decode;
    try{
        decode = jwt.verify(token,process.env.JWT_SECRET_KEY);
    }
    catch(err){
        return res.status(401).json({
            message:"Invalid Token"
        })
    }

    const userId = decode.id
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

module.exports = {
    createPostController,
    getPostController,
    getPostDetailsController
}
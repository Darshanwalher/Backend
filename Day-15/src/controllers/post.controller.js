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

module.exports = {
    createPostController
}
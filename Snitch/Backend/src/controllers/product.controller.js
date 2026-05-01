import productModel from "../models/product.model.js";
import { uploadFile } from "../services/storage.service.js";

export const createProduct = async(req,res)=>{
    const {title,description,priceAmount,priceCurrency} = req.body;
    const seller = req.user;

    const images = await Promise.all(req.files.map(async(file)=>{
        return await uploadFile({
            buffer:file.buffer,
            fileName:file.originalname
        })
    }))

    const product = await productModel.create({
        title,
        description,
        price:{
            amount:priceAmount,
            currency:priceCurrency || "INR"
        },
        seller:seller._id,
        images
    })

    res.status(201).json({
        message:"Product created successfully",
        success:true,
        product
    })
}
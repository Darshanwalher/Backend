import {Router} from 'express';
import { authtenticateSeller } from '../middleware/auth.middleware.js';
import { addProductVariant, createProduct,getAllProducts,getProductDetails,getSellerProducts } from '../controllers/product.controller.js';
import { createProductValidator } from '../validator/product.validator.js';

import multer from 'multer';

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
});

const ProductRouter = Router();


/**
 * @route POST /api/products
 * @description Create a new product
 * @access Private (Seller only)
 */
ProductRouter.post("/",authtenticateSeller,upload.array("images",7),createProductValidator,createProduct)


/** 
 * @route GET /api/products/seller
 * @description Get all products of the authenticated seller
 * @access Private (Seller only)
 */
ProductRouter.get("/seller",authtenticateSeller,getSellerProducts)

/** 
 * @route GET /api/products
 * @description Get all products
 * @access Public
 */
ProductRouter.get("/",getAllProducts)

/** 
 * @route GET /api/products/detail/:id
 * @description Get details of a specific product
 * @access Public
 */
ProductRouter.get("/detail/:id",getProductDetails)

/** 
 * @route POST /api/products/product/:productId/variants
 * @description Add a new variant to an existing product
 * @access Private (Seller only)
 */
ProductRouter.post("/:productId/variants", authtenticateSeller,upload.array("images",7),addProductVariant)

export default ProductRouter;

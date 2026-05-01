import {Router} from 'express';
import { authtenticateSeller } from '../middleware/auth.middleware.js';
import { createProduct } from '../controllers/product.controller.js';
import { createProductValidator } from '../validator/product.validator.js';
import multer from 'multer';

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
});

const ProductRouter = Router();

ProductRouter.post("/",authtenticateSeller,createProductValidator,upload.array("images",7),createProduct)

export default ProductRouter;

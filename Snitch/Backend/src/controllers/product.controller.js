import productModel from "../models/product.model.js";
import { uploadFile } from "../services/storage.service.js";


export const createProduct = async (req, res) => {
    try {
        const { title, description, priceAmount, priceCurrency } = req.body;
        const seller = req.user;

        const images = await Promise.all(req.files.map(async (file) => {
            return await uploadFile({
                buffer: file.buffer,
                fileName: file.originalname
            });
        }));

        const product = await productModel.create({
            title,
            description,
            price: {
                amount: priceAmount,
                currency: priceCurrency || "INR"
            },
            seller: seller._id,
            images
        });

        res.status(201).json({
            message: "Product created successfully",
            success: true,
            product
        });
    } catch (error) {
        console.error("[createProduct]", error);
        res.status(500).json({ message: "Failed to create product. Please try again." });
    }
};


export const getSellerProducts = async (req, res) => {
    try {
        const seller = req.user;
        const products = await productModel.find({ seller: seller._id });

        res.status(200).json({
            message: "Products fetched successfully",
            success: true,
            products
        });
    } catch (error) {
        console.error("[getSellerProducts]", error);
        res.status(500).json({ message: "Failed to fetch your products. Please try again." });
    }
};

export const getAllProducts = async (req, res) => {
    try {
        const products = await productModel.find();

        return res.status(200).json({
            message: "Products fetched successfully.",
            success: true,
            products
        });
    } catch (error) {
        console.error("[getAllProducts]", error);
        res.status(500).json({ message: "Failed to fetch products. Please try again." });
    }
};

export const getProductDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await productModel.findById(id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found.",
                success: false
            });
        }

        return res.status(200).json({
            message: "Product fetched successfully.",
            success: true,
            product
        });
    } catch (error) {
        console.error("[getProductDetails]", error);
        res.status(500).json({ message: "Failed to fetch product details. Please try again." });
    }
};

export const addProductVariant = async (req, res) => {
    try {
        const productId = req.params.productId;

        const product = await productModel.findOne({
            _id: productId,
            seller: req.user._id
        });

        if (!product) {
            return res.status(404).json({
                message: "Product not found.",
                success: false
            });
        }

        const files = req.files;
        const images = [];
        if (files && files.length !== 0) {
            (await Promise.all(files.map(async (file) => {
                return await uploadFile({
                    buffer: file.buffer,
                    fileName: file.originalname
                });
            }))).forEach(image => images.push(image));
        }

        const price = req.body.priceAmount;
        const stock = req.body.stock;
        const attributes = JSON.parse(req.body.attributes || "{}");

        product.variants.push({
            images,
            price: {
                amount: price || product.price.amount,
                currency: req.body.priceCurrency || product.price.currency
            },
            stock,
            attributes
        });

        await product.save();

        return res.status(200).json({
            message: "Product variant added successfully.",
            success: true,
            product
        });
    } catch (error) {
        console.error("[addProductVariant]", error);
        res.status(500).json({ message: "Failed to add product variant. Please try again." });
    }
};


export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await productModel.findByIdAndDelete(id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found.",
                success: false
            });
        }

        return res.status(200).json({
            message: "Product deleted successfully.",
            success: true
        });
    } catch (error) {
        console.error("[deleteProduct]", error);
        res.status(500).json({ message: "Failed to delete product. Please try again." });
    }
};

export const deleteProductVariant = async (req, res) => {
    try {
        const { productId, variantId } = req.params;

        const product = await productModel.findOne({
            _id: productId,
            seller: req.user._id
        });

        if (!product) {
            return res.status(404).json({
                message: "Product not found.",
                success: false
            });
        }

        const variant = product.variants.id(variantId);
        if (!variant) {
            return res.status(404).json({
                message: "Product variant not found.",
                success: false
            });
        }

        product.variants.pull(variantId);
        await product.save();

        return res.status(200).json({
            message: "Product variant deleted successfully.",
            success: true
        });
    } catch (error) {
        console.error("[deleteProductVariant]", error);
        res.status(500).json({ message: "Failed to delete product variant. Please try again." });
    }
};


export const updateProductVariant = async (req, res) => {
    try {
        const { productId, variantId } = req.params;

        const product = await productModel.findOne({
            _id: productId,
            seller: req.user._id
        });

        if (!product) {
            return res.status(404).json({
                message: "Product not found.",
                success: false
            });
        }

        const variant = product.variants.id(variantId);
        if (!variant) {
            return res.status(404).json({
                message: "Product variant not found.",
                success: false
            });
        }

        // Upload new images if provided
        const files = req.files;
        const images = [];
        if (files?.length) {
            const uploadedImages = await Promise.all(
                files.map(async (file) => {
                    return await uploadFile({
                        buffer: file.buffer,
                        fileName: file.originalname
                    });
                })
            );
            images.push(...uploadedImages);
        }

        const priceAmount   = req.body.priceAmount;
        const priceCurrency = req.body.priceCurrency;
        const stock         = req.body.stock;
        const attributes    = req.body.attributes ? JSON.parse(req.body.attributes) : null;

        if (images.length > 0) variant.images = images;

        variant.price = {
            amount:   priceAmount   ?? variant.price.amount,
            currency: priceCurrency ?? variant.price.currency
        };
        variant.stock = stock ?? variant.stock;
        if (attributes) variant.attributes = attributes;

        await product.save();

        return res.status(200).json({
            message: "Product variant updated successfully.",
            success: true,
            product
        });
    } catch (error) {
        console.error("[updateProductVariant]", error);
        res.status(500).json({ message: "Failed to update product variant. Please try again." });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, priceAmount, priceCurrency } = req.body;

        const product = await productModel.findByIdAndUpdate(
            id,
            {
                title,
                description,
                price: {
                    amount: priceAmount,
                    currency: priceCurrency
                }
            },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({
                message: "Product not found.",
                success: false
            });
        }

        return res.status(200).json({
            message: "Product updated successfully.",
            success: true,
            product
        });
    } catch (error) {
        console.error("[updateProduct]", error);
        res.status(500).json({ message: "Failed to update product. Please try again." });
    }
};

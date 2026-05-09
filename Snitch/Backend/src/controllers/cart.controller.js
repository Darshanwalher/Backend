import cartModel from "../models/cart.model.js";
import productModel from "../models/product.model.js";
import { stockOfVariant } from "../dao/product.dao.js";
import mongoose from "mongoose";


export const addToCart = async(req, res) => {

    const { productId, variantId } = req.params;
    const { quantity = 1 } = req.body;

    const product = await productModel.findOne({
        _id: productId,
        "variants._id": variantId
    })


    if(!product){
        return res.status(404).json({
            message: "Product not found",
            success: false
        })
    }

    const stock = await stockOfVariant(productId, variantId);

    const cart = (await cartModel.findOne({ user: req.user._id })) || ( await cartModel({ user: req.user._id }));
   
    const isProductAlreadyInCart = cart.items.some(item => item.product.toString() === productId && item.variant?.toString() === variantId);
    
    if(isProductAlreadyInCart){
        const quantityInCart = cart.items.find(item => item.product.toString() === productId && item.variant?.toString() === variantId).quantity;

        if(quantityInCart + quantity > stock){
            return res.status(400).json({
                 message: `Only ${stock} items left in stock. and you already have ${quantityInCart} items in your cart`,
                success: false
            })
        }

        await cartModel.findOneAndUpdate({
            user: req.user._id,
            "items.product": productId,
            "items.variant": variantId
        }, {
            $inc: {
                "items.$.quantity": quantity
            }
        },
            { new: true }
        )

        return res.status(200).json({
            message: "Cart updated successfully.",
            success: true
        })

    }

    if(quantity > stock){
        return res.status(400).json({
            message: `Only ${stock} items left in stock.`,
            success: false
        })
    }

    cart.items.push({
        product: productId,
        variant: variantId,
        quantity,
        price:product.price
    })

    await cart.save()

    return res.status(200).json({
        message: "Item added to cart successfully.",
        success: true
    })

}

export const getCart = async(req,res)=>{
    const user = req.user;

    let cart = (await cartModel.aggregate([
    {
        $match: {
            user: new mongoose.Types.ObjectId(user._id)
        }
    },
    { 
        $unwind: { path: '$items' } 
    },
    {
        $lookup: {
            from: 'products',
            localField: 'items.product',
            foreignField: '_id',
            as: 'items.product'
        }
    },
    { 
        $unwind: { path: '$items.product' } 
    },
    {
        $unwind: { path: '$items.product.variants' }
    },
    {
        $match: {
            $expr: {
                $eq: [
                    '$items.variant',
                    '$items.product.variants._id'
                ]
            }
        }
    },
    {
        $addFields: {
            itemPrice: {
                price: {
                    $multiply: [
                        '$items.quantity',
                        '$items.product.variants.price.amount'
                    ]
                },
                currency:
                    '$items.product.variants.price.currency'
            }
        }
    },
    {
        $group: {
            _id: '$_id',
            totalPrice: { $sum: '$itemPrice.price' },
            currency: {
                $first: '$itemPrice.currency'
            },
            items: { $push: '$items' }
        }
    }
]))[0];

    if(!cart){
        cart = await cartModel.create({
            user:user._id,
        })
    }

    return res.status(200).json({
        message:"Cart fetched successfully",
        success:true,
        cart
    })


}

export const incrementCartItemQuantity = async(req,res)=>{
    const { productId, variantId } = req.params;

    const product = await productModel.findOne({
        _id: productId,
        "variants._id": variantId
    });

    if (!product) {
        return res.status(404).json({
            message: "Product not found.",
            success: false
        });
    }

    const cart = await cartModel.findOne({ user: req.user._id });

    if (!cart) {
        return res.status(404).json({
            message: "Cart not found.",
            success: false
        });
    }

    const stock = await stockOfVariant(productId, variantId);

    const itemQuantityInCart = cart.items.find(item => item.product.toString() === productId && item.variant?.toString() === variantId)?.quantity || 0;

    if (itemQuantityInCart + 1 > stock) {
        return res.status(400).json({
            message: `Only ${stock} items left in stock. and you already have ${itemQuantityInCart} items in your cart`,
            success: false
        });
    }

    await cartModel.findOneAndUpdate({
        user: req.user._id,
        "items.product": productId,
        "items.variant": variantId
    }, {
        $inc: {
            "items.$.quantity": 1
        }
    }, {
        new: true
    });

    return res.status(200).json({
        message: "Cart item quantity incremented successfully.",
        success: true
    });

}

export const decrementCartItemQuantity = async(req,res)=>{
    const { productId, variantId } = req.params;

    const product = await productModel.findOne({
        _id: productId,
        "variants._id": variantId
    });

    if (!product) {
        return res.status(404).json({
            message: "Product not found.",
            success: false
        });
    }

    const cart = await cartModel.findOne({ user: req.user._id });

    if (!cart) {
        return res.status(404).json({
            message: "Cart not found.",
            success: false
        });
    }

    const stock = await stockOfVariant(productId, variantId);

    const itemQuantityInCart = cart.items.find(item => item.product.toString() === productId && item.variant?.toString() === variantId)?.quantity || 0;

    if (itemQuantityInCart - 1 < 1) {
        return res.status(400).json({
            message: `Cannot decrease quantity below 1. Current quantity: ${itemQuantityInCart}.`,
            success: false
        });
    }

    await cartModel.findOneAndUpdate({
        user: req.user._id,
        "items.product": productId,
        "items.variant": variantId
    }, {
        $inc: {
            "items.$.quantity": -1
        }
    }, {
        new: true
    });

    return res.status(200).json({
        message: "Cart item quantity decremented successfully.",
        success: true
    });

}


export const removeItemFromCart = async (req, res) => {
    try {

        const { productId, variantId } = req.params;

        // Check if product and variant exist
        const product = await productModel.findOne({
            _id: productId,
            "variants._id": variantId
        });

        if (!product) {
            return res.status(404).json({
                message: "Product or variant not found.",
                success: false
            });
        }

        // Find user's cart
        const cart = await cartModel.findOne({
            user: req.user._id
        });

        if (!cart) {
            return res.status(404).json({
                message: "Cart not found.",
                success: false
            });
        }

        // Check if item exists in cart
        const itemExists = cart.items.some(
            item =>
                item.product.toString() === productId &&
                item.variant?.toString() === variantId
        );

        if (!itemExists) {
            return res.status(404).json({
                message: "Item not found in cart.",
                success: false
            });
        }

        // Remove item from cart
        const updatedCart = await cartModel.findOneAndUpdate(
            {
                user: req.user._id
            },
            {
                $pull: {
                    items: {
                        product: new mongoose.Types.ObjectId(productId),
                        variant: new mongoose.Types.ObjectId(variantId)
                    }
                }
            },
            {
                new: true
            }
        );

        return res.status(200).json({
            message: "Item removed from cart successfully.",
            success: true,
            cart: updatedCart
        });

    } catch (error) {

        console.error("Remove Cart Item Error:", error);

        return res.status(500).json({
            message: "Internal server error.",
            success: false
        });

    }
};





  
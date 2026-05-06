import {Router} from "express";
import {authtenticateUser} from "../middleware/auth.middleware.js";
import { validateAddToCart,validateIncrementCartItemQuantity } from "../validator/cart.validator.js";
import { addToCart,getCart, incrementCartItemQuantity } from "../controllers/cart.controller.js";

const cartRouter = Router();



/**
 * @route POST /api/cart/add/:productId/:variantId
 * @desc Add item to cart
 * @access Private
 * @argument productId - ID of the product to add
 * @argument variantId - ID of the variant to add
 * @argument quantity - Quantity of the item to add (optional, default: 1)
 */
cartRouter.post("/add/:productId/:variantId",authtenticateUser, validateAddToCart,addToCart);


/**
 * @route GET /api/cart
 * @desc Get user's cart
 * @access Private
 */
cartRouter.get("/",authtenticateUser,getCart)


/**
 * @route PATCH /api/cart/quantity/increment/:productId/:variantId
 * @desc Increment item quantity in cart by one
 * @access Private
 * @argument productId - ID of the product to update
 * @argument variantId - ID of the variant to update
 */
cartRouter.patch("/quantity/increment/:productId/:variantId",authtenticateUser,validateIncrementCartItemQuantity,incrementCartItemQuantity);


export default cartRouter;
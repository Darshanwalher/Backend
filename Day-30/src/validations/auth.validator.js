import {body,validationResult} from "express-validator"


const validate = (req,res,next)=>{
        const errors = validationResult(req);

        if(errors.isEmpty()){
            return next();
        }

        res.status(400).json({
            errors:errors.array()
        })
    }


export const registerValidator = [
    body("username").isString().withMessage("username must be string"),
    body("email").isEmail().withMessage("email must be valid"),
    body("password").isLength({min:6}).withMessage("password must be at least 6 characters"),
    validate

]

export default registerValidator;
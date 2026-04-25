import { body, validationResult} from "express-validator";

function validateRequest(req,res,next){
    const errors = validateRequest(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }
    next();
}

export const validateRegisterUser = [
    body("email")
    .isEmail().withMessage("Please provide a valid email"),

    body("contact")
    .matches(/^\d{10}$/)
    .withMessage("Please provide a valid contact number and it should be 10 digits long"),

    body("password")
    .isLength({min:6}).withMessage("Password should be at least 6 characters long"),

    body("fullName")
    .notEmpty().withMessage("Full name is required")
    .isLength({min:3}).withMessage("Full name should be at least 3 characters long"),


    validateRequest
]
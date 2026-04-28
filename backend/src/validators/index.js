import { body } from "express-validator"

const userRegisterValidator = () => {
    return [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Email is Invalid"),

        body("username")
            .trim()
            .notEmpty()
            .withMessage("Username is required")
            .isLowerCase()
            .withMessage("Username must be in lower case")
            .isLength({ min: 6 })
            .withMessage("Username must be at least 6 characters"),

        body("password")
            .trim()
            .notEmpty()
            .withMessage("Password is required"),

        body("fullname")
            .optional()
            .trim(),


    ]
}



export {
    userRegisterValidator
}
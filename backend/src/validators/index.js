import { body } from "express-validator";

const userRegisterValidator = () => {
    return [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .bail()
            .isEmail()
            .withMessage("Email is invalid"),

        body("username")
            .trim()
            .notEmpty()
            .withMessage("Username is required")
            .bail()
            .isLength({ min: 6 })
            .withMessage("Username must be at least 6 characters")
            .matches(/^[a-z0-9_]+$/)
            .withMessage(
                "Username can only contain lowercase letters, numbers, and underscores",
            ),

        body("password")
            .trim()
            .notEmpty()
            .withMessage("Password is required")
            .bail()
            .isLength({ min: 6 })
            .withMessage("Password must be at least 6 characters"),

        body("fullName").trim().notEmpty().withMessage("Full name is required"),
    ];
};

const userLoginValidator = () => {
    return [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .bail()
            .isEmail()
            .withMessage("Email is invalid"),

        body("password")
            .trim()
            .notEmpty()
            .withMessage("Password is required")
            .bail()
            .isLength({ min: 6 })
            .withMessage("Password must be at least 6 characters"),
    ];
};


const userChangeCurrentPasswordValidator = () => {
    return [
        body("oldPassword")
            .trim()
            .notEmpty()
            .withMessage("Old Password is required")
            .bail()
            .isLength({ min: 6 })
            .withMessage("Password must be at least 6 characters"),

        body("newPassword")
            .trim()
            .notEmpty()
            .withMessage("New Password is required")
            .bail()
            .isLength({ min: 6 })
            .withMessage("Password must be at least 6 characters"),
    ];
};

const userforgotPasswordValidator = () => {
    return [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .bail()
            .isEmail()
            .withMessage("Email is Invalid"),
    ];
};


const userResetForgotPasswordValidator = () => {
    return [
        body("newPassword")
            .trim()
            .notEmpty()
            .withMessage("New Password is required")
            .bail()
            .isLength({ min: 6 })
            .withMessage("Password must be at least 6 characters"),

        body("confirmPassword")
            .trim()
            .notEmpty()
            .withMessage("Confirm Password is required")
            .bail()
            .isLength({ min: 6 })
            .withMessage("Password must be at least 6 characters"),
    ]
}

export {
    userRegisterValidator,
    userLoginValidator,
    userChangeCurrentPasswordValidator,
    userforgotPasswordValidator,
    userResetForgotPasswordValidator
};

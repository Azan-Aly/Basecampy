import { Router } from "express";
import {
    changeCurrentPassword,
    forgotPassword,
    getCurrentUser,
    loginUser,
    logoutUser,
    registerUser,
    resendEmailVerification,
    resetPassword,
    verifyEmail,
} from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validator.middleware.js";
import {
    userChangeCurrentPasswordValidator,
    userforgotPasswordValidator,
    userLoginValidator,
    userRegisterValidator,
    userResetForgotPasswordValidator,
} from "../validators/index.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(userRegisterValidator(), validate, registerUser);
router.route("/login").post(userLoginValidator(), validate, loginUser);

// secure route
router.route("/logout").post(verifyJWT, logoutUser);

router.route("/current-user").get(verifyJWT, getCurrentUser);

router.route("/resend-email-verification").post(resendEmailVerification);
// verify email
router.route("/verify-email/:verificationToken").get(verifyEmail);
// change Password
router.route("/change-current-password").post(verifyJWT, userChangeCurrentPasswordValidator(), validate, changeCurrentPassword)
// forgot & reset password
router.route("/forgot-password").post(verifyJWT, userforgotPasswordValidator(), validate, forgotPassword)
router.route("/reset-password").post(verifyJWT, userResetForgotPasswordValidator(), validate, resetPassword)


export default router;

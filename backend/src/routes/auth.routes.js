import { Router } from "express";
import { getCurrentUser, loginUser, logoutUser, registerUser, resendEmailVerification, verifyEmail } from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validator.middleware.js";
import { userLoginValidator, userRegisterValidator } from "../validators/index.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(userRegisterValidator(), validate, registerUser);
router.route("/login").post(userLoginValidator(), validate, loginUser);

// secure route
router.route("/logout").post(verifyJWT, logoutUser)

router.route("/current-user").get(verifyJWT, getCurrentUser)

router.route("/resend-email-verification").post(resendEmailVerification)
// verify email
router.route("/verify-email/:verificationToken").get(verifyEmail)

export default router;

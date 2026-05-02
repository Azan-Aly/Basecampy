import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { emailVerificationMailgenContent, forgotPasswordMailgenContent, sendEmail } from "../utils/mail.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            "something went wrong while generating access token",
        );
    }
};

const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password, fullName } = req.body;

    const existingUser = await User.findOne({
        $or: [{ email }, { username }],
    });

    if (existingUser) {
        throw new ApiError(
            409,
            "user with email or username already exists",
            [],
        );
    }

    const user = await User.create({
        email,
        password,
        username,
        fullName,
        isEmailVerified: false,
    });

    const { unHashedToken, hashedToken, tokenExpiry } =
        user.generateTemporaryToken();

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;

    await user.save({ validateBeforeSave: false });

    await sendEmail({
        email: user?.email,
        subject: "Please verify your email",
        mailgenContent: emailVerificationMailgenContent(
            user.username,
            `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`,
        ),
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
    );
    if (!createdUser) {
        throw new ApiError(
            500,
            "something went wrong while registering the user",
        );
    }

    return res
        .status(201)
        .json(
            new ApiResponse(
                200,
                { user: createdUser },
                "User registered successfully and verification email has been sent on your email",
            ),
        );
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email && !password) {
        throw new ApiError(400, "All credentials are required");
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(400, "user does not exist");
    }

    const isPasswordValid = user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(400, "Invalid credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
        user._id,
    );

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
    );
    if (!loggedInUser) {
        throw new ApiError(500, "something went wrong while login the user");
    }

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { user: loggedInUser, accessToken, refreshToken },
                "User logged in successfully",
            ),
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    // const {user} = req.user

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: "",
            },
        },
        {
            new: true,
        },
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
    );

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { user }, "User fetched successfully"));
});

const verifyEmail = asyncHandler(async (req, res) => {
    const { verificationToken } = req.params;

    if (!verificationToken) {
        throw new ApiError(400, "Email verification token is missing.");
    }

    let hashedToken = crypto
        .createHash("sha256")
        .update(verificationToken)
        .digest("hex");

    const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpiry: { $gt: Date.now() },
    });

    if (!user) {
        throw new ApiError(
            400,
            "Email verification token is invalid or has expired.",
        );
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;

    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { isEmailVerified: true },
                "Email verified successfully",
            ),
        );
});

const resendEmailVerification = asyncHandler(async (req, res) => {
    const user = await User.findById(req?.user_id);
    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    if (user.isEmailVerified) {
        throw new ApiError(409, "Email is already verified");
    }

    const { unHashedToken, hashedToken, tokenExpiry } =
        user.generateTemporaryToken();

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;

    await user.save({ validateBeforeSave: false });

    await sendEmail({
        email: user?.email,
        subject: "Please verify your email",
        mailgenContent: emailVerificationMailgenContent(
            user.username,
            `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`,
        ),
    });

    return res
        .status(200)
        .json(new ApiError(200, {}, "Email has been sent again"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
        req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized access");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET,
        );

        const user = await User.findById(decodedToken?._id);
        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        if (incomingRefreshToken !== user.refreshToken) {
            throw new ApiError(401, "refresh token is expired");
        }

        const { accessToken, refreshToken: newRefreshToken } =
            await generateAccessAndRefreshTokens(user._id);

        const options = {
            httpOnly: true,
            secure: true,
        };

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access Token is refresh or regenerated",
                ),
            );
    } catch (error) {
        console.log(error);
        throw new ApiError(401, "Invalid refresh token");
    }
});

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

    const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();

    user.forgotPasswordToken = hashedToken;
    user.forgotPasswordExpiry = tokenExpiry;

    await user.save({ validateBeforeSave: false })

    await sendEmail({
        email: user?.email,
        subject: "Password Reset request",
        mailgenContent: forgotPasswordMailgenContent(
            user.username,
            `${process.env.FORGOT_PASSWORD_REDIRECT_URL}/${unHashedToken}`
        )
    })

    return res.status(200)
        .json(
            new ApiResponse(200, {}, "Reset password mail has been sent")
        )

})

const resetPassword = asyncHandler(async (req, res) => {
    const { resetToken } = req.params;
    const { newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
        throw new ApiError(400, "Password must remains same in both fields")
    }

    let hashedToken = crypto.createHash("sha256")
        .update(resetToken)
        .digest("hex")

    const user = await User.findOne({
        forgotPasswordToken: hashedToken,
        forgotPasswordExpiry: { $gt: Date.now() }
    })

    if (!user) {
        throw new ApiError(489, "Token is invalid or expired");
    }

    user.forgotPasswordExpiry = undefined;
    user.forgotPasswordToken = undefined;

    user.password = newPassword

    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Password reset successfully")
        )
})



// const some = asyncHandler(async (req, res) => {

// })


// const some = asyncHandler(async (req, res) => {

// })

export {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    verifyEmail,
    resendEmailVerification,
};

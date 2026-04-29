import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { emailVerificationMailgenContent, sendEmail } from "../utils/mail.js";

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
            `${req.protocol}://${req.get('host')}/api/v1/users/verify-email/${unHashedToken}`,
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
        throw new ApiError(400, "All credentials are required")
    }
    
    const user = await User.findOne({ email });
    
    if (!user) {
        throw new ApiError(400, "user does not exist");
    }
    
    const isPasswordValid = user.isPasswordCorrect(password);
    
    if (!isPasswordValid) {
        throw new ApiError(400, "Invalid credentials");
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
    );
    if (!loggedInUser) {
        throw new ApiError(
            500,
            "something went wrong while login the user",
        );
    }

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken}, "User logged in successfully")
    )
})

export {
    registerUser,
    loginUser
};

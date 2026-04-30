import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const healthCheck = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, { message: "Server is running" }));
});

export { healthCheck };

// const healthCheck = async (req, res, next) => {
//     try {

//         res.status(200).json(
//             new ApiResponse(200, {message: "server is running"})
//         )
//     } catch (error) {
//         next(err)
//     }
// }

import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";
import { Admin } from "../models/admin.models.js";
import { Security } from "../models/security.models.js";

export const isLoggedIn = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            req.flash("error", "You need to first login or Signup");
            res.redirect("/api/v1/users/register");
            return;
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Check if the user exists in the User or Admin collection
        let user = await User.findById(decodedToken?._id).select("-password -refreshToken");
        if (!user) {
            user = await Admin.findById(decodedToken?._id).select("-password -refreshToken");
            if(!user){
                user = await Security.findById(decodedToken?._id).select("-password -refreshToken");
            } 
        }

        if (!user) {
            throw new ApiError(401, "Invalid access token");
        }

        req.user = user;
        res.locals.currUser = req.user || null;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});

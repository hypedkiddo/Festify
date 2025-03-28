import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Admin } from "../models/admin.models.js";

const generateAccessAndRefreshTokens = async (adminId) => {
  try {
    const admin = await Admin.findById(adminId);
    const accessToken = admin.generateAccessToken();
    const refreshToken = admin.generateRefreshToken();
    admin.refreshToken = refreshToken;
    await admin.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong in generating access and refresh token");
  }
};

// Show signup page for Admin
const showSignup = (req, res) => {
  res.render("admin/signup.ejs");
};

// --------------Register Admin-----------------
const registerAdmin = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  // Front-end validation
  if ([username, password].some((item) => item?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if admin already exists
  const existingAdmin = await Admin.findOne({ username });
  if (existingAdmin) {
    throw new ApiError(400, "Admin with the given username already exists");
  }

  // Create a new Admin
  const admin = await Admin.create({ username, password });

  const createdAdmin = await Admin.findById(admin._id).select("-password -refreshToken");

  // Check for successful admin creation
  if (!createdAdmin) {
    throw new ApiError(500, "Error while registering the admin");
  }

  req.flash("success", "Registration successful");
 
  res.redirect("/api/v1/events/list");

});

// Show login page for Admin
const showLogin = (req, res) => {
  res.render("admin/login.ejs");
};

//---------Login Admin--------
const loginAdmin = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username) {
    throw new ApiError(400, "Username is required");
  }

  const admin = await Admin.findOne({ username });

  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }

  // Verify password
  const isValidPassword = await admin.isPasswordCorrect(password);
  if (!isValidPassword) {
    req.flash("error", "Invalid password");
    res.render("admin/login.ejs");
  }

  // Generate Access and Refresh Tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(admin._id);
  const loggedInAdmin = await Admin.findById(admin._id).select("-password -refreshToken");

  const options = {
    httpOnly: true,
    secure: true,
  };

  req.flash("success", "Login successful");
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .redirect("/api/v1/events/list");
});

//-------Logout Admin-----------
const logoutAdmin = asyncHandler(async (req, res) => {
  await Admin.findByIdAndUpdate(
    req.admin._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .redirect("/api/v1/admin/login");
});

export { registerAdmin, loginAdmin, logoutAdmin, showSignup, showLogin };

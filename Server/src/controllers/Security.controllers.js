import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Security } from "../models/security.models.js";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const securityUser = await Security.findById(userId);
    const accessToken = securityUser.generateAccessToken();
    const refreshToken = securityUser.generateRefreshToken();
    securityUser.refreshToken = refreshToken;
    await securityUser.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong in generating access and refresh tokens");
  }
};

// Show signup page for Security User
const showSignup = (req, res) => {
  res.render("security/signup.ejs");
};

// --------------Register Security User-----------------
const registerSecurityUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  // Front-end validation
  if ([username, password].some((item) => item?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if security user already exists
  const existingSecurityUser = await Security.findOne({ username });
  if (existingSecurityUser) {
    throw new ApiError(400, "User with the given username already exists");
  }

  // Create a new Security User
  const securityUser = await Security.create({ username, password });

  const createdSecurityUser = await Security.findById(securityUser._id).select("-password -refreshToken");

  // Check for successful user creation
  if (!createdSecurityUser) {
    throw new ApiError(500, "Error while registering the security user");
  }

  req.flash("success", "Registration successful");
  res.redirect("/api/v1/events/list");
});

// Show login page for Security User
const showLogin = (req, res) => {
  res.render("security/login.ejs");
};

//---------Login Security User--------
const loginSecurityUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username) {
    throw new ApiError(400, "Username is required");
  }

  const securityUser = await Security.findOne({ username });

  if (!securityUser) {
    throw new ApiError(404, "User not found");
  }

  // Verify password
  const isValidPassword = await securityUser.isPasswordCorrect(password);
  if (!isValidPassword) {
    req.flash("error", "Invalid password");
    res.render("security/login.ejs");
    return;
  }

  // Generate Access and Refresh Tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(securityUser._id);
  const loggedInSecurityUser = await Security.findById(securityUser._id).select("-password -refreshToken");

  const options = {
    httpOnly: true,
    secure: true,
  };

  // req.flash("success", "Login successful");
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .render("scanner.ejs");
});

//-------Logout Security User-----------
const logoutSecurityUser = asyncHandler(async (req, res) => {
  await Security.findByIdAndUpdate(
    req.user._id,
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
    .redirect("/api/v1/security/login");
});

export { registerSecurityUser, loginSecurityUser, logoutSecurityUser, showSignup, showLogin };

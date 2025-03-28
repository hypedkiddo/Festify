import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {User} from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const generateAccessAndRefreshTokens=async(userId)=>{
    try {
        const user=await User.findById(userId)
        const accessToken=user.generateAccessToken();
        const refreshToken=user.generateRefreshToken();
        user.refreshToken=refreshToken;
        await user.save({validateBeforeSave:false})
        return {accessToken,refreshToken}
    } catch (error) {
        throw new ApiError(500,"Something went wrong in generating access and refresh token")
    }
}
const showsignup=(req,res)=>{
    res.render("users/signup.ejs");
};
// --------------Register user-----------------
// const registeruser = asyncHandler(async (req, res,next) => {
//     const { username, password, email, college } = req.body;
  
//     // Front-end validation
//     if ([username, password, email, college].some((item) => item?.trim() == "")) {
//       throw new ApiError(400, "All fields are required");
//     }
  
//     // Check if user already exists
//     const existeduser = await User.findOne({
//       $or: [{ username }, { email }],
//     });
//     if (existeduser) {
//       req.flash("error", "User with given username or email already exists");
//       return res.redirect("/api/v1/users/register");
//     }
    
//     const photoLocalPath = req.files?.image?.[0]?.path; // multer injects this path
//     if (!photoLocalPath) {
//       throw new ApiError(400, "User Photo is required");
//     }

//     // Save user details temporarily in session (without storing in DB)
//     req.session.tempUser = { username, password, email, college, image: photoLocalPath };
  
//     // Generate OTP and send to the user's email
//     next(); // Pass control to the `generateOtp` middleware
//   });

//   const completeRegistration = asyncHandler(async (req, res) => {
//     const tempUser = req.session?.tempUser;
  
//     if (!tempUser) {
//       req.flash("error", "Session expired. Please try again.");
//       console.log("Temp user not found in session. Redirecting to register.");
//       return res.redirect("/api/v1/users/register");
//     }
  
//     console.log("Temp user data:", tempUser);
  
//     const { username, password, email, college, image } = tempUser;
  
//     // Upload photo to Cloudinary
//     const uploadedImage = await uploadOnCloudinary(image);
//     console.log("Uploaded image URL:", uploadedImage.url);
  
//     // Create a user object and save it in the database
//     const user = await User.create({
//       username,
//       password,
//       image: uploadedImage.url,
//       email,
//       college,
//     });
  
//     console.log("User created:", user);
  
//     const createdUser = await User.findById(user._id).select(
//       "-password -refreshToken"
//     );
  
//     // Check for user creation
//     if (!createdUser) {
//       throw new ApiError(500, "Error while Registering the user");
//     }
  
//     // Clear temporary session data
//     delete req.session.tempUser;
//     console.log("Temp user data cleared from session.");
  
//     req.flash("success", "Registration Successful");
//     res.redirect("/api/v1/users/login");
//   });
  
    

const registeruser=asyncHandler(async(req,res)=>{
    
    const {username,password,email,college}=req.body;
    //front-end validation
    if([username,password,email,college].some((item)=>item?.trim()=="")){
        throw ApiError(400,"All fields are required");
    }
    //check if user already exists
    const existeduser= await User.findOne({
        $or:[{username},{email}]
    })
    if(existeduser){
        req.flash("error","User with given  username or email already exists");
        res.redirect("/api/v1/users/register");
    }
    //Check for user Photo
    console.log(req.files)
    const photoLocalPath=req.files?.image[0]?.path;//multer will inject this path
    if(!photoLocalPath){
        throw ApiError(400,"User Photo is required");
    }
    //Upload on Cloudinary
    const image=await uploadOnCloudinary(photoLocalPath);
    console.log(image);
    //Create a user object and save it in database
    const user= await User.create({
        username,
        password,
        image:image.url,
        email,
        college,
    })

    const createduser=await User.findById(user._id).select(
        "-password -refreshToken"
    )

    //check for user creation
    if(!createduser){
        throw ApiError(500,"Error while Registering the user");
    }
    req.flash("success","Registration Successfull");
    res.redirect("/api/v1/users/login");
    //return response
    // return res.status(200).json(
    //     new ApiResponse(200,createduser,"User registered successfully")
    // )
})



const showLogin=(req,res)=>{
    res.render("users/login.ejs");
};
//---------Login user--------
const loginUser=asyncHandler(async(req,res)=>{
    const{email,username,password}=req.body;

    if(!(username || email)){
        throw new ApiError(400,"Username or email required")
    }

    const user=await User.findOne({
        $or:[{email},{username}]
    })

    if(!user){
        req.flash("error","User not exist!!");
        return res.redirect("/api/v1/users/register");
    }
    console.log(user);
    //if user found then check the validity of password
    const isvalidpassword=await user.isPasswordCorrect(password);
    console.log(isvalidpassword);
    if(!isvalidpassword){
        req.flash("error","Password Incorrect");
        res.redirect("/api/v1/users/login");
    }
    //If everything is correct generate Access and refresh token
    const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(user._id)
    const loggedInUser=await User.findById(user._id).select("-password -refreshToken");

    //Setting these options makes cookie modifyable only through server side
   const options={
    httpOnly:true,
    secure:true
    }
    // req.flash("success","Login Successfull");
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .redirect("/api/v1/events/list");
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
       new ApiResponse(
          200,{
             user:loggedInUser,accessToken,refreshToken
          },
          "User logged in successfully"
       )
    )
})
//-------Logout user-----------
const logoutUser=asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true
        }
    )
    const options={
        httpOnly:true,
        secure:true
     }
     
     return res
     .status(200)
     .clearCookie("accessToken",options)
     .clearCookie("refreshToken",options)
     .redirect("/api/v1/users/login");
    //  return res
    //  .status(200)
    //  .clearCookie("accessToken",options)
    //  .clearCookie("refreshToken",options)
    //  .json(new ApiResponse(200,{},"User logged out"))
})
//End point to refresh access
const refreshAccessToken=asyncHandler(async(req,res)=>{
    const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken
 
    if(!incomingRefreshToken){
       throw new ApiError(401,"Unauthorised access");
    }
 
   const decodedToken= jwt.verify(
       incomingRefreshToken,
       process.env.REFRESH_TOKEN_SECRET
    )
 
    const user=await User.findById(decodedToken?._id);
 
    if (!user) {
       throw new ApiError(401,"invalid refresh token ie malicious token received")
    }
 
    if (incomingRefreshToken !== user.refreshToken) {
       throw new ApiError(401,"refresh token is expired or used");
    }
 
    const options={
       httpOnly:true,
       secure:true
    }
    const {accessToken,newrefreshToken}=await generateAccessAndRefreshTokens(user._id);
   
 
    // return res
    // .status(200)
    // .cookie("accessToken",accessToken,options)
    // .cookie("refreshToken",newrefreshToken,options)
    // .json(
    //    new ApiResponse(
    //       200,{
    //          accessToken,newrefreshToken
    //       },
    //       "Access token refreshed"
    //    )
    // )
 })

 const profilePage = asyncHandler(async (req, res) => {
    const { id } = req.params;
  
    const user = await User.findById(id);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
  
    res.render("users/profile.ejs", { user });
  });
  

export {registeruser,loginUser,logoutUser,refreshAccessToken,showsignup,showLogin,profilePage};


import { signotpStore } from './Signupotpgen.middleware.js'; 
import { asyncHandler } from '../utils/asyncHandler.js';  

const signupvalidateOtp = asyncHandler((req, res, next) => {
  const studentemail = req.session?.tempUser?.email; // Use email from session
  if (!studentemail) {
    req.flash("error", "Session expired. Please try again.");
    console.log("Session expired or tempUser not found.");
    return res.redirect("/api/v1/users/register");
  }

  const { otp } = req.body;
  console.log("Entered OTP:", otp);

  // Retrieve OTP from the store
  const storedOtp = signotpStore.get(studentemail);
  console.log("Stored OTP:", storedOtp?.otp, "Expires at:", storedOtp?.expiresAt);

  if (!storedOtp || storedOtp.expiresAt < Date.now()) {
    req.flash("error", "OTP has expired. Please request a new one.");
    console.log("OTP expired.");
    return res.redirect("/api/v1/users/register");
  }

  if (storedOtp.otp !== otp) {
    req.flash("error", "Invalid OTP. Please try again.");
    console.log("Invalid OTP.");
    return res.render("users/signupOtp.ejs"); // Add `return` here to stop further execution
  }

  console.log("OTP validated successfully. Proceeding to complete registration.");
  signotpStore.delete(studentemail); // Remove OTP after successful validation
  next(); // Proceed to complete registration
});


  
  export { signupvalidateOtp}
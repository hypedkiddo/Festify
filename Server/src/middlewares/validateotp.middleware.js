import { otpStore } from './genotp.middleware.js'; 
import { asyncHandler } from '../utils/asyncHandler.js';
const validateOtp = asyncHandler((req, res, next) => {
    const studentemail = req.user.email;
    const { otp } = req.body;
    // Retrieve OTP from store
    const storedOtp = otpStore.get(studentemail);
  
    if (!storedOtp || storedOtp.expiresAt < Date.now()) {
      req.flash('error', 'OTP has expired. Please request a new one.');
      return res.redirect('/api/v1/events/list');
    }
  
    if (storedOtp.otp !== otp) {
      req.flash('error', 'Invalid OTP. Please try again.');
      return res.redirect('/api/v1/events/list');
    }
  
    // OTP is valid, proceed to the next middleware/controller
    otpStore.delete(studentemail); // Remove OTP after successful validation
    next();
  });
  
  export { validateOtp };
  
import {Router} from  "express";
import { registeruser,loginUser,logoutUser,refreshAccessToken,showsignup,showLogin,profilePage} from "../controllers/user.controller.js";
import { registerStudent } from "../controllers/Register.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import {isLoggedIn} from "../middlewares/auth.middleware.js"
import { generateOtp } from "../middlewares/genotp.middleware.js";
import { validateOtp } from "../middlewares/validateotp.middleware.js";
import {updateQrVerified} from "../middlewares/verifyQr.middleware.js";
import { registerParticipant,verifyPayment} from '../controllers/paymentController.js'
import { signOtp } from "../middlewares/Signupotpgen.middleware.js";
import { signupvalidateOtp } from "../middlewares/Signupotpverify.middleware.js";
const router=Router();//Creating an instance or router
router.route("/register").get(showsignup); // Show signup form
router.route("/register").post(upload.fields([{ name: "image", maxCount: 1 }]), registeruser);


//render login page
router.route("/login").get(showLogin);
//trigger login controller
router.route("/login").post(loginUser);
//trigger logout controller
router.route("/logout").post(isLoggedIn,logoutUser);
router.route("/refreshtoken").post(refreshAccessToken);
//route to show profile page
router.route("/profile/:id").get(isLoggedIn,updateQrVerified,profilePage);
// Route to initiate Student registration
router.route('/registerStudent')
  .post(isLoggedIn, generateOtp, (req, res) => {
    // Render OTP input form
    res.render('users/otp.ejs');
  });

// Route to validate OTP and register
router.route('/verify-otp')
  .post(isLoggedIn, validateOtp, registerStudent);

// Route to initiate Participant registration via payment
router.route('/registerParticipant').post(isLoggedIn,registerParticipant);
router.route('/verifyPayment').post(isLoggedIn,verifyPayment);

export default router;
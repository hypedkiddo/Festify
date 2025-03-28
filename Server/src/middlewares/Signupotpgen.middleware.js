import otpGenerator from 'otp-generator';
import nodemailer from 'nodemailer';
import { asyncHandler } from '../utils/asyncHandler.js';

// Store OTPs temporarily in memory (use a better storage solution in production)
const signotpStore = new Map();

const signOtp = asyncHandler(async (req, res, next) => {
    const studentemail = req.body.email; // Use email from request body

    const otp = Math.floor(1000 + Math.random() * 9000);
  
    signotpStore.set(studentemail, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });
  
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  
    const mailOptions = {
      from: '"KLS GIT Admin" <naren.lakamannavar@gmail.com>',
      to: studentemail,
      subject: "Your OTP for Event Registration",
      html: `
        <h1>OTP for Event Registration</h1>
        <p>Your OTP is: <strong>${otp}</strong></p>
        <p>This OTP is valid for 5 minutes.</p>
      `,
    };
  
    await transporter.sendMail(mailOptions);
  
    console.log(`OTP sent to ${studentemail}: ${otp}`);
    res.render("users/signupOtp.ejs")
    // res.redirect("/api/v1/users/register/verifyotp"); // Redirect to OTP verification page
  });

  export {signOtp, signotpStore }
  
import otpGenerator from 'otp-generator';
import nodemailer from 'nodemailer';
import { asyncHandler } from '../utils/asyncHandler.js';

// Store OTPs temporarily in memory (use a better storage solution in production)
const otpStore = new Map();

const generateOtp = asyncHandler(async (req, res, next) => {
  const studentemail = req.user.email;

  // Generate a 6-digit numeric OTP
  const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false });

  // Store OTP in memory with expiration (5 minutes)
  otpStore.set(studentemail, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

  // Send OTP via email
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: '"KLS GIT Admin" <naren.lakamannavar@gmail.com>',
    to: studentemail,
    subject: 'Your OTP for Event Registration',
    html: `
      <h1>OTP for Event Registration</h1>
      <p>Your OTP is: <strong>${otp}</strong></p>
      <p>This OTP is valid for 5 minutes.</p>
    `,
  };

  await transporter.sendMail(mailOptions);

  console.log(`OTP sent to ${studentemail}: ${otp}`);
  next(); // Proceed to the next middleware
});

export { generateOtp, otpStore };

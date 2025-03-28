import fs from 'fs';  // To handle file operations
import path from 'path';  // To manage file paths
import QRCode from 'qrcode';  // Assuming you're using the `qrcode` package
import {User} from "../models/user.models.js"
import nodemailer from 'nodemailer';
import {asyncHandler} from '../utils/asyncHandler.js';
import{ApiError} from '../utils/ApiError.js';  // Assuming this is your custom error handler
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import {Student} from "../models/student.models.js"

const __filename = fileURLToPath(import.meta.url);  // Get the filename
const __dirname = dirname(__filename);  // Get the directory name


const registerStudent = asyncHandler(async (req, res) => {
  const studentemail = req.user.email;
  const student = await Student.findOne({ email: studentemail }); // Find the student in the DB
  const user = await User.findById(req.user._id);

  if (!student) {
    req.flash("error", "You are not a student of KLS GIT");
    return res.redirect("/api/v1/events/list");
  }

  // Check if the QR code is already generated
  if (user.qrGenerated) {
    req.flash("error", "QR code has already been generated for this student");
    return res.redirect("/api/v1/events/list");
  }

  // Generate the QR Code data (directly, without JSON.stringify)
  const qrData = `/api/v1/users/profile/${user._id}`;

  // Generate the QR code and store it as a file
  const qrCodeImagePath = path.join(
    __dirname,
    '../../public/temp',
    `${student.email}_qr.png`
  );
  await QRCode.toFile(qrCodeImagePath, qrData);

  // Send QR code via email
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: '"KLS GIT Admin" <naren.lakamannavar@gmail.com>',
    to: student.email,
    subject: 'Your Student QR Code',
    html: `
      <h1>Registration for AURA 2025 successful!</h1>
      <p>Hello ${student.username},</p>
      <p>Please find your Event pass attached:</p>
      <p>Keep this QR code safe. It contains your credentials. Do not disclose it to anyone.</p>
      <p>Carry your college ID card and this pass at the event entrance.</p>
    `,
    attachments: [
      {
        filename: `${student.email}_qr.png`,
        path: qrCodeImagePath,
      },
    ],
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Mail sent successfully");

    // Mark QR code as generated for the user
    user.qrGenerated = true;
    await user.save({validateBeforeSave:false});

    req.flash("success", "QR code sent to your college email id successfully");
    res.status(200).redirect("/api/v1/events/list");
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({
      message: 'Failed to send email. Please try again later.',
      error: error.message,
    });
  } finally {
    // Delete the temporary QR code file
    fs.unlink(qrCodeImagePath, (err) => {
      if (err) console.error('Error deleting temp QR code file:', err);
    });
  }
});





export {registerStudent};
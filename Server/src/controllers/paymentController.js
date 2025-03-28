import Razorpay from 'razorpay';
import { asyncHandler } from '../utils/asyncHandler.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';
import {User} from '../models/user.models.js'; 
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);  // Get the filename
const __dirname = dirname(__filename);  // Get the directory name
 

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const registerParticipant = asyncHandler(async (req, res) => {
  const user=req.user;
  const newuser=await User.findById(user._id);
  if(newuser.qrGenerated){
    req.flash("error","You have already registered for this event");
    return res.redirect("/api/v1/events/list");
  }
  const amount = 500 * 100; // ₹500 in paise
  const currency = 'INR';

  const options = {
    amount,
    currency,
    receipt: `receipt_${Date.now()}`,
  };

  try {
    const order = await razorpay.orders.create(options);

    // Render the Razorpay Checkout page with the order details
    res.status(200).render('users/checkout.ejs', {
      key: process.env.RAZORPAY_KEY_ID, // Razorpay Key ID
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating Razorpay order', error: error.message });
  }
});


const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

  const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
  hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const generated_signature = hmac.digest('hex');

  if (generated_signature !== razorpay_signature) {
    return res.status(400).json({ message: 'Payment verification failed' });
  }

  const userId = req.user._id; // Assuming the user is authenticated
  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Generate the QR Code data (directly, without JSON.stringify)
  const qrData = `/api/v1/users/profile/${user._id}`;

  const qrFilePath = path.join(__dirname, '../../public/temp', `${user.email}_qr.png`);
  await QRCode.toFile(qrFilePath, qrData);

  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: '"KLS GIT Admin" <naren.lakamannavar@gmail.com>',
    to: user.email,
    subject: 'Your Event Pass',
    html: `
      <h1>Registration Successful!</h1>
      <p>Hello ${user.username},</p>
      <p>Your QR code is attached. Please keep it safe and bring it to the event.</p>
    `,
    attachments: [
      {
        filename: `${user.email}_qr.png`,
        path: qrFilePath,
      },
    ],
  };

  try {
    await transporter.sendMail(mailOptions);

    user.qrGenerated = true;
    await user.save({validateBeforeSave:false});

    res.status(200).json({ message: 'Payment verified and QR code sent' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send email', error: error.message });
  } finally {
    fs.unlink(qrFilePath, (err) => {
      if (err) console.error('Error deleting temp QR code file:', err);
    });
  }
});


export { registerParticipant,verifyPayment };

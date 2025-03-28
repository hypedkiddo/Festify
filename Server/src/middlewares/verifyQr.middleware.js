import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from '../models/user.models.js';

const updateQrVerified = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Find the user by ID and set `qrVerified` to true
  const user = await User.findById(id);
  if (!user) {
    req.flash('error','User not found')
  }

  // Check if the QR code has already been verified
  if (user.qrVerified) {
    req.flash('error', `User ${user.username}'s QR code already verified.`);
    res.render("scanner.ejs");
  }else {
    user.qrVerified = true; // Mark as verified
    await user.save({validateBeforeSave:false});
    req.flash('success', ` ${user.username} marked as  verified.`);
  }

  next(); // Proceed to the profile page
});

export { updateQrVerified };

const User = require("../models/users");
const nodemailer = require("nodemailer");
const config = require("../config/constants.json");
const bcrypt = require("bcrypt");
const saltRounds = 12;

// Setup Nodemailer transport
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.mailer_username,
    pass: config.mailer_password,
  },
});

// Send OTP email to user
const sendOtpMail = async (email, otp) => {
  const mailOptions = {
    from: config.mailer_username,
    to: email,
    subject: "Your OTP code",
    text: `Your registration passcode is: ${otp}`,
  };

  return transporter.sendMail(mailOptions);
};

const resetPasswordEmail = async (email, otp) => {
  const mailOptions = {
    from: config.mailer_username,
    to: email,
    subject: "Your OTP for reset password",
    text: `Your reset password passcode is: ${otp}`,
  };

  return transporter.sendMail(mailOptions);
};

// Generate a random OTP
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

// update OTP
const updateOtp = async (email, otp) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found.");
  }

  user.otp = otp; // Clear the OTP after successful verification
  await user.save();
  return user;
};

// Verify OTP
const verifyOtp = async (email, otp) => {
  const user = await User.findOne({ email, otp });
  if (!user) {
    throw new Error("Invalid OTP or email.");
  }

  user.is_active = true;
  user.otp = null; // Clear the OTP after successful verification
  await user.save();
  return user;
};

// Register a new user
const registerUser = async (userParams) => {
  const { name, email, password } = userParams;

  // Find if the user already exists (active or inactive)
  const existingUser = await User.findOne({ email });

  // If user exists and is active, throw an error
  if (existingUser && existingUser.is_active) {
    throw new Error("User with this email already exists.");
  }

  // Generate a new OTP
  const otp = generateOtp();
  if (existingUser && !existingUser.is_active) {
    // If the user exists but is inactive, update the OTP
    await User.updateOne(
      { email },
      { $set: { otp } } // Update OTP, password remains unchanged
    );
    await sendOtpMail(email, otp);
    return { resendOtp: true }; // Indicates that OTP was resent
  }

  // If no existing user, create a new one
  const newUser = new User({
    name,
    email,
    password, // Hash the password on creation
    otp,
    is_active: false, // Account is inactive until OTP is verified
  });

  await newUser.save();
  await sendOtpMail(email, otp);

  return { resendOtp: false }; // Indicates new user was created and OTP sent
};

// Authenticate (login) user
const authenticateUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found.");
  }

  // Compare the provided password with the stored hashed password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid credentials.");
  }

  // Check if the user's account is active
  if (!user.is_active) {
    throw new Error("User is not active. Please verify your OTP.");
  }

  return user;
};

const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found.");
  }

  // Check if current password matches
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new Error("Current password is incorrect.");
  }

  // Hash new password and update
  user.password = newPassword;
  await user.save();
};

const findUserByEmail = async (email) => {
  return await User.findOne({ email });
};

// Reset password using OTP
const resetPassword = async (email, otp, newPassword) => {
  const user = await User.findOne({ email, otp });

  if (!user) {
    throw new Error("Invalid OTP or email.");
  }

  // Hash new password and update
  user.password = newPassword;
  user.otp = null; // Clear the OTP after successful password reset
  await user.save();
};

module.exports = {
  registerUser,
  verifyOtp,
  authenticateUser,
  changePassword,
  findUserByEmail,
  generateOtp,
  updateOtp,
  sendOtpMail,
  sendOtpMail,
  resetPassword,
  resetPasswordEmail
};

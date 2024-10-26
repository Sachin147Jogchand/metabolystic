// controllers/userController.js
const userService = require("../services/user.service");
const auth = require("../middlewares/authentication");

// Register new user
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Register user
    const user = await userService.registerUser({ name, email, password });
    return res
      .status(200)
      .json({ error: null, data: "OTP sent to email to verify." });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: error.message, data: null });
  }
};

// Verify OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    // Verify OTP
    const user = await userService.verifyOtp(email, otp);
    return res.status(200).json({
      error: null,
      data: "OTP verified successfully. Account activated.",
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: error.message, data: null });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Authenticate user
    const user = await userService.authenticateUser(email, password);
    const token = auth.generateJwtToken({ email: user.email, role: user.role });

    return res.status(200).json({
      error: null,
      data: { user: user, access_token: token },
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: error.message, data: null });
  }
};

// Change password for authenticated users
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.get("user_id"); // User's ID from the auth middleware
    // console.log(req.user_id, req)

    await userService.changePassword(userId, currentPassword, newPassword);
    return res
      .status(200)
      .json({ error: null, data: "Password changed successfully." });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: error.message, data: null });
  }
};

// Reset password (OTP-based)
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    await userService.resetPassword(email, otp, newPassword);
    return res
      .status(200)
      .json({ error: null, data: "Password reset successfully." });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: error.message, data: null });
  }
};

// Request Password Reset (Send OTP)
exports.requestResetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await userService.findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ error: "User not found.", data: null });
    }

    // Generate OTP and send email
    const otp = userService.generateOtp();
    await userService.updateOtp(user.email, otp);
    await userService.resetPasswordEmail(user.email, otp);

    return res
      .status(200)
      .json({ error: null, data: "OTP sent to your email to reset password." });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: error.message, data: null });
  }
};

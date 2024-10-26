// routes/userRoutes.js
const express = require("express");
const userController = require("../controllers/users.controller");
const router = express.Router();
const auth = require("../middlewares/authentication");

router.post("/register", userController.register);
router.post("/verify-otp", userController.verifyOtp);
router.post("/login", userController.login);

router.post(
  "/change-password",
  auth.verifyJwtToken,
  userController.changePassword
);
router.post("/request-reset-password", userController.requestResetPassword);
router.post("/reset-password", userController.resetPassword);

module.exports = router;

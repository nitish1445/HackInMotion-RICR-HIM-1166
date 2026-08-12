import crypto from "crypto";
import bcrypt from "bcrypt";
import User from "../models/userModel.js";
import OTP from "../models/otpModel.js";
import { sendOTPEmail } from "../utils/emailService.js";

export const UserGenOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      const error = new Error("Email is required");
      error.statusCode = 400;
      return next(error);
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check registered user
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (!existingUser) {
      const error = new Error("Email not registered");
      error.statusCode = 401;
      return next(error);
    }

    // Remove previous OTP
    await OTP.deleteOne({
      email: normalizedEmail,
    });

    // Generate exactly 6 digits
    const otp = crypto.randomInt(100000, 1000000).toString();

    console.log("OTP:", otp);

    // Hash OTP
    const salt = await bcrypt.genSalt(10);
    const hashOTP = await bcrypt.hash(otp, salt);

    // Save OTP
    await OTP.create({
      email: normalizedEmail,
      otp: hashOTP,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    // Send email
    await sendOTPEmail(normalizedEmail, otp);

    res.status(200).json({
      message: "OTP sent to your registered email",
    });
  } catch (error) {
    next(error);
  }
};

export const UserVerifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      const error = new Error("All fields are required");
      error.statusCode = 400;
      return next(error);
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find OTP
    const existingUserOTP = await OTP.findOne({
      email: normalizedEmail,
    });

    if (!existingUserOTP) {
      const error = new Error(
        "OTP expired or not found. Please request a new OTP.",
      );
      error.statusCode = 401;
      return next(error);
    }

    // Check expiration
    if (existingUserOTP.expiresAt < new Date()) {
      await existingUserOTP.deleteOne();

      const error = new Error("OTP expired. Please request a new OTP.");
      error.statusCode = 401;
      return next(error);
    }

    // Compare OTP
    const isVerified = await bcrypt.compare(otp, existingUserOTP.otp);

    if (!isVerified) {
      const error = new Error("Invalid OTP. Please try again.");
      error.statusCode = 401;
      return next(error);
    }

    // Delete OTP after successful verification
    await existingUserOTP.deleteOne();

    // Find user
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (!existingUser) {
      const error = new Error("Email not registered");
      error.statusCode = 401;
      return next(error);
    }

    // Generate password-reset token
    genOTPToken(existingUser, res);

    res.status(200).json({
      message: "OTP verified. You can now create a new password.",
    });
  } catch (error) {
    next(error);
  }
};

export const UserForgetPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;

    const currentUser = req.user;

    if (!newPassword) {
      const error = new Error("New password is required");
      error.statusCode = 400;
      return next(error);
    }

    if (newPassword.length < 6) {
      const error = new Error("Password must be at least 6 characters");
      error.statusCode = 400;
      return next(error);
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    currentUser.password = hashPassword;

    await currentUser.save();

    // Remove password-reset authorization
    res.clearCookie("otpToken");

    res.status(200).json({
      message: "Password reset successfully. Please login again.",
    });
  } catch (error) {
    next(error);
  }
};

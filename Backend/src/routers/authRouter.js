import express from "express";

import {
  UserLogin,
  UserRegister,
  UserLogout,
} from "../controllers/authController.js";
import {
  UserGenOTP,
  UserVerifyOtp,
  UserForgetPassword,
  UserChangePassword,
} from "../controllers/authPassowordController.js";
import { Protect, OtpProtect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/login", UserLogin);
router.post("/register", UserRegister);
router.get("/logout", UserLogout);
router.put("/change-password", Protect, UserChangePassword);

router.post("/genOtp", UserGenOTP);
router.post("/verifyOtp", UserVerifyOtp);
router.post("/forgetPassword", OtpProtect, UserForgetPassword);

export default router;

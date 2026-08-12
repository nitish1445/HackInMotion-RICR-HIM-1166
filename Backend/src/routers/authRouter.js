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
} from "../controllers/authPassowordController.js";
import { OtpProtect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/login", UserLogin);
router.post("/register", UserRegister);
router.get("/logout", UserLogout);

router.post("/genOtp", UserGenOTP);
router.post("/verifyOtp", UserVerifyOtp);
router.post("/forgetPassword", OtpProtect, UserForgetPassword);

export default router;

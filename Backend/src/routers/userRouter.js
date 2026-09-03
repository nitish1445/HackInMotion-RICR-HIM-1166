import express from "express";

import { upload } from "../config/cloudinary.js";
import { UserProfileUpdate } from "../controllers/userController.js";
import { Protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.put(
  "/profile",
  Protect,
  upload.single("profileImage"),
  UserProfileUpdate,
);

export default router;

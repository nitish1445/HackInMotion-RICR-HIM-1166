import express from "express";
import multer from "multer";

import {
  getTodayQuestion,
  analyzeRecording,
  getHistory,
  getStats,
  getOne,
} from "../controllers/practiceController.js";

import { uploadRecording } from "../config/cloudinary.js";
import { Protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

/*
 * Turns multer's own errors (file too large, unsupported
 * type from the fileFilter) into clean, friendly JSON
 * instead of falling through to the generic 500 handler.
 */
const handleUploadError = (err, req, res, next) => {
  if (!err) return next();

  if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      success: false,
      message: "Your recording is too large (max 25MB). Please record a shorter answer.",
    });
  }

  return res.status(err.statusCode || 400).json({
    success: false,
    message: err.message || "Invalid recording upload.",
  });
};

const uploadFields = uploadRecording.fields([
  { name: "audio", maxCount: 1 },
  { name: "video", maxCount: 1 },
]);

/*
|--------------------------------------------------------------------------
| Today's question
|--------------------------------------------------------------------------
*/

router.get(
  "/today",
  Protect,
  getTodayQuestion
);

/*
|--------------------------------------------------------------------------
| Analyze
|--------------------------------------------------------------------------
*/

router.post(
  "/analyze",
  Protect,
  uploadFields,
  handleUploadError,
  analyzeRecording
);

/*
|--------------------------------------------------------------------------
| History / Stats / Single result
|--------------------------------------------------------------------------
*/

router.get(
  "/history",
  Protect,
  getHistory
);

router.get(
  "/stats",
  Protect,
  getStats
);

router.get(
  "/:id",
  Protect,
  getOne
);

export default router;
import dotenv from "dotenv";
dotenv.config();

import multer from "multer";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      const error = new Error("Only image files are allowed.");
      error.statusCode = 400;
      return cb(error, false);
    }
    cb(null, true);
  },
});

/*
=========================================================
RECORDING UPLOAD (audio/video practice answers)

Separate multer instance from the profile-image `upload`
above — different allowed mimetypes and a larger size
limit, since a short speaking/video answer is much bigger
than a profile photo.
=========================================================
*/

const ALLOWED_RECORDING_MIME_TYPES = [
  "audio/webm",
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/ogg",
  "video/webm",
  "video/mp4",
  "video/ogg",
  // Some browsers report a MediaRecorder blob as a generic MIME type.
  "application/octet-stream",
  "text/plain",
];

const uploadRecording = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB — enough for a few minutes of compressed audio/video
  },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_RECORDING_MIME_TYPES.includes(file.mimetype)) {
      const error = new Error(
        `Unsupported file type "${file.mimetype}". Allowed: ${ALLOWED_RECORDING_MIME_TYPES.join(", ")}.`
      );
      error.statusCode = 400;
      return cb(error, false);
    }
    cb(null, true);
  },
});

export const uploadToCloudinary = async (file, folderName = "EduTech") => {
  if (!file || !file.buffer) {
    throw new Error("No file provided for upload.");
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: folderName,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(result);
      },
    );

    stream.end(file.buffer);
  });
};

export const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;
  return cloudinary.uploader.destroy(publicId);
};

/*
 * Uploads a recorded audio/video buffer. Cloudinary
 * treats audio under its "video" resource type (there is
 * no separate "audio" resource type), so this works for
 * both speaking and video-mode answers.
 */
export const uploadRecordingToCloudinary = async (
  file,
  folderName = "EduTech/practice-recordings"
) => {
  if (!file || !file.buffer) {
    throw new Error("No recording file provided for upload.");
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: folderName,
        resource_type: "video",
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(result);
      },
    );

    stream.end(file.buffer);
  });
};

console.log("Cloudinary Configured Successfully");

export { upload, uploadRecording };
export default cloudinary;
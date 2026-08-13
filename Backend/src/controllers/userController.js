import { uploadToCloudinary } from "../config/cloudinary.js";

export const UserProfileUpdate = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      return next(error);
    }

    // Profile image
    if (req.file) {
      const uploaded = await uploadToCloudinary(
        req.file,
        "EduTech/profileImages",
      );

      user.profileImage = {
        url: uploaded.secure_url || uploaded.url,
        public_id: uploaded.public_id,
      };
    }

    // Email intentionally NOT accepted
    const { fullName, mobileNumber, bio } = req.body;

    // Full name
    if (fullName !== undefined) {
      if (!fullName.trim()) {
        const error = new Error("Full name is required.");
        error.statusCode = 400;
        return next(error);
      }

      user.fullName = fullName.trim();
    }

    // Mobile number
    if (mobileNumber !== undefined) {
      const trimmedMobile = mobileNumber.trim();

      if (
        trimmedMobile &&
        !/^[6-9]\d{9}$/.test(trimmedMobile)
      ) {
        const error = new Error("Invalid mobile number.");
        error.statusCode = 400;
        return next(error);
      }

      user.mobileNumber = trimmedMobile;
    }

    // Bio
    if (bio !== undefined) {
      const trimmedBio = bio.trim();

      if (trimmedBio.length > 250) {
        const error = new Error(
          "Bio cannot exceed 250 characters."
        );
        error.statusCode = 400;
        return next(error);
      }

      user.bio = trimmedBio;
    }

    await user.save();

    // Never send password or __v to frontend
    const userData = user.toObject();

    delete userData.password;
    delete userData.__v;

    res.status(200).json({
      message: "Profile updated successfully",
      data: userData,
    });
  } catch (error) {
    next(error);
  }
};

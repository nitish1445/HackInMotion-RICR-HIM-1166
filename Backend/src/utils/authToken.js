import jwt from "jsonwebtoken";

export const genToken = (user, res) => {
  try {
    const payload = {
      id: user._id,
      role: user.role || "admin",
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // set isProduction to true in production environment
    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("EduTechToken", token, {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    });
  } catch (error) {
    throw error;
  }
};

export const genOTPToken = (user, res) => {
  try {
    const payload = {
      id: user._id,
      role: user.role,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "5m",
    });

    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("EduTechOtpToken", token, {
      maxAge: 1000 * 60 * 10,
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    });
  } catch (error) {
    throw error;
  }
};

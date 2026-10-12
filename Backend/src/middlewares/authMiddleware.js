import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const Protect = async (req, res, next) => {
  try {
    const token = req.cookies.EduTechToken;

    if (!token) {
      const error = new Error("Unauthorized! Please Login Again.");
      error.statusCode = 401;
      return next(error);
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decode);
    if (!decode) {
      const error = new Error("Unauthorized! Please Login Again.");
      error.statusCode = 401;
      return next(error);
    }

    const verifiedUser = await User.findById(decode.id);
    if (!verifiedUser) {
      const error = new Error("Unauthorized! Please Login Again.");
      error.statusCode = 401;
      return next(error);
    }
    req.user = verifiedUser;

    next();
  } catch (error) {
    next(error);
  }
};

export const OtpProtect = async (req, res, next) => {
  try {
    const token = req.cookies.EduTechOtpToken;

    if (!token) {
      const error = new Error("Unauthorized! Please try again.");
      error.statusCode = 401;
      return next(error);
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decode);
    if (!decode) {
      const error = new Error("Unauthorized! Please try again");
      error.statusCode = 401;
      return next(error);
    }

    const verifiedUser = await User.findById(decode.id);
    if (!verifiedUser) {
      const error = new Error("Unauthorized! Please try Again");
      error.statusCode = 401;
      return next(error);
    }
    req.user = verifiedUser;
    next();
  } catch (error) {
    next(error);
  }
};

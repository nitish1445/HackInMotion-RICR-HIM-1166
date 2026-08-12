import bcrypt from "bcrypt";
import User from "../models/userModel.js";
import { genToken, genOTPToken } from "../utils/authToken.js";
import OTP from "../models/otpModel.js";
import { sendOTPEmail } from "../utils/emailService.js";

export const UserRegister = async (req, res, next) => {
  try {
    //accept data from fronted
    const { fullName, email, password } = req.body;

    //verify that all data exist
    if (!fullName || !email || !password) {
      const error = new Error("All Field Required");
      error.statusCode = 400;
      return next(error);
    }

    //normalize email
    const normalizedEmail = email.toLowerCase().trim();

    //check for duplicate user before refistration
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      const error = new Error("Email Already Registered.");
      error.statusCode = 409;
      return next(error);
    }

    console.log("Sending Data to DB");

    //encrypt the password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    //use placeholder image for profile photo
    const photoURL = `https://placehold.co/600x400?text=${fullName.charAt(0).toUpperCase()}`;
    const photo = {
      url: photoURL,
    };

    //save data to database
    const newUser = await User.create({
      fullName,
      email: normalizedEmail,
      password: hashPassword,
      profileImage: photo,
    });

    genToken(newUser, res);

    console.log(newUser);

    const { password: _, __v, ...userData } = newUser.toObject();

    console.log(userData);
    res
      .status(201)
      .json({ message: "Registration Successfull !", data: userData });
  } catch (error) {
    next(error);
  }
};

export const UserLogin = async (req, res, next) => {
  try {
    //fetch data from fronted
    const { email, password } = req.body;

    //verify that all data exist
    if (!email || !password) {
      const error = new Error("All Field Required");
      error.statusCode = 400;
      return next(error);
    }

    //  normalize email
    const normalizedEmail = email.toLowerCase().trim();

    //check for if user is registered or not
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (!existingUser) {
      const error = new Error("User Not Found.");
      error.statusCode = 401;
      return next(error);
    }

    //verify password
    const isVerified = await bcrypt.compare(password, existingUser.password);
    if (!isVerified) {
      const error = new Error("Please check your Email and Password.");
      error.statusCode = 401;
      return next(error);
    }

    //Token Genration will be done here
    genToken(existingUser, res);

    //send data to fronted
    const { password: _, __v, ...userData } = existingUser.toObject();

    res
      .status(200)
      .json({ message: "Login Successfull !", data: userData });
  } catch (error) {
    next(error);
  }
};

export const UserLogout = async (req, res, next) => {
  try {
    // send mesage to frontend
    res.clearCookie("DevLabToken");

    res.status(200).json({ message: "Logout Successfull" });
  } catch (error) {
    next(error);
  }
};

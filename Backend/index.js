import dotenv from "dotenv";

dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import cloudinary from "./src/config/cloudinary.js";
import AuthRouter from "./src/routers/authRouter.js";
import connectDB from "./src/config/db.js";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://devlab-hackathon-project.vercel.app",
    ],
    credentials: true,
  }),
);

app.use(express.json()); // Parse incoming JSON requests
app.use(cookieParser()); // Parse cookies from incoming requests
app.use(morgan("dev")); // Log HTTP requests to the console

app.use("/auth", AuthRouter);

//Health check route
app.get("/", (req, res) => {
  console.log("server is working");
});

// Global Error handling middleware
app.use((err, req, res, next) => {
  const ErrorMessage = err.message || "Internal Server Error";
  const StatusCode = err.statusCode || 500;
  console.log("Error Found", { ErrorMessage, StatusCode });

  res.status(StatusCode).json({ message: ErrorMessage });
});

const port = process.env.PORT || 4500;

app.listen(port, async () => {
  console.log("Server started at port: ", port);
  await connectDB();
  try {
    const res = await cloudinary.api.ping();
    console.log("Cloudinary connection successful:", res);
  } catch (error) {
    console.error("Cloudinary connection failed:", error);
  }
});
import mongoose from "mongoose";
import User from "../models/userModel.js";

const ensureUserIndexes = async () => {
  const indexes = await User.collection.indexes();
  const mobileIndex = indexes.find(
    (index) =>
      index.key?.mobileNumber === 1 &&
      index.unique === true &&
      index.sparse !== true,
  );

  if (mobileIndex) {
    await User.collection.dropIndex(mobileIndex.name);
  }

  await User.createIndexes();
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    await ensureUserIndexes();
    console.log("MongoDB connected at", process.env.MONGO_URI);
    console.log("MongoDB connected at", conn.connection.host);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;

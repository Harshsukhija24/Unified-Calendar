// Test script to check if users exist in the database
import mongoose from "mongoose";
import User from "./Models/User.js";
import dotenv from "dotenv";

dotenv.config();

// The email to search for
const emailToFind = "harshsukhija2002@gmail.com";

const connectAndSearchUser = async () => {
  try {
    console.log(
      "Environment variables loaded:",
      Object.keys(process.env).filter((key) => key.includes("MONGO"))
    );
    const mongoUri = process.env.MONGO_URL;
    console.log(
      "Using MongoDB URI:",
      mongoUri ? `${mongoUri.substring(0, 15)}...` : "Not found"
    );

    if (!mongoUri) {
      throw new Error("MongoDB URI not found in environment variables");
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    // Get all users to check the collection
    const allUsers = await User.find({});
    console.log(`Total users in database: ${allUsers.length}`);

    if (allUsers.length > 0) {
      console.log("Sample user emails:");
      allUsers.slice(0, 5).forEach((user) => {
        console.log(`- ${user.email} (${user._id})`);
      });
    } else {
      console.log("No users found in database");
    }

    // Try to find the specific user
    console.log(`\nSearching for user with email: ${emailToFind}`);

    // Direct match
    const exactUser = await User.findOne({ email: emailToFind });
    console.log(
      "Direct match result:",
      exactUser ? `Found: ${exactUser.email}` : "Not found"
    );

    // Case-insensitive match
    const caseInsensitiveUser = await User.findOne({
      email: new RegExp(
        `^${emailToFind.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")}$`,
        "i"
      ),
    });
    console.log(
      "Case-insensitive match result:",
      caseInsensitiveUser ? `Found: ${caseInsensitiveUser.email}` : "Not found"
    );

    // Check if the email exists in any form
    const allEmailsLowercase = allUsers.map((u) => u.email.toLowerCase());
    const normalizedEmailToFind = emailToFind.toLowerCase();

    console.log(
      "Manual check if email exists in any case:",
      allEmailsLowercase.includes(normalizedEmailToFind)
        ? "Found in array"
        : "Not in array"
    );

    if (allEmailsLowercase.includes(normalizedEmailToFind)) {
      const matchingUser = allUsers.find(
        (u) => u.email.toLowerCase() === normalizedEmailToFind
      );
      console.log("Actual email in database:", matchingUser.email);
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    // Close the connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log("Disconnected from MongoDB");
    }
  }
};

connectAndSearchUser();

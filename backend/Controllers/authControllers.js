import {
  createAccToken,
  hashPassword,
  verifyPassword,
} from "../Helpers/authHelper.js";
import { clientConnection } from "../Helpers/dbConnection.js";
import nodemailer from "nodemailer";

// Function to generate OTP
const generateOtp = function (size) {
  const zeros = "0".repeat(size - 1);
  const x = parseFloat("1" + zeros);
  const y = parseFloat("9" + zeros);
  const confirmation = String(Math.floor(x + Math.random() * y));
  const confirmationCode = parseInt(confirmation);
  return confirmationCode;
};

// Function to send OTP via email
const sendOtpMail = async (data, otp, callback) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "harshsukhija2002@gmail.com",
        pass: "vuks jzjn qveq hczv",
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    let maillist = [data?.email];

    await transporter.sendMail({
      from: "harshsukhija2002@gmail.com",
      to: maillist,
      subject: `Application Login OTP-${otp}`,
      html: `
        <div>
          <p>Hi,</p>
          <p>Please Verify your OTP ${otp} for Login!</p>
          <p>Thank you</p>
        </div>
      `,
    });
    return callback(null, `mail sent to ${data?.email}`);
  } catch (err) {
    return callback(err);
  }
};

export const emaillogin = async (req, res) => {
  try {
    const result = await clientConnection("Users").findOne({
      email: req.body.email,
    });
    if (result) {
      const otpValue = generateOtp(4);

      sendOtpMail(req?.body, otpValue, async (err, response) => {
        if (err) {
          res.status(200).send([{ message: err.message }]);
        } else {
          await clientConnection("Users").updateOne(
            { email: req.body.email },
            { $set: { otp: otpValue } }
          );
          res.status(200).json({ success: true, response });
        }
      });
    } else {
      res.status(200).send({
        success: false,
        msg: "User not registered. Please register first.",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
    });
  }
};

export const emailLoginVerify = async (req, res) => {
  try {
    const result = await clientConnection("Users").findOne({
      email: req.body.email,
    });

    if (!result) {
      return res.status(401).send({
        success: false,
        msg: "User not found",
      });
    }

    if (result.otp == req.body.otp) {
      const accessToken = createAccToken({ id: result._id });

      const user = {
        email: result.email,
        name: result.name || result.email.split("@")[0],
      };

      res.status(200).send({
        success: true,
        msg: "OTP verified successfully",
        accessToken,
        user,
      });
    } else {
      res.status(200).send({
        success: false,
        msg: "Invalid OTP. Please try again.",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
    });
  }
};

export const userSignup = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).send({
        success: false,
        msg: "Email is required",
      });
    }

    const result = await clientConnection("Users").findOne({ email });

    if (result) {
      return res.status(200).send({
        success: true,
        msg: "User exists",
      });
    } else {
      return res.status(404).send({
        success: false,
        msg: "User not registered. Please register first.",
      });
    }
  } catch (error) {
    console.error("Error in userSignup function:", error);
    return res.status(500).send({
      success: false,
      error: error.message || "Internal Server Error",
    });
  }
};

// Register new user with email and password
export const registerWithPassword = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res.status(400).send({
        success: false,
        msg: "Email and password are required",
      });
    }

    // Check if user already exists
    const existingUser = await clientConnection("Users").findOne({ email });
    if (existingUser) {
      return res.status(409).send({
        success: false,
        msg: "User with this email already exists",
      });
    }

    // Hash password
    const hashedPassword = hashPassword(password);

    // Insert new user
    const result = await clientConnection("Users").insertOne({
      email,
      password: hashedPassword,
      name: name || email.split("@")[0],
      createdAt: new Date(),
      authType: "password",
      otp: null,
    });

    // Generate JWT token
    const accessToken = createAccToken({ id: result.insertedId });

    return res.status(201).send({
      success: true,
      msg: "User registered successfully",
      accessToken,
      user: {
        email,
        name: name || email.split("@")[0],
      },
    });
  } catch (error) {
    console.error("Error in registerWithPassword function:", error);
    return res.status(500).send({
      success: false,
      error: error.message || "Internal Server Error",
    });
  }
};

// Login with email and password
export const loginWithPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res.status(400).send({
        success: false,
        msg: "Email and password are required",
      });
    }

    // Find user
    const user = await clientConnection("Users").findOne({ email });

    // Check if user exists
    if (!user) {
      return res.status(401).send({
        success: false,
        msg: "Invalid email or password",
      });
    }

    // Check if user has password (might be OTP-only user)
    if (!user.password) {
      return res.status(401).send({
        success: false,
        msg: "This account doesn't use password authentication. Please login with OTP.",
      });
    }

    // Verify password
    const isPasswordValid = verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).send({
        success: false,
        msg: "Invalid email or password",
      });
    }

    // Generate JWT token
    const accessToken = createAccToken({ id: user._id });

    return res.status(200).send({
      success: true,
      msg: "Login successful",
      accessToken,
      user: {
        email: user.email,
        name: user.name || user.email.split("@")[0],
      },
    });
  } catch (error) {
    console.error("Error in loginWithPassword function:", error);
    return res.status(500).send({
      success: false,
      error: error.message || "Internal Server Error",
    });
  }
};

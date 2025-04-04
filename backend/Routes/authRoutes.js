import express from "express";
import {
  emaillogin,
  emailLoginVerify,
  userSignup,
  loginWithPassword,
  registerWithPassword,
} from "../Controllers/authControllers.js";

const authRoutes = express.Router();

// OTP-based auth routes
authRoutes.post("/emaillogin", emaillogin);
authRoutes.post("/emailverify", emailLoginVerify);
authRoutes.post("/usersignup", userSignup);

// Password-based auth routes
authRoutes.post("/register", registerWithPassword);
authRoutes.post("/login", loginWithPassword);

export default authRoutes;

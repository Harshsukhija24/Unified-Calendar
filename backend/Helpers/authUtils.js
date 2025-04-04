import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import CryptoJS from "crypto-js";

const secret =
  process.env.JWT_SECRET || "this is randomly generated jwt secret string";

// Password encryption and verification functions
export const hashPassword = (password) => {
  return CryptoJS.AES.encrypt(password, secret).toString();
};

export const verifyPassword = (hashedPassword, plainPassword) => {
  const decrypted = CryptoJS.AES.decrypt(hashedPassword, secret);
  return decrypted.toString(CryptoJS.enc.Utf8) === plainPassword;
};

export const createAccToken = (user) => {
  return jwt.sign(user, secret, {
    expiresIn: "1h",
  });
};

export const generateOtp = function (size) {
  const zeros = "0".repeat(size - 1);
  const x = parseFloat("1" + zeros);
  const y = parseFloat("9" + zeros);
  const confirmation = String(Math.floor(x + Math.random() * y));
  const confirmationCode = parseInt(confirmation);
  return confirmationCode;
};

export const sendOtpMail = async (data, otp, callback) => {
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
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td style="padding: 20px 0 30px 0;">
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; border: 1px solid #cccccc;">
            <tr>
              <td align="center" bgcolor="#00d1b2" style="padding: 40px 0 30px 0;">
              
              </td>
            </tr>
            <tr>
              <td bgcolor="#ffffff" style="padding: 40px 30px 40px 30px;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
                  <tr>
                    <td style="color: #153643; font-family: Arial, sans-serif;">
                      <h1 style="font-size: 24px; margin: 0;">Application OTP Login </h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 24px; padding: 20px 0 30px 0;">
                      <p style="margin: 0;"> Hi, </p>
                      <p>Please Verify your OTP ${otp} Login !</p>
                      <br>
                      <p> Thank you</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
      
            `,
    });
    return callback(null, `mail sent to ${data?.email}`);
  } catch (err) {
    return callback(err);
  }
};

import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import nodemailer from "nodemailer";
import { UAParser } from "ua-parser-js";
import { connection } from "../server.js";
import {
  BAD_REQUEST,
  NOT_FOUND,
  SERVER_ERROR,
  STATUS_OK,
  UNAUTHORIZED,
} from "../Constants/httpStatus.js";

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    let user = await findUserByEmail(email);

    if (user) {
      return res.status(BAD_REQUEST).json({ error: "User already exists" });
    }

    const userId = uuidv4();

    const hashedPassword = await bcrypt.hash(password, 10);

    await createUser(userId, name, email, hashedPassword);

    res.status(STATUS_OK).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(SERVER_ERROR).json({ error: "Server error" });
  }
};

export const getActiveSessions = (req, res) => {
  const userId = req.jwtUser;

  connection.query(
    `SELECT id, userId, refreshToken, ipAddress, userAgent, browser, os, deviceType, expiresAt
     FROM sessions 
     WHERE userId = ? AND isActive = 1`,
    [userId],
    (err, results) => {
      if (err) {
        console.error("Error fetching sessions:", err);
        return res.status(SERVER_ERROR).json({ message: "Failed to fetch sessions" });
      }

      res.json({ devices: results });
    }
  );
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(BAD_REQUEST).json({ error: "Email and password are required" });
  }

  try {
    const user = await findUserByEmail(email);
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(UNAUTHORIZED).json({ error: "Invalid credentials" });
    }

    const sessionId = uuidv4();
    const ipAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const userAgent = req.headers["user-agent"];
    const parser = new UAParser(userAgent);
    const parsed = parser.getResult();

    const browser = parsed.browser?.name || "Unknown";
    const os = parsed.os?.name || "Unknown";
    const deviceType = parsed.device?.type || "desktop";

    const accessToken = jwt.sign(
      { id: user.id, name: user.name },
      process.env.SECRET_KEY,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: user.id, name: user.name },
      process.env.REFRESH_KEY,
      { expiresIn: "1y" }
    );

    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

    connection.query(
      `INSERT INTO sessions (id, userId, refreshToken, ipAddress, userAgent, browser, os, deviceType, expiresAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [sessionId, user.id, refreshToken, ipAddress, userAgent, browser, os, deviceType, expiresAt],
      (err) => {
        if (err) {
          console.error("DB insert error:", err);
          return res.status(SERVER_ERROR).json({ error: "Session creation failed" });
        }

        res.cookie("accessToken", accessToken, {
          httpOnly: true,
          secure: false,
          sameSite: "Lax",
          maxAge: 15 * 60 * 1000,
        });

        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: false,
          sameSite: "Lax",
          maxAge: 365 * 24 * 60 * 60 * 1000,
        });

        res.cookie("sessionId", sessionId, {
          httpOnly: true,
          secure: false,
          sameSite: "Lax",
          maxAge: 365 * 24 * 60 * 60 * 1000,
        });

        res.json({ name: user.name, email: user.email });
      }
    );
  } catch (err) {
    console.error("Login error:", err);
    res.status(SERVER_ERROR).json({ error: "Internal server error" });
  }
};

export const logoutSpecificDevice = (req, res) => {
  const userId = req.jwtUser;
  const targetSessionId = req.params.sessionId;
  const currentSessionId = req.cookies["sessionId"];

  if (targetSessionId === currentSessionId) {
    return res
      .status(BAD_REQUEST)
      .json({ message: "Cannot delete current session from this route" });
  }

  connection.query(
    `UPDATE sessions SET isActive = 0 
     WHERE id = ? AND userId = ? AND isActive = 1`,
    [targetSessionId, userId],
    (err, result) => {
      if (err) {
        console.error("Error logging out device:", err);
        return res.status(SERVER_ERROR).json({ message: "Internal server error" });
      }

      if (result.affectedRows === 0) {
        return res
          .status(NOT_FOUND)
          .json({ message: "Device not found or already logged out" });
      }

      res.status(STATUS_OK).json({ message: "Device logged out successfully" });
    }
  );
};

export const logoutFromAllDevices = (req, res) => {
  const userId = req.jwtUser;
  const currentSessionId = req.cookies["sessionId"];
  const { exceptCurrent } = req.body;

  let query = `UPDATE sessions SET isActive = 0 WHERE userId = ?`;
  let params = [userId];

  if (exceptCurrent) {
    query += ` AND id != ?`;
    params.push(currentSessionId);
  }

  connection.query(query, params, (err) => {
    if (err) {
      console.error("Logout all devices error:", err);
      return res.status(SERVER_ERROR).json({ message: "Internal server error" });
    }

    if (!exceptCurrent) {
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      res.clearCookie("sessionId");
    }

    res
      .status(STATUS_OK)
      .json({ message: "Logged out from all devices successfully" });
  });
};

export const logoutUser = async (req, res) => {
  const sessionId = req.cookies["sessionId"];
  const refreshToken = req.cookies["refreshToken"];

  if (!sessionId || !refreshToken) {
    return res.status(BAD_REQUEST).json({ message: "No active session found" });
  }

  connection.query(
    `UPDATE sessions SET isActive = 0 WHERE id = ? AND refreshToken = ?`,
    [sessionId, refreshToken],
    (err, results) => {
      if (err) {
        console.error("Logout DB error:", err);
        return res
          .status(SERVER_ERROR)
          .json({ message: "Internal server error" });
      }

      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      res.clearCookie("sessionId");

      return res.status(STATUS_OK).json({ message: "Logged out successfully" });
    }
  );
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await findUserByEmail(email);
    if (!user)
      return res.status(UNAUTHORIZED).json({ error: "User not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const expirationTime = Date.now() + 10 * 60 * 1000;

    await savePasswordResetToken(user.id, hashedToken, expirationTime);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.SENDER_MAIL, pass: process.env.PASS_KEY },
    });

    const mailOptions = {
      from: process.env.SENDER_MAIL,
      to: email,
      subject: "Reset your password",
      text: `Click the link to reset your password: http://localhost:5173/reset-password/${user.id}/${resetToken}/${expirationTime}`,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "Password reset email sent" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(SERVER_ERROR).json({ error: "Server error" });
  }
};

export const resetPassword = async (req, res) => {
  const { userId, token, expiry } = req.params;
  const { password } = req.body;

  try {
    const user = await findUserById(userId);
    if (!user)
      return res.status(UNAUTHORIZED).json({ error: "User not found" });

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const tokenRecord = await getPasswordResetToken(userId, hashedToken);

    if (!tokenRecord) {
      return res.status(BAD_REQUEST).json({ error: "Invalid token" });
    }

    if (tokenRecord.is_used) {
      return res
        .status(BAD_REQUEST)
        .json({ error: "Token has already been used" });
    }

    if (
      Date.now() > parseInt(expiry) ||
      tokenRecord.expiration_time < Date.now()
    ) {
      return res.status(BAD_REQUEST).json({ error: "Token has expired" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await updateUserPassword(user.id, hashedPassword);
    await invalidatePasswordResetToken(tokenRecord.id);

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(SERVER_ERROR).json({ error: "Server error" });
  }
};

export const verifyToken = async (req, res) => {
  const { userId, token, expiry } = req.body;

  try {
    const user = await findUserById(userId);
    if (!user)
      return res.status(UNAUTHORIZED).json({ error: "User not found" });

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const tokenRecord = await getPasswordResetToken(userId, hashedToken);

    if (!tokenRecord) {
      return res.status(BAD_REQUEST).json({ error: "Invalid token" });
    }

    if (tokenRecord.is_used) {
      return res
        .status(BAD_REQUEST)
        .json({ error: "Token has already been used" });
    }

    if (
      Date.now() > parseInt(expiry) ||
      tokenRecord.expiration_time < Date.now()
    ) {
      return res.status(BAD_REQUEST).json({ error: "Token has expired" });
    }

    res.json({ status: true, message: "Token is valid" });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(SERVER_ERROR).json({ error: "Server error" });
  }
};

const findUserByEmail = (email) => {
  return new Promise((resolve, reject) => {
    connection.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      }
    );
  });
};

const findUserById = (userId) => {
  return new Promise((resolve, reject) => {
    connection.query(
      "SELECT * FROM users WHERE id = ?",
      [userId],
      (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      }
    );
  });
};

const createUser = (userId, name, email, password) => {
  return new Promise((resolve, reject) => {
    connection.query(
      "INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)",
      [userId, name, email, password],
      (err, results) => {
        if (err) reject(err);
        else resolve(results);
      }
    );
  });
};

const savePasswordResetToken = (userId, hashedToken, expirationTime) => {
  return new Promise((resolve, reject) => {
    connection.query(
      "INSERT INTO password_reset_tokens (user_id, token, expiration_time) VALUES (?, ?, ?)",
      [userId, hashedToken, expirationTime],
      (err, results) => {
        if (err) reject(err);
        else resolve(results);
      }
    );
  });
};

const getPasswordResetToken = (userId, hashedToken) => {
  return new Promise((resolve, reject) => {
    connection.query(
      "SELECT * FROM password_reset_tokens WHERE user_id = ? AND token = ?",
      [userId, hashedToken],
      (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      }
    );
  });
};

const updateUserPassword = (userId, hashedPassword) => {
  return new Promise((resolve, reject) => {
    connection.query(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedPassword, userId],
      (err, results) => {
        if (err) reject(err);
        else resolve(results);
      }
    );
  });
};

const invalidatePasswordResetToken = (tokenId) => {
  return new Promise((resolve, reject) => {
    connection.query(
      "UPDATE password_reset_tokens SET is_used = TRUE WHERE id = ?",
      [tokenId],
      (err, results) => {
        if (err) reject(err);
        else resolve(results);
      }
    );
  });
};

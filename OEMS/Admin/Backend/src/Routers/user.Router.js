import { Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import { connection } from "../server.js";
import {
  authenticateJWT,
  authenticateSession,
} from "../Middleware/auth.mid.js";

import {
  BAD_REQUEST,
  SERVER_ERROR,
  STATUS_OK,
  UNAUTHORIZED,
} from "../Constants/httpStatus.js";

const router = Router();

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    let user = await findUserByEmail(email);

    if (user) {
      return res.status(BAD_REQUEST).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await createUser(name, email, hashedPassword);

    res.status(STATUS_OK).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(SERVER_ERROR).json({ error: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(BAD_REQUEST)
      .json({ error: "Email and password are required" });
  }
  try {
    const user = await findUserByEmail(email);
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(UNAUTHORIZED).json({ error: "Invalid credentials" });
    }
    const sessionId = uuidv4();
    const accessToken = jwt.sign({ id: user.name }, process.env.SECRET_KEY, {
      expiresIn: "10m",
    });
    const refreshToken = jwt.sign({ id: user.name }, process.env.REFRESH_KEY, {
      expiresIn: "30d",
    });
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const expiryTime = expiresAt.toISOString().slice(0, 19).replace("T", " ");

    const updateQuery = `
    UPDATE users SET sessionId = ?, expiryTime = ? WHERE email = ?
  `;
    connection.query(
      updateQuery,
      [sessionId, expiryTime, email],
      (updateErr, updateResult) => {
        if (updateErr) {
          console.error(updateErr);
          return res
            .status(SERVER_ERROR)
            .json({ error: "Database error while updating session" });
        }
      }
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
    });

    res.cookie("sessionId", sessionId, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
    });

    res.json({ name: user.name, accessToken, email: user.email });
  } catch (err) {
    console.error("Login error:", err);
    res.status(SERVER_ERROR).json({ error: "Internal server error" });
  }
});

router.get("/csrf-token", (req, res) => {
  res.cookie("XSRF-TOKEN", req.csrfToken(), {
    httpOnly: false,
    sameSite: "Lax",
    secure: false,
  });
  res.status(200).json({ message: "CSRF token set" });
});

router.get(
  "/check-auth",
  authenticateJWT,
  authenticateSession,
  async (req, res) => {
    if (req.user && req.jwtUser) {
      return res
        .status(STATUS_OK)
        .json({ authorized: true, name: req.jwtUser, email: req.user });
    }
    return res.status(UNAUTHORIZED).json({ authorized: false });
  }
);

router.post("/refresh", (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.sendStatus(UNAUTHORIZED);

  jwt.verify(refreshToken, process.env.REFRESH_KEY, (err, user) => {
    if (err) return res.sendStatus(UNAUTHORIZED);

    const newAccessToken = jwt.sign({ id: user.id }, process.env.SECRET_KEY, {
      expiresIn: "10m",
    });

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
    });

    res.json({ accessToken: newAccessToken });
  });
});

router.post("/logout", (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(BAD_REQUEST).json({ message: "Email is required" });
  }
  connection.query(
    "UPDATE users SET sessionId = NULL, expiryTime = NULL WHERE email = ?",
    [email],
    (err, results) => {
      if (err) {
        console.error("Error updating session info:", err);
        return res.status(SERVER_ERROR).json({ error: "Server error" });
      }
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      res.clearCookie("sessionId");
      res.clearCookie("_csrf"); 
      res.clearCookie("XSRF-TOKEN");
      res.sendStatus(STATUS_OK);
    }
  );
});

router.post("/forgot-password", async (req, res) => {
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
      auth: { user: "Karthivishva45@gmail.com", pass: "gjmo dstk xuci oyfd" },
    });

    const mailOptions = {
      from: "Karthivishva45@gmail.com",
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
});

router.post("/reset-password/:userId/:token/:expiry", async (req, res) => {
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
});

router.post("/verify-token", async (req, res) => {
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
});

async function findUserByEmail(email) {
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
}

async function findUserById(userId) {
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
}

async function createUser(name, email, password) {
  return new Promise((resolve, reject) => {
    connection.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, password],
      (err, results) => {
        if (err) reject(err);
        else resolve(results);
      }
    );
  });
}

async function savePasswordResetToken(userId, hashedToken, expirationTime) {
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
}

async function getPasswordResetToken(userId, hashedToken) {
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
}

async function updateUserPassword(userId, hashedPassword) {
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
}

async function invalidatePasswordResetToken(tokenId) {
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
}

export default router;

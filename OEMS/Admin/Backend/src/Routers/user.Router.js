import { Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { connection } from "../server.js";
import { generateTokenResponse } from "../Token/Token.js";

const router = Router();

 
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
 
  try {
    let user = await findUserByEmail(email);
 
    if (user) {
      return res.status(400).json({ error: "User already exists" });
    }
 
    const hashedPassword = await bcrypt.hash(password, 10);
 
    await createUser(name, email, hashedPassword);
 
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
 
  try {
    let user = await findUserByEmail(email);
   
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    console.log(user);
 
    const tokenResponse = generateTokenResponse(user);
 
    if (!tokenResponse || !tokenResponse.token) {
      throw new Error("Token generation failed");
    }
 
    res.cookie("token", tokenResponse.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
 
    res.json({
      token: tokenResponse.token,
      id: user.id,
      name: user.name,
      emailId: user.email,
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logout successful" });
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await findUserByEmail(email);
    if (!user) return res.status(404).json({ error: "User not found" });

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
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/reset-password/:userId/:token/:expiry", async (req, res) => {
  const { userId, token, expiry } = req.params;
  const { password } = req.body;

  try {
    const user = await findUserById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const tokenRecord = await getPasswordResetToken(userId, hashedToken);

    if (!tokenRecord) {
      return res.status(400).json({ error: "Invalid token" });
    }

    if (tokenRecord.is_used) {
      return res.status(400).json({ error: "Token has already been used" });
    }

    if (Date.now() > parseInt(expiry) || tokenRecord.expiration_time < Date.now()) {
      return res.status(400).json({ error: "Token has expired" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await updateUserPassword(user.id, hashedPassword);
    await invalidatePasswordResetToken(tokenRecord.id);

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/verify-token", async (req, res) => {
  const { userId, token, expiry } = req.body;

  try {
    const user = await findUserById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const tokenRecord = await getPasswordResetToken(userId, hashedToken);

    if (!tokenRecord) {
      return res.status(400).json({ error: "Invalid token" });
    }

    if (tokenRecord.is_used) {
      return res.status(400).json({ error: "Token has already been used" });
    }

    if (Date.now() > parseInt(expiry) || tokenRecord.expiration_time < Date.now()) {
      return res.status(400).json({ error: "Token has expired" });
    }

    res.json({ status: true, message: "Token is valid" });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(500).json({ error: "Server error" });
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

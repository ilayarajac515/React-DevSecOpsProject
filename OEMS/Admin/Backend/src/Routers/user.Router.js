import { Router } from "express";
import bcrypt from "bcryptjs";
import { generateTokenResponse } from "../Token/Token.js";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { connection } from "../server.js";

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
    console.log(user);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

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
    console.log(user.name);

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
    if (!user) {
      return res.status(404).json({ status: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const expirationTime = Date.now() + 10 * 60 * 1000;

    await updateUserToken(user.id, hashedToken, expirationTime);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "Karthivishva45@gmail.com",
        pass: "gjmo dstk xuci oyfd",
      },
    });

    const mailOptions = {
      from: "Karthivishva45@gmail.com",
      to: email,
      subject: "Reset your password",
      text: `Click the link to reset your password: http://localhost:5173/reset-password/${user.id}/${resetToken}`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "Password reset email sent" , status: true});
    
  } catch (error) {
    console.error("Error in forgot-password endpoint:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/reset-password/:userId/:token", async (req, res) => {
  const { userId, token } = req.params;
  const { password } = req.body;

  try {
    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    if (
      !user.passwordResetToken ||
      user.passwordResetToken !== hashedToken ||
      user.passwordResetTokenExpires < Date.now()
    ) {
      console.log("not matching");
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await updateUserPassword(user.id, hashedPassword);

    res.json({ status: "Password updated successfully" , token: user.passwordResetToken , tokenExpires: user.passwordResetTokenExpires });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ error: "Server error" });
  }
});

async function findUserById(userId) {
  return new Promise((resolve, reject) => {
    connection.query(
      "SELECT id, passwordResetToken, passwordResetTokenExpires FROM users WHERE id = ?",
      [userId],
      (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      }
    );
  });
}

async function findUserByEmail(email) {
  return new Promise((resolve, reject) => {
    connection.query(
      "SELECT id, email, name , password FROM users WHERE email = ?",
      [email],
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

async function updateUserToken(userId, hashedToken, expirationTime) {
  return new Promise((resolve, reject) => {
    connection.query(
      "UPDATE users SET passwordResetToken = ?, passwordResetTokenExpires = ? WHERE id = ?",
      [hashedToken, expirationTime, userId],
      (err, results) => {
        if (err) reject(err);
        else resolve(results);
      }
    );
  });
}

async function updateUserPassword(userId, hashedPassword) {
  return new Promise((resolve, reject) => {
    connection.query(
      "UPDATE users SET password = ?, passwordResetToken = NULL, passwordResetTokenExpires = NULL WHERE id = ?",
      [hashedPassword, userId],
      (err, results) => {
        if (err) reject(err);
        else resolve(results);
      }
    );
  });
}

export default router;

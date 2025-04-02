import { Router } from "express";
import bcrypt from "bcryptjs";
import { generateTokenResponse } from "../Token/Token.js";
import nodemailer from "nodemailer";
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
    let user = await findUserByEmail(email);

    if (!user) {
      return res.status(404).json({ Status: "User not found" });
    }

    const generateToken = generateTokenResponse(user);

    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "Karthivishva45@gmail.com",
        pass: "gjmo dstk xuci oyfd",
      },
    });

    let mailOptions = {
      from: "Karthivishva45@gmail.com",
      to: email,
      subject: "Reset your password",
      text: `http://localhost:3000/reset-password/${user.id}/${generateToken.token}`,
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ error: "Failed to send email" });
      } else {
        res.json({
          id: user.id,
          token: generateToken.token,
          message: "Mail sent successfully",
        });
      }
    });
  } catch (error) {
    console.error("Error in forgot-password endpoint:", error);
    res.status(500).json({ error: "Server error" });
  }
});

async function findUserByEmail(email) {
    return new Promise((resolve, reject) => {
      connection.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
        (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve(results[0]);
          }
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
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        }
      );
    });
  }

  export default router;
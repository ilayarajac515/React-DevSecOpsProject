import { connection } from "../server.js";
import jwt from "jsonwebtoken";
import {
  BAD_REQUEST,
  SERVER_ERROR,
  STATUS_OK,
  FORBIDDEN,
  UNAUTHORIZED,
} from "../Constants/httpStatus.js";

export const candidateLogin = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(BAD_REQUEST)
      .json({ message: "Email and password are required" });
  }

  const query = `
      SELECT * FROM candidate_registration
      WHERE email = ? AND mobile = ?
    `;

  connection.query(query, [email, password], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(SERVER_ERROR).json({ message: "Server error" });
    }

    if (results.length === 0) {
      return res.status(UNAUTHORIZED).json({ message: "Invalid credentials" });
    }

    const checkValueTableQuery = `
        SELECT * FROM ValueTable WHERE userEmail = ?
      `;

    connection.query(checkValueTableQuery, [email], (err2, valueResults) => {
      if (err2) {
        console.error("Error checking ValueTable:", err2);
        return res.status(SERVER_ERROR).json({ message: "Server error" });
      }

      if (valueResults.length > 0) {
        return res
          .status(FORBIDDEN)
          .json({ message: "User already submitted" });
      }

      const accessToken = jwt.sign({ email }, process.env.SECRET_KEY, {
        expiresIn: "45m",
      });

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
        maxAge: 45 * 60 * 1000,
      });

      res.status(STATUS_OK).json({
        message: "Login successful",
        email,
        accessToken,
      });
    });
  });
};

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
      .json({ message: "Email and password (mobile) are required" });
  }
  const findCandidateQuery = `
    SELECT * FROM candidate_registration
    WHERE email = ? AND mobile = ?
  `;
  connection.query(
    findCandidateQuery,
    [email, password],
    (err, candidateResults) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(SERVER_ERROR).json({ message: "Server error" });
      }
      if (candidateResults.length === 0) {
        return res
          .status(UNAUTHORIZED)
          .json({ message: "Invalid credentials" });
      }
      const checkSubmissionQuery = `
      SELECT * FROM ValueTable WHERE userEmail = ?
    `;
      connection.query(checkSubmissionQuery, [email], (err2, valueResults) => {
        if (err2) {
          console.error("Error checking submission status:", err2);
          return res.status(SERVER_ERROR).json({ message: "Server error" });
        }
        if (valueResults.length > 0) {
          return res
            .status(FORBIDDEN)
            .json({ message: "User has already submitted the exam" });
        }
        const candidateToken = jwt.sign({ email }, process.env.SECRET_KEY, {
          expiresIn: "45m",
        });
        res.cookie("candidateToken", candidateToken, {
          httpOnly: true,
          secure: false,
          sameSite: "Lax",
          maxAge: 45 * 60 * 1000,
        });

        return res.status(STATUS_OK).json({
          message: "Login successful",
          email,
          candidateToken,
        });
      });
    }
  );
};

import jwt from "jsonwebtoken";
import {
  BAD_REQUEST,
  SERVER_ERROR,
  UNAUTHORIZED,
} from "../Constants/httpStatus.js";
import { connection } from "../server.js";

export const authenticateJWT = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(BAD_REQUEST).json({ message: "No token provided" });
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) {
      return res
        .status(UNAUTHORIZED)
        .json({ message: "Invalid or expired token" });
    }
    req.jwtUser = user.id;
    next();
  });
};

export const authenticateSession = (req, res, next) => {
  const sessionId = req.cookies["sessionId"];
  if (!sessionId) {
    return res
      .status(BAD_REQUEST)
      .json({ message: "Session expired or invalid" });
  }

  connection.query(
    "SELECT * FROM users WHERE sessionId = ?",
    [sessionId],
    (err, results) => {
      if (err) {
        return res.status(SERVER_ERROR).json({ error: "Server error" });
      }

      const session = results[0];
      const expiry = new Date(session?.expiryTime);
      const expiryTime = expiry.getTime();

      if (isNaN(expiryTime)) {
        return res
          .status(BAD_REQUEST)
          .json({ message: "Invalid expiry time in database" });
      }

      const now = Date.now();
      if (!session || expiryTime < now) {
        connection.query(
          "UPDATE users SET sessionId = NULL, expiryTime = NULL WHERE sessionId = ?",
          [sessionId],
          (deleteErr) => {
            if (deleteErr) {
              console.error("Error removing expired session:", deleteErr);
            }
          }
        );

        return res
          .status(BAD_REQUEST)
          .json({ message: "Session expired or invalid" });
      }
      req.user = session.email;
      next();
    }
  );
};

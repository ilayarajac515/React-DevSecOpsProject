import jwt from "jsonwebtoken";
import { BAD_REQUEST, UNAUTHORIZED } from "../Constants/httpStatus.js";
import { connection } from "../server.js";
 
export const authenticateJWT = async (req, res, next) => {
  const accessToken = req.cookies["accessToken"];
  const refreshToken = req.cookies["refreshToken"];
  const sessionId = req.cookies["sessionId"];
 
  if (!refreshToken || !sessionId) {
    return res.status(UNAUTHORIZED).json({ message: "Not authenticated" });
  }
 
  try {
    const decoded = jwt.verify(accessToken, process.env.SECRET_KEY);
    req.jwtUserId = decoded.id;
    req.jwtUser = decoded.name;
    req.jwtEmail = decoded.email;
 
    return next();
  } catch (err) {
    try {
      const decodedRefresh = jwt.verify(refreshToken, process.env.REFRESH_KEY);
      const userId = decodedRefresh.id;
      const name = decodedRefresh.name;
      const email = decodedRefresh.email;
 
      const [session] = await querySession(sessionId, refreshToken, userId);
      if (!session) {
        return res
          .status(UNAUTHORIZED)
          .json({ message: "Session invalid or expired" });
      }
 
      const newAccessToken = jwt.sign({ id: userId, name: name, email: email }, process.env.SECRET_KEY, {
        expiresIn: "1m",
      });
 
      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 1 * 60 * 1000,
      });
 
      req.jwtUserId = userId;
      req.jwtUser = name;
      req.jwtEmail = email;
 
      return next();
     
    } catch (err) {
      console.error("Refresh error:", err);
      return res.status(UNAUTHORIZED).json({ message: "Unauthorized" });
    }
  }
};
 
async function querySession(sessionId, refreshToken, userId) {
  return new Promise((resolve, reject) => {
    connection.query(
      `SELECT * FROM sessions WHERE id = ? AND userId = ? AND refreshToken = ? AND isActive = 1`,
      [sessionId, userId, refreshToken],
      (err, results) => {
        if (err) return reject(err);
        if (results.length === 0) return resolve([]);
 
        const session = results[0];
        const now = new Date();
        const expiry = new Date(session?.expiresAt);
        const expiryTime = expiry.getTime();
 
        if (expiryTime < now) {
          connection.query(`UPDATE sessions SET isActive = 0 WHERE id = ?`, [
            sessionId,
          ]);
          return resolve([]);
        }
 
        return resolve([session]);
      }
    );
  });
}
 
export const authenticateCandidateJWT = (req, res, next) => {
  const accessToken = req.cookies["candidateToken"];
 
  if (!accessToken) {
    return res.status(BAD_REQUEST).json({ message: "No token provided" });
  }
 
  jwt.verify(accessToken, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res
        .status(UNAUTHORIZED)
        .json({ message: "Invalid or expired token" });
    }
 
    req.candidateEmail = decoded.email;
    next();
  });
};
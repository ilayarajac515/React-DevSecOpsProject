import { Router } from "express";
import handler from "express-async-handler";
import {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  verifyToken,
  refreshToken,
  logoutUser,
} from "../Controllers/user.controller.js";
import {
  STATUS_OK,
  UNAUTHORIZED
} from "../Constants/httpStatus.js";
import { authenticateJWT, authenticateSession } from "../Middleware/auth.mid.js";

const router = Router();

router.post("/register", handler(registerUser));
router.post("/login", handler(loginUser));
router.post("/forgot-password", handler(forgotPassword));
router.post("/reset-password/:userId/:token/:expiry", handler(resetPassword));
router.post("/verify-token", handler(verifyToken));
router.post("/refresh-token", handler(refreshToken));
router.post("/logout", handler(logoutUser));

router.get(
  "/check-auth",
  authenticateJWT,
  authenticateSession,
  handler(async (req, res) => {
    if (req.user && req.jwtUser) {
      return res.status(STATUS_OK).json({
        authorized: true,
        name: req.jwtUser,
        email: req.user,
      });
    }
    return res.status(UNAUTHORIZED).json({ authorized: false });
  })
);

export default router;

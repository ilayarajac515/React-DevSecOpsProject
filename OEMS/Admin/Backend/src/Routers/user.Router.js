import { Router } from "express";
import {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  verifyToken,
  refreshToken,
  logoutUser,
} from "../Controllers/userController.js"
import {
  STATUS_OK,
  UNAUTHORIZED,
} from "../Constants/httpStatus.js";
import { authenticateJWT, authenticateSession } from "../Middleware/auth.mid.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:userId/:token/:expiry", resetPassword);
router.post("/verify-token", verifyToken);
router.post("/refresh-token", refreshToken);
router.post("/logout", logoutUser);
router.get(
  "/check-auth",
  authenticateJWT,
  authenticateSession,
  async (req, res) => {
    if (req.user && req.jwtUser) {
      return res.status(STATUS_OK).json({
        authorized: true,
        name: req.jwtUser,
        email: req.user,
      });
    }
    return res.status(UNAUTHORIZED).json({ authorized: false });
  }
);

export default router;

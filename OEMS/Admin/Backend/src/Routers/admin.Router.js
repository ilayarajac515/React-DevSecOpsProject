import { Router } from "express";
import handler from "express-async-handler";
import * as adminController from "../Controllers/admin.controller.js";
import {
  BAD_REQUEST,
  STATUS_OK
} from "../Constants/httpStatus.js";
import { authenticateJWT } from "../Middleware/auth.mid.js";

const router = Router();

router.post("/register", handler(adminController.registerUser));
router.post("/login", handler(adminController.loginUser));
router.post("/forgot-password", handler(adminController.forgotPassword));
router.post("/reset-password/:userId/:token/:expiry", handler(adminController.resetPassword));
router.post("/verify-token", handler(adminController.verifyToken));
router.post("/logout", handler(adminController.logoutUser));
router.get("/devices", authenticateJWT, handler(adminController.getActiveSessions));
router.post("/logout-all", authenticateJWT, handler(adminController.logoutFromAllDevices));
router.delete("/devices/:sessionId", authenticateJWT, handler(adminController.logoutSpecificDevice));

router.get(
  "/check-auth",
  authenticateJWT,
  handler(async (req, res) => {
    if (req.jwtUserId && req.jwtUser) {
      return res.status(STATUS_OK).json({
        authorized: true,
        name: req.jwtUser,
        email: req.user,
      });
    }
    return res.status(BAD_REQUEST).json({ authorized: false });
  })
);

export default router;

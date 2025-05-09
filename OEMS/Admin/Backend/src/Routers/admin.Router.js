import { Router } from "express";
import handler from "express-async-handler";
import * as adminController from "../Controllers/admin.controller.js";
import {
  STATUS_OK,
  UNAUTHORIZED
} from "../Constants/httpStatus.js";
import { authenticateJWT, authenticateSession } from "../Middleware/auth.mid.js";

const router = Router();

router.post("/register", handler(adminController.registerUser));
router.post("/login", handler(adminController.loginUser));
router.post("/forgot-password", handler(adminController.forgotPassword));
router.post("/registration",handler(adminController.registerCandidate));
router.get("/candidate", authenticateJWT, authenticateSession, handler(adminController.getAllCandidates));
router.post("/reset-password/:userId/:token/:expiry", handler(adminController.resetPassword));
router.post("/verify-token", handler(adminController.verifyToken));
router.post("/refresh-token", handler(adminController.refreshToken));
router.post("/logout", handler(adminController.logoutUser));
router.get('/registration/:formId', handler(adminController.getRegistrationsByFormId));
router.get('/registration/:formId/count', handler(adminController.getFormCountByFormId));

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

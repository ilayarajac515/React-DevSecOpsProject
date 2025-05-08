import { Router } from "express";
import * as candidateController from "../Controllers/candidate.controller.js";
import handler from "express-async-handler";
import { authenticateCandidateJWT } from "../Middleware/auth.mid.js";
import { STATUS_OK, UNAUTHORIZED } from "../Constants/httpStatus.js";

const router = Router();

router.post("/login", handler(candidateController.candidateLogin));
router.post("/logout", candidateController.candidateLogout);

router.use(authenticateCandidateJWT);

router.post("/form/:formId/submit", handler(candidateController.submitForm));
router.put("/form/:formId/submission", handler(candidateController.editSubmission));
router.get("/form/:formId/field", handler(candidateController.getCandidateFields));
router.get("/form/:formId", handler(candidateController.getFormById));
router.get("/submission/:email", handler(candidateController.getCandidateSubmission));

router.get(
    "/check-auth",
    handler(async (req, res) => {
      if (req.candidateEmail) {
        return res.status(STATUS_OK).json({
          authorized: true,
          email: req.candidateEmail,
        });
      }
   
      return res.status(UNAUTHORIZED).json({ authorized: false });
    })
  );

export default router;
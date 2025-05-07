import { Router } from "express";
import * as candidateController from "../Controllers/candidate.controller.js";
import handler from "express-async-handler";

const router = Router();

router.post("/login", handler(candidateController.candidateLogin));

export default router;
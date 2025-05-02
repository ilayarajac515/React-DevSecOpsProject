import { Router } from "express";
import * as formController from "../Controllers/form.controller.js";
import multer from "multer";
import handler from "express-async-handler";
import { authenticateJWT, authenticateSession } from "../Middleware/auth.mid.js";

const router = Router();
const upload = multer();

router.use(authenticateJWT, authenticateSession);

router.post("/upload-image", upload.single("image"), handler(formController.uploadImageController));
router.get("/form/:formId/fields", handler(formController.getFields));
router.get("/forms", handler(formController.getForms));
router.get("/form/:formId", handler(formController.getFormById));
router.post("/form/refresh-token", handler(formController.refreshToken));
router.put("/form/:formId/field/:fieldId", handler(formController.updateField));
router.delete("/form/:formId/field/:fieldId", handler(formController.deleteField));
router.post("/form/:formId/field", handler(formController.addField));
router.post("/form", handler(formController.createForm));
router.put("/form/:formId", handler(formController.updateForm));
router.delete("/form/:formId", handler(formController.deleteForm));
router.post("/form/:formId/submit", handler(formController.submitForm));
router.put("/form/:formId/fields", handler(formController.replaceFields));
router.get("/form/:formId/submissions", handler(formController.getSubmissions));

export default router;

import { Router } from "express";
import * as formController from "../Controllers/form.controller.js"
import multer from "multer";
import handler from "express-async-handler";
import { authenticateJWT, authenticateSession } from "../Middleware/auth.mid.js";
 
const router = Router();
const upload = multer();
 
router.use(authenticateJWT,authenticateSession);

router.post("/upload-image", upload.single("image"), handler(formController.uploadImageController));
router.get("/form/:formId/fields", handler(formController.getFields));
router.get('/forms', formController.getForms);
router.get("/form/:formId", formController.getFormById);
router.post("/form/refresh-token", formController.refreshToken);
router.put("/form/:formId/field/:fieldId", formController.updateField);
router.delete("/form/:formId/field/:fieldId", formController.deleteField);
router.post("/form/:formId/field", formController.addField);
router.post("/form", formController.createForm);
router.put("/form/:formId", formController.updateForm);
router.delete("/form/:formId", formController.deleteForm);
router.post("/form/:formId/submit", formController.submitForm);
router.put("/form/:formId/fields", formController.replaceFields);
router.get("/form/:formId/submissions", formController.getSubmissions);
 
export default router;

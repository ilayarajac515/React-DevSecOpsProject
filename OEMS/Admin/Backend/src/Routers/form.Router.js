import { Router } from "express";
import * as formController from "../Controllers/formController.js"
import { authenticateJWT, authenticateSession } from "../Middleware/auth.mid.js";
 
const router = Router();
 
router.use(authenticateJWT,authenticateSession);
 
router.get("/form/:formId/fields", formController.getFields);
router.get('/forms', formController.getForms);
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

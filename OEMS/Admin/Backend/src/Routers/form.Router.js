import { Router } from "express";
import * as formController from "../Controllers/form.controller.js";
import multer from "multer";
import handler from "express-async-handler";
import { authenticateJWT, authenticateSession } from "../Middleware/auth.mid.js";
 
const router = Router();
const upload = multer();
 
router.get('/form/:formId/registration', handler(formController.getRegistrationForm));
router.use(authenticateJWT, authenticateSession);
 
router.post("/upload-image", upload.single("image"), handler(formController.uploadImageController));
router.put('/register/form/:formId', handler(formController.editForm));
router.delete('/register/form/:formId', handler(formController.removeForm));
router.get("/form/:formId/fields", handler(formController.getFields));
router.get("/forms", handler(formController.getForms));
router.post("/form/refresh-token", handler(formController.refreshToken));
router.put("/form/:formId/field/:fieldId", handler(formController.updateField));
router.delete("/form/:formId/field/:fieldId", handler(formController.deleteField));
router.post("/form/:formId/field", handler(formController.addField));
router.post("/form", handler(formController.createForm));
router.put("/form/:formId", handler(formController.updateForm));
router.delete("/form/:formId", handler(formController.deleteForm));
router.put("/form/:formId/fields", handler(formController.replaceFields));
router.get("/form/:formId/submissions", handler(formController.getSubmissions));
router.get("/form/:formId/submitted-count",handler(formController.getSubmittedCount));
router.post('/register/form', handler(formController.addForm));
router.get('/register/forms', handler(formController.getAllRegistrationForms));
export default router;
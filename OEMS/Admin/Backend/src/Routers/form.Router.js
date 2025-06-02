import { Router } from "express";
import * as formController from "../Controllers/form.controller.js";
import multer from "multer";
import handler from "express-async-handler";
import { authenticateJWT } from "../Middleware/auth.mid.js";
 
const router = Router();
const upload = multer();
 
router.get('/form/:formId/registration', handler(formController.getRegistrationForm));
router.post("/candidate/:tableType/:formId", handler(formController.insertCandidate));
router.use(authenticateJWT);

router.post("/upload-image", upload.single("image"), handler(formController.uploadImageController));
router.put('/register/form/:formId', handler(formController.editForm));
router.delete('/register/form/:formId', handler(formController.removeForm));
router.get("/form/:formId/fields", handler(formController.getFields));
router.get("/forms", handler(formController.getForms));
router.put("/form/:formId/field/:fieldId", handler(formController.updateField));
router.delete("/form/:formId/field/:fieldId", handler(formController.deleteField));
router.post("/form/:formId/field", handler(formController.addField));
router.post("/form", handler(formController.createForm));
router.post("/form/clone", handler(formController.cloneForm));
router.put("/form/:formId", handler(formController.updateForm));
router.delete("/form/:formId", handler(formController.deleteForm));
router.put("/form/:formId/fields", handler(formController.replaceFields));
router.get("/form/:formId/submissions", handler(formController.getSubmissions));
router.get('/forms/:formId/submission/:email', handler(formController.getSubmissionByEmail));
router.delete('/form/:formId/submission/:email', handler(formController.deleteSubmissionByEmail));
router.get("/form/:formId/submitted-count",handler(formController.getSubmittedCount));
router.put("/form/:formId/submission", handler(formController.editSubmission));
router.post('/register/form', handler(formController.addForm));
router.get('/register/forms', handler(formController.getAllRegistrationForms));
router.post("/candidates/:tableType/:formId", handler(formController.insertCandidates));
router.post("/selected-candidates/:formId", handler(formController.insertSelectedCandidates));
router.delete("/selected-candidates/:formId/:email", handler(formController.deleteSelectedCandidateByEmail));
router.get("/selected-candidates/:formId", handler(formController.getSelectedCandidatesByFormId));
router.delete("/candidates/:tableType/:formId/:email", handler(formController.deleteCandidate));
router.get("/candidates/:tableType/:formId", handler(formController.getCandidates));
router.get('/candidates/count/:formId/:tableType', handler(formController.getCandidateCount));
router.get('/form/remarks', handler(formController.getAllUserRemarks));
router.get('/forms/assesment/archive', handler(formController.getArchivedForms));
router.put('/forms/:formId/assesment/unarchive', handler(formController.unarchiveForm));
router.get('/forms/registration/archive', handler(formController.getAllArchivedRegistrations));
router.put('/forms/:formId/registration/unarchive', handler(formController.unarchiveRegistrationForm));
 
export default router;
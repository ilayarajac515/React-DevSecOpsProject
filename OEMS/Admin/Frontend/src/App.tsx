import { Box, Container } from "@mui/material";
import { Route, Routes, useLocation } from "react-router-dom";
import SignUpPage from "./pages/SignUpPage";
import SignInPage from "./pages/SignInPage";
import Navbar from "./components/Navbar";
import ForgetPassword from "./pages/ForgetPassword";
import ResetPassword from "./pages/ResetPassword";
import FormListingPage from "./pages/FormListingPage";
import CheckAuth from "./components/CheckAuth";
import PageNotFound from "./pages/PageNotFound";
import FieldListingPage from "./pages/FieldListingPage";
import AssessmentPage from "./pages/AssesmentPage";
import CandidateLogin from "./pages/CandidateLogin";
import SubmissionsPage from "./pages/SubmissionsPage";
import CheckAuthCandidate from "./components/CheckAuthCandidate";
import CandidatesListingPage from "./pages/CandidateListingPage";
import CandidateRegistrationPage from "./pages/CandidateRegistrationPage";
import CandidateRegistrationForm from "./pages/CandidateRegistrationForm";

const App = () => {
  const location = useLocation();
  const isAssessmentPage = location.pathname.startsWith("/assessment-page");

  return (
    <Box sx={{ height:"100vh"}}>
      <Navbar />
      {isAssessmentPage ? (
        <Routes>
          <Route
            path="/assessment-page/:formId"
            element={
              <CheckAuthCandidate>
                <AssessmentPage />
              </CheckAuthCandidate>
            }
          />
        </Routes>
      ) : (
        <Container maxWidth="xl">
          <Routes>
            <Route
              path="/form-listing-page"
              element={
                <CheckAuth>
                  <FormListingPage />
                </CheckAuth>
              }
            />
            <Route
              path="/registration-form-manager"
              element={
                <CheckAuth>
                  <CandidateRegistrationForm />
                </CheckAuth>
              }
            />
            <Route
              path="/field-listing-page/:form/:formId"
              element={
                <CheckAuth>
                  <FieldListingPage />
                </CheckAuth>
              }
            />
            <Route
              path="/"
              element={
                <CheckAuth>
                  <SignInPage />
                </CheckAuth>
              }
            />
            <Route
              path="/sign-up"
              element={
                <CheckAuth>
                  <SignUpPage />
                </CheckAuth>
              }
            />
            <Route
              path="form-listing-page/submissions-page/:id"
              element={
                <CheckAuth>
                  <SubmissionsPage />
                </CheckAuth>
              }
            />
            <Route
            caseSensitive
            path="/registered-candidates-list/:registerForm/:registerFormId"
            element={
              <CheckAuth>
                <CandidatesListingPage />
              </CheckAuth>
            }
          />
          <Route
            caseSensitive
            path="/candidate-registration-page/:registerId"
            element={
              <CheckAuth>
                <CandidateRegistrationPage />
              </CheckAuth>
            }
          />
            <Route
              path="/candidate-login/:formId"
              element={
                <CheckAuthCandidate>
                  <CandidateLogin />
                </CheckAuthCandidate>
              }
            />

            <Route path="/forget-password" element={<ForgetPassword />} />
            <Route
              path="/reset-password/:userId/:token/:expiry"
              element={<ResetPassword />}
            />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Container>
      )}
    </Box>
  );
};

export default App;

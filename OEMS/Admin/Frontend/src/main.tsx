import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";
import "@fontsource/poppins/300.css";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import App from "./App";
import { AuthProvider } from "./context/GlobalContext";
import { LicenseInfo } from "@mui/x-license-pro";
import { Provider } from "react-redux";
import { store } from "./Store/Store";
import { CandidateProvider } from "./context/CandidateContext";
import { CssBaseline, ThemeProvider } from "@mui/material";
import theme from "./themes/theme";

LicenseInfo.setLicenseKey(import.meta.env.VITE_MUI_X);

const rootElement = document.getElementById("root")!;
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <AuthProvider>
          <CandidateProvider>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <App />
              <ToastContainer
                position="bottom-right"
                autoClose={3000}
                hideProgressBar={true}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                theme="colored"
              />
            </ThemeProvider>
          </CandidateProvider>
        </AuthProvider>
      </BrowserRouter>
    </Provider>
  </StrictMode>
);

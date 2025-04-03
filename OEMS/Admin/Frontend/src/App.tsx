import { Box } from "@mui/material"
import { Route, Routes } from "react-router-dom"
import SignUpPage from "./pages/SignUpPage"
import SignInPage from "./pages/SignInPage"
import Navbar from "./components/Navbar"
import ForgetPassword from "./pages/ForgetPassword"
import ResetPassword from "./pages/ResetPassword"

const App = () => {
  return (
    <Box >
      <Navbar />
      <Routes>
        <Route path="/Sign-in" element={<SignInPage />} />
        <Route path="/Sign-Up" element={<SignUpPage />} />
        <Route path="/Forget-password" element={<ForgetPassword />} />
        <Route path='/reset-password/:userId/:token' element={<ResetPassword />} />
      </Routes>
    </Box>
  )
}

export default App

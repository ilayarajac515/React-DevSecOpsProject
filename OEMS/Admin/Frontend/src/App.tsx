import { Box } from "@mui/material"
import { Route, Routes } from "react-router-dom"
import SignUpPage from "./pages/SignUpPage"
import SignInPage from "./pages/SignInPage"
import Navbar from "./components/Navbar"

const App = () => {
  return (
    <Box >
      <Navbar />
      <Routes>
        <Route path="/Sign-in" element={<SignInPage />} />
        <Route path="/Sign-Up" element={<SignUpPage />} />
      </Routes>
    </Box>
  )
}

export default App

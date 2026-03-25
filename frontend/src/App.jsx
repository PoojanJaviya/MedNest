import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import LoginPage from "./pages/LoginPage"
import PatientsPage from "./pages/PatientsPage"
import MedicinesPage from "./pages/MedicinesPage"
import SchedulesPage from "./pages/SchedulesPage"
import SignupPage  from "./pages/SignupPage"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/patients" element={<PatientsPage />} />
        <Route path="/patients/:patientId/medicines" element={<MedicinesPage />} />
        <Route path="/medicines/:medicineId/schedules" element={<SchedulesPage />} />
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/signup" element={<SignupPage />} />
        
      </Routes>
    </BrowserRouter>
  )
}

export default App
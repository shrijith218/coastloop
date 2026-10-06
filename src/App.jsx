import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import ScanPage from "./pages/ScanPage";
import VerificationPage from "./pages/VerificationPage";
import SuccessPage from "./pages/SuccessPage";
import RewardsPage from "./pages/RewardsPage";
import ActivityPage from "./pages/ActivityPage";
import ProfilePage from "./pages/ProfilePage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/home" element={<HomePage />} />
        <Route path="/scan/:binId" element={<ScanPage />} />
        <Route path="/verify/:binId" element={<VerificationPage />} />
        <Route path="/success" element={<SuccessPage />} />

        <Route path="/activity" element={<ActivityPage />} />
        <Route path="/rewards" element={<RewardsPage />} />
        <Route path="/profile" element={<ProfilePage />} />

        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
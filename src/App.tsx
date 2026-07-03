import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./contexts/AppContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Visitor Landing Page */}
          <Route path="/" element={<Home />} />
          
          {/* Admin Login Page */}
          <Route path="/login" element={<Login />} />
          
          {/* Admin Dashboard page */}
          <Route path="/admin/dashboard" element={<Dashboard />} />
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

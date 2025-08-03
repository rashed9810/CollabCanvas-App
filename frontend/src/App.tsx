import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { WhiteboardProvider } from "./context/WhiteboardContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import WhiteboardPage from "./pages/WhiteboardPage";
import "./App.css";

// Content wrapper component to add padding based on route
const ContentWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <div className={`flex-grow ${!isHomePage ? "pt-16" : ""}`}>{children}</div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <WhiteboardProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <ContentWrapper>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/whiteboard/:id" element={<WhiteboardPage />} />
                </Route>
              </Routes>
            </ContentWrapper>
          </div>
        </Router>
      </WhiteboardProvider>
    </AuthProvider>
  );
};

export default App;

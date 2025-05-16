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
            <div className="container mx-auto px-4 py-8">
              <h1 className="text-4xl font-bold text-primary">
                Welcome to our Collaborative Whiteboard
              </h1>
            </div>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route
                path="/login"
                element={
                  <ContentWrapper>
                    <LoginPage />
                  </ContentWrapper>
                }
              />
              <Route
                path="/register"
                element={
                  <ContentWrapper>
                    <RegisterPage />
                  </ContentWrapper>
                }
              />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route
                  path="/dashboard"
                  element={
                    <ContentWrapper>
                      <DashboardPage />
                    </ContentWrapper>
                  }
                />
                <Route
                  path="/whiteboard/:id"
                  element={
                    <ContentWrapper>
                      <WhiteboardPage />
                    </ContentWrapper>
                  }
                />
              </Route>
            </Routes>
          </div>
        </Router>
      </WhiteboardProvider>
    </AuthProvider>
  );
};

export default App;

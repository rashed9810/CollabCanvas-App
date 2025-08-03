import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RegisterPage: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState("");
  const { register, isAuthenticated, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  // Handle authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  // Handle error state changes separately
  useEffect(() => {
    if (error) {
      setFormError(error);
    }
  }, [error]);

  // Clear error when component mounts
  useEffect(() => {
    clearError();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    // Validate form
    if (!name || !email || !password || !confirmPassword) {
      setFormError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setFormError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setFormError("Password must be at least 6 characters long");
      return;
    }

    try {
      await register(name, email, password);
    } catch {
      // Error is handled in auth context
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-200">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-purple-700 to-indigo-800 px-8 py-12 text-white text-center">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-white/5"></div>
          </div>

          {/* Back Button */}
          <button
            onClick={() => navigate("/")}
            className="absolute top-4 left-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300 hover:-translate-y-0.5 z-10"
            aria-label="Go back"
            type="button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Logo */}
          <div className="w-16 h-16 mx-auto mb-4 p-3 bg-white/20 rounded-full flex items-center justify-center shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-full h-full"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>

          <h1 className="text-xl md:text-2xl font-bold mb-2 leading-tight">
            Join our collaborative whiteboard platform
          </h1>
          <p className="text-sm opacity-90">
            Create an account to start collaborating
          </p>
        </div>

        {/* Form Body */}
        <div className="p-8">
          {formError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center text-red-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 mr-3 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm">{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:border-purple-600 focus:ring-3 focus:ring-purple-600/10 transition-all duration-300 outline-none disabled:opacity-50"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                placeholder="Enter your email"
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:border-purple-600 focus:ring-3 focus:ring-purple-600/10 transition-all duration-300 outline-none disabled:opacity-50"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                placeholder="Create a password"
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:border-purple-600 focus:ring-3 focus:ring-purple-600/10 transition-all duration-300 outline-none disabled:opacity-50"
              />
              <div className="text-xs text-gray-500 mt-1 ml-2">
                Password must be at least 6 characters long
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                placeholder="Confirm your password"
                className={`w-full px-4 py-3 text-base border rounded-lg bg-gray-50 focus:bg-white transition-all duration-300 outline-none disabled:opacity-50 ${
                  confirmPassword && password !== confirmPassword
                    ? "border-red-400 focus:border-red-500 focus:ring-3 focus:ring-red-500/10"
                    : "border-gray-300 focus:border-purple-600 focus:ring-3 focus:ring-purple-600/10"
                }`}
              />
              {confirmPassword && password !== confirmPassword && (
                <div className="text-xs text-red-500 mt-1 ml-2">
                  Passwords do not match
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-900 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-6"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="flex items-center my-4">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="px-4 text-sm text-gray-500">OR</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          <div className="text-center text-sm text-gray-600">
            <p>
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-purple-700 font-semibold hover:text-purple-800 hover:underline transition-colors duration-300"
              >
                Sign in here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

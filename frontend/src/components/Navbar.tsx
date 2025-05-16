import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const isHomePage = location.pathname === "/";

  return (
    <nav
      className={`${
        scrolled || !isHomePage
          ? "bg-white text-gray-800 shadow-md"
          : "bg-gradient-to-r from-purple-700 to-indigo-800 text-white"
      } fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center min-w-0">
            <div
              className={`flex-shrink-0 ${scrolled || !isHomePage ? "text-purple-700" : "text-white"}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7 sm:h-9 sm:w-9"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <span
              className={`font-heading font-bold ml-2 text-sm sm:text-lg lg:text-xl leading-tight ${scrolled || !isHomePage ? "text-gray-800" : "text-white"}`}
              style={{ display: 'block', lineHeight: '1.1' }}
            >
              <span className="block sm:inline">Collaborative</span>
              <span className="block sm:inline sm:ml-1">Whiteboard</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className={`font-medium hover:text-blue-600 transition-colors ${
                    scrolled || !isHomePage
                      ? "text-gray-600"
                      : "text-white hover:text-blue-200"
                  }`}
                >
                  Dashboard
                </Link>
                <div className="flex items-center space-x-3">
                  <div
                    className={`${
                      scrolled || !isHomePage
                        ? "bg-purple-700 text-white"
                        : "bg-white text-purple-700"
                    } rounded-full w-9 h-9 flex items-center justify-center font-bold shadow-md`}
                  >
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span
                    className={`font-medium ${
                      scrolled || !isHomePage ? "text-gray-700" : "text-white"
                    }`}
                  >
                    {user?.name}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className={`${
                    scrolled || !isHomePage
                      ? "bg-purple-700 text-white hover:bg-purple-800"
                      : "bg-white text-purple-700 hover:bg-purple-50"
                  } px-4 py-2 rounded-lg font-medium transition-colors shadow-md`}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`font-medium transition-colors ${
                    scrolled || !isHomePage
                      ? "text-gray-600 hover:text-blue-600"
                      : "text-white hover:text-blue-200"
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className={`${
                    scrolled || !isHomePage
                      ? "bg-purple-700 text-white hover:bg-purple-800"
                      : "bg-white text-purple-700 hover:bg-purple-50"
                  } px-5 py-2 rounded-lg font-medium transition-colors shadow-md`}
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              className={`${
                scrolled || !isHomePage ? "text-gray-800" : "text-white"
              } focus:outline-none`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="px-4 pt-2 pb-4 space-y-3">
            {isAuthenticated ? (
              <>
                <div className="flex items-center space-x-3 py-3 border-b border-gray-200">
                  <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-gray-800">
                    {user?.name}
                  </span>
                </div>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-gray-600 hover:text-blue-600 font-medium"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left py-2 text-gray-600 hover:text-blue-600 font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-gray-600 hover:text-blue-600 font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-gray-600 hover:text-blue-600 font-medium"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

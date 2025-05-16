import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Add CSS for the registration page - matching the login page exactly
const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem",
    background: "linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)",
    backgroundSize: "400% 400%",
    position: "relative" as const,
    width: "100%",
    boxSizing: "border-box" as const,
  },
  formContainer: {
    width: "100%",
    maxWidth: "450px",
    background: "transparent",
    borderRadius: "1rem",
    overflow: "visible",
    position: "relative" as const,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column" as const,
    gap: "1.5rem",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
  },
  header: {
    background: "linear-gradient(to right, #6b21a8, #4338ca)",
    padding: "2rem 1rem",
    textAlign: "center" as const,
    color: "white",
    position: "relative" as const,
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "1rem 1rem 0 0",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1), 0 10px 30px rgba(107, 33, 168, 0.1)",
    width: "100%",
    overflow: "visible",
    boxSizing: "border-box" as const,
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  backButton: {
    position: "absolute" as const,
    top: "1rem",
    left: "1rem",
    color: "white",
    background: "rgba(255, 255, 255, 0.2)",
    border: "none",
    borderRadius: "50%",
    width: "2.5rem",
    height: "2.5rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.3s ease",
    zIndex: 10,
  },
  backButtonHover: {
    background: "rgba(255, 255, 255, 0.3)",
    transform: "translateY(-2px)",
  },
  headerPattern: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-rule='evenodd'/%3E%3C/svg%3E\")",
  },
  logo: {
    width: "60px",
    height: "60px",
    margin: "0 auto 1rem",
    padding: "12px",
    borderRadius: "50%",
    background: "rgba(255, 255, 255, 0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 0 0 8px rgba(255, 255, 255, 0.05)",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    marginBottom: "0.5rem",
    textShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    lineHeight: "1.3",
    padding: "0",
    maxWidth: "100%",
    display: "block",
    wordWrap: "break-word" as const,
  },
  subtitle: {
    fontSize: "1rem",
    opacity: 0.9,
    maxWidth: "90%",
    margin: "0 auto",
    display: "block",
  },
  formBody: {
    padding: "2rem",
    background: "white",
    borderRadius: "0 0 1rem 1rem",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15), 0 0 30px rgba(107, 33, 168, 0.07)",
    width: "100%",
    boxSizing: "border-box" as const,
  },
  formGroup: {
    marginBottom: "1.5rem",
  },
  label: {
    display: "block",
    marginBottom: "0.5rem",
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "#4b5563",
  },
  input: {
    width: "100%",
    padding: "0.875rem 1rem",
    fontSize: "1rem",
    borderRadius: "0.5rem",
    border: "1px solid #d1d5db",
    transition: "all 0.3s ease",
    outline: "none",
    backgroundColor: "#f9fafb",
    boxSizing: "border-box" as const,
    "&:focus": {
      borderColor: "#6b21a8",
      boxShadow: "0 0 0 3px rgba(107, 33, 168, 0.1)",
      backgroundColor: "#ffffff",
    },
  },
  errorContainer: {
    background: "#fee2e2",
    borderRadius: "0.5rem",
    padding: "1rem",
    marginBottom: "1.5rem",
    display: "flex",
    alignItems: "center",
    color: "#b91c1c",
  },
  errorIcon: {
    width: "1.25rem",
    height: "1.25rem",
    marginRight: "0.75rem",
    flexShrink: 0,
  },
  errorText: {
    fontSize: "0.875rem",
  },
  helperText: {
    fontSize: "0.75rem",
    color: "#6b7280",
    marginTop: "0.375rem",
    marginLeft: "0.5rem",
  },
  submitButton: {
    width: "100%",
    padding: "0.875rem 1.5rem",
    fontSize: "1rem",
    fontWeight: "600",
    color: "white",
    background: "linear-gradient(to right, #6b21a8, #4338ca)",
    border: "none",
    borderRadius: "0.5rem",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    position: "relative" as const,
    overflow: "hidden",
    marginTop: "1rem",
    height: "48px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 6px 10px rgba(0, 0, 0, 0.15)",
      background: "linear-gradient(to right, #5b1a91, #3730a3)",
    },
  },
  spinner: {
    display: "inline-block",
    width: "1.25rem",
    height: "1.25rem",
    border: "2px solid rgba(255, 255, 255, 0.3)",
    borderRadius: "50%",
    borderTopColor: "white",
    animation: "spin 0.8s linear infinite",
  },
  "@keyframes spin": {
    to: { transform: "rotate(360deg)" },
  },
  divider: {
    display: "flex",
    alignItems: "center",
    margin: "1rem 0",
  },
  dividerLine: {
    flexGrow: 1,
    height: "1px",
    background: "rgba(0, 0, 0, 0.1)",
  },
  dividerText: {
    margin: "0 1rem",
    color: "rgba(0, 0, 0, 0.5)",
  },
  loginLink: {
    textAlign: "center" as const,
  },
  loginLinkAnchor: {
    color: "#6b21a8",
    textDecoration: "none",
    fontWeight: "600",
    "&:hover": {
      textDecoration: "underline",
    },
  },
  // Mobile styles
  mobileStyles: {
    container: {
      padding: "0",
    },
    formContainer: {
      maxWidth: "100%",
      margin: "0",
      borderRadius: "0",
      minHeight: "100vh",
    },
    header: {
      padding: "1.5rem 1rem",
    },
    formBody: {
      padding: "1.5rem",
    },
    logo: {
      width: "50px",
      height: "50px",
      margin: "0 auto 0.75rem",
      padding: "10px",
    },
    title: {
      fontSize: "1.25rem",
      padding: "0",
      margin: "0 auto",
      width: "100%",
      wordBreak: "break-word" as const,
    },
    subtitle: {
      fontSize: "0.9rem",
      maxWidth: "90%",
    },
  },
};

const RegisterPage: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const { register, isAuthenticated, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Adjust styles for mobile
  const mobileStyles = {
    container: windowWidth < 768 ? { padding: "0" } : {},
    formContainer:
      windowWidth < 768
        ? {
            maxWidth: "100%",
            margin: "0",
            borderRadius: "0",
            minHeight: "100vh",
          }
        : {},
    logo:
      windowWidth < 768
        ? {
            width: "50px",
            height: "50px",
            margin: "0 auto 0.75rem",
            padding: "10px",
          }
        : {},
    title:
      windowWidth < 768
        ? {
            fontSize: "1.25rem",
            padding: "0",
            margin: "0 auto",
            width: "100%",
            wordBreak: "break-word" as const,
          }
        : {},
    subtitle: windowWidth < 768 ? { fontSize: "0.9rem", maxWidth: "90%" } : {},
    formBody: windowWidth < 768 ? { padding: "1.5rem" } : {},
  };

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

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

  // Mobile responsiveness is now handled by Tailwind CSS classes

  return (
    <div style={{ ...styles.container, ...mobileStyles.container }}>
      <div style={{ ...styles.formContainer, ...mobileStyles.formContainer }}>
        <div style={styles.header}>
          <div style={styles.headerPattern}></div>
          <button
            onClick={() => navigate("/")}
            style={styles.backButton}
            onMouseOver={(e) => {
              Object.assign(e.currentTarget.style, styles.backButtonHover);
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
            }}
            aria-label="Go back"
            type="button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              style={{ width: "1rem", height: "1rem" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div style={{ ...styles.logo, ...mobileStyles.logo }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              style={{ width: "100%", height: "100%" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <h1 style={{ ...styles.title, ...mobileStyles.title }}>
            Join our collaborative whiteboard platform
          </h1>
          <p style={{ ...styles.subtitle, ...mobileStyles.subtitle }}>
            Create an account to start collaborating
          </p>
        </div>

        <div style={{ ...styles.formBody, ...mobileStyles.formBody }}>
          {formError && (
            <div style={styles.errorContainer}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                style={styles.errorIcon}
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
              <span style={styles.errorText}>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label htmlFor="name" style={styles.label}>
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
                style={{
                  ...styles.input,
                  ...(nameFocused ? styles.inputFocus : {}),
                }}
                onFocus={() => setNameFocused(true)}
                onBlur={() => setNameFocused(false)}
              />
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="email" style={styles.label}>
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
                style={{
                  ...styles.input,
                  ...(emailFocused ? styles.inputFocus : {}),
                }}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
              />
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="password" style={styles.label}>
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
                style={{
                  ...styles.input,
                  ...(passwordFocused ? styles.inputFocus : {}),
                }}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
              />

              <div style={styles.helperText}>
                Password must be at least 6 characters long
              </div>
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="confirmPassword" style={styles.label}>
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
                style={{
                  ...styles.input,
                  ...(confirmPasswordFocused ? styles.inputFocus : {}),
                  ...(confirmPassword && password !== confirmPassword
                    ? {
                        borderColor: "#ef4444",
                        boxShadow: "0 0 0 3px rgba(239, 68, 68, 0.1)",
                      }
                    : {}),
                }}
                onFocus={() => setConfirmPasswordFocused(true)}
                onBlur={() => setConfirmPasswordFocused(false)}
              />
              {confirmPassword && password !== confirmPassword && (
                <div style={{ ...styles.helperText, color: "#ef4444" }}>
                  Passwords do not match
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={styles.submitButton}
            >
              {loading ? <div style={styles.spinner}></div> : "Create Account"}
            </button>
          </form>

          <div style={styles.divider}>
            <div style={styles.dividerLine}></div>
            <span style={styles.dividerText}>OR</span>
            <div style={styles.dividerLine}></div>
          </div>

          <div style={styles.loginLink}>
            <p>
              Already have an account?{" "}
              <a
                href="/login"
                style={styles.loginLinkAnchor}
                onMouseOver={(e) => (e.currentTarget.style.color = "#581c87")}
                onMouseOut={(e) => (e.currentTarget.style.color = "#6b21a8")}
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/login");
                }}
              >
                Sign in here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

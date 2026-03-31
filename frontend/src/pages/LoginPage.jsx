import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    try {
      // Here you would make an API call to your backend
      const response = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Login successful:", data);
        // Store token and redirect to dashboard
        localStorage.setItem("token", data.token);
        navigate("/my-profile");
      } else {
        const errorData = await response.json();
        setErrors({ submit: errorData.message || "Login failed" });
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrors({ submit: "Network error. Please try again." });
    }
  };

  const handleOAuthLogin = (provider) => {
    // Redirect to OAuth provider for login
    const baseUrl = import.meta.env.PROD
      ? "https://your-domain.com"
      : "http://localhost:3001";

    window.location.href = `${baseUrl}/api/auth/${provider}`;
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-dark-900 overflow-x-hidden">
      {/* Floating Navigation Bar */}
      <div className="fixed top-2 left-4 right-4 z-50">
        <div className="max-w-7xl mx-auto">
          <nav className="flex items-center justify-between px-3 py-1.5 bg-dark-800/95 backdrop-blur-xl border border-neon-blue/20 rounded-xl shadow-2xl shadow-neon-blue/10">
            {/* Logo Section */}
            <Link to="/" className="flex items-center gap-2">
              <div className="size-6 md:size-7 relative">
                <svg
                  viewBox="0 0 48 48"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full text-neon-blue drop-shadow-lg"
                >
                  <path
                    d="M39.5563 34.1455V13.8546C39.5563 15.708 36.8773 17.3437 32.7927 18.3189C30.2914 18.916 27.263 19.2655 24 19.2655C20.737 19.2655 17.7086 18.916 15.2073 18.3189C11.1227 17.3437 8.44365 15.708 8.44365 13.8546V34.1455C8.44365 35.9988 11.1227 37.6346 15.2073 38.6098C17.7086 39.2069 20.737 39.5564 24 39.5564C27.263 39.5564 30.2914 39.2069 32.7927 38.6098C36.8773 37.6346 39.5563 35.9988 39.5563 34.1455Z"
                    fill="currentColor"
                  />
                </svg>
                <div className="absolute inset-0 bg-neon-blue/20 rounded-full blur-md -z-10"></div>
              </div>
              <span className="text-white text-base md:text-lg font-bold font-heading tracking-tight">
                ElevateMe
              </span>
            </Link>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-gray-300 hover:text-white transition-colors rounded-md hover:bg-dark-900/40"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                <span>Back to Home</span>
              </Link>
              <Link
                to="/developer/signup"
                className="px-3 py-1.5 text-sm bg-neon-blue text-dark-900 rounded-md hover:bg-neon-blue/90 transition-colors font-medium"
              >
                Sign Up
              </Link>
            </div>
          </nav>
        </div>
      </div>

      {/* Add top padding to content to account for floating nav */}
      <div className="h-12 md:h-14"></div>

      <div className="layout-container flex h-full grow flex-col">
        {/* Main Content */}
        <div className="flex flex-1 justify-center py-10 px-6">
          <div className="flex flex-col max-w-[480px] w-full">
            <div className="text-center mb-8">
              <h1 className="text-white text-3xl font-bold leading-tight tracking-[-0.015em] mb-2 font-heading animate-glow">
                Welcome Back
              </h1>
              <p className="text-gray-300 text-base font-normal leading-normal">
                Sign in to your account to continue
              </p>
            </div>

            <div className="bg-dark-800 rounded-xl p-6 border border-neon-blue/20 shadow-neon">
              {/* Error Display */}
              {errors.submit && (
                <div className="mb-4 p-3 bg-red-500 bg-opacity-10 border border-red-500 border-opacity-30 rounded-lg">
                  <p className="text-red-400 text-sm">{errors.submit}</p>
                </div>
              )}

              {/* OAuth Buttons */}
              <div className="space-y-3 mb-6">
                <button
                  onClick={() => handleOAuthLogin("google")}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-gray-100 rounded-lg transition-all duration-300 hover:shadow-neon-button"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="text-gray-700 font-medium">
                    Continue with Google
                  </span>
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center mb-6">
                <div className="flex-1 border-t border-neon-blue opacity-30"></div>
                <span className="px-4 text-gray-400 text-sm">
                  or sign in with email
                </span>
                <div className="flex-1 border-t border-neon-blue opacity-30"></div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-dark-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-all duration-300 ${
                      errors.email
                        ? "border-red-500 focus:border-red-500"
                        : "border-neon-blue/30 focus:border-neon-blue focus:shadow-neon-button"
                    }`}
                    placeholder="Enter your email"
                    required
                  />
                  {errors.email && (
                    <p className="mt-1 text-red-400 text-sm">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-dark-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-all duration-300 ${
                      errors.password
                        ? "border-red-500 focus:border-red-500"
                        : "border-neon-blue/30 focus:border-neon-blue focus:shadow-neon-button"
                    }`}
                    placeholder="Enter your password"
                    required
                  />
                  {errors.password && (
                    <p className="mt-1 text-red-400 text-sm">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 text-neon-blue bg-dark-700 border-neon-blue/30 rounded focus:ring-neon-blue focus:ring-2"
                    />
                    <span className="ml-2 text-gray-400 text-sm">
                      Remember me
                    </span>
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-neon-blue text-sm hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center px-4 py-3 bg-neon-blue hover:bg-neon-blue-light text-dark-900 font-bold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-neon-button hover:shadow-neon-strong"
                  disabled={Object.keys(errors).length > 0}
                >
                  Sign In
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-400 text-sm">
                  Don&apos;t have an account?{" "}
                  <Link
                    to="/developer/signup"
                    className="text-neon-blue hover:underline"
                  >
                    Sign up as Developer
                  </Link>{" "}
                  {/* or{" "}
                  <Link
                    to="/employer/signup"
                    className="text-neon-blue hover:underline"
                  >
                    Sign up as Employer
                  </Link> */}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

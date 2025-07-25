import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";

const TopNavigation = ({ searchQuery, onSearchChange }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Get user data from localStorage
    const user = localStorage.getItem("user");
    if (user) {
      try {
        setUserData(JSON.parse(user));
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const isLoggedIn = localStorage.getItem("token");

  // Function to check if a path is active
  const isActivePath = (path) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  // Get floating navigation pill styles
  const getFloatingNavStyles = (path) => {
    const baseStyles =
      "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-medium transition-all duration-300 relative";
    const activeStyles =
      "text-neon-blue bg-neon-blue/15 shadow-lg shadow-neon-blue/20";
    const inactiveStyles =
      "text-gray-300 hover:text-white hover:bg-dark-800/60";

    return `${baseStyles} ${
      isActivePath(path) ? activeStyles : inactiveStyles
    }`;
  };

  return (
    <>
      {/* Floating Navigation Bar */}
      <div className="fixed top-2 left-4 right-4 z-50">
        <div className="max-w-7xl mx-auto">
          <nav className="flex items-center justify-between px-3 py-1.5 bg-dark-800/95 backdrop-blur-xl border border-neon-blue/20 rounded-xl shadow-2xl shadow-neon-blue/10">
            {/* Logo Section */}
            <div className="flex items-center gap-2">
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
            </div>

            {/* Center Navigation - Desktop */}
            <div className="hidden lg:flex items-center gap-2">
              {/* Search Bar - Only show on explore page */}
              {location.pathname === "/explore" && onSearchChange && (
                <div className="flex items-center bg-dark-900/60 rounded-lg border border-neon-blue/20 px-3 py-1.5 min-w-72 mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14px"
                    height="14px"
                    fill="currentColor"
                    viewBox="0 0 256 256"
                    className="text-neon-blue/70 mr-2"
                  >
                    <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
                  </svg>
                  <input
                    placeholder="Search projects..."
                    className="flex-1 bg-transparent text-white placeholder:text-neon-blue/50 focus:outline-none text-sm"
                    value={searchQuery || ""}
                    onChange={onSearchChange}
                  />
                </div>
              )}

              {/* Navigation Pills */}
              <div className="flex items-center gap-0.5 bg-dark-900/40 rounded-lg p-0.5 border border-neon-blue/10">
                <button
                  onClick={() => navigate("/explore")}
                  className={getFloatingNavStyles("/explore")}
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
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <span className="hidden xl:inline">Explore</span>
                </button>
                {isLoggedIn && (
                  <>
                    <button
                      onClick={() => navigate("/my-profile")}
                      className={getFloatingNavStyles("/my-profile")}
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
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span className="hidden xl:inline">Profile</span>
                    </button>
                    <button
                      onClick={() => navigate("/upload")}
                      className={getFloatingNavStyles("/upload")}
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
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      <span className="hidden xl:inline">Upload</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {/* User Section */}
              {isLoggedIn ? (
                <div className="flex items-center gap-3">
                  {/* User Avatar */}
                  <button
                    onClick={() => navigate("/my-profile")}
                    className="relative group"
                  >
                    <div
                      className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-7 md:size-8 border-2 border-neon-blue/30 hover:border-neon-blue transition-all duration-300 hover:shadow-lg hover:shadow-neon-blue/25"
                      style={{
                        backgroundImage: userData?.avatar
                          ? `url("${userData.avatar}")`
                          : `url("https://ui-avatars.com/api/?name=${encodeURIComponent(
                              userData?.fullName || userData?.name || "User"
                            )}&background=06b6d4&color=fff")`,
                      }}
                      title={
                        userData?.fullName || userData?.name || "User Profile"
                      }
                    />
                    <div className="absolute inset-0 bg-neon-blue/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>

                  {/* Logout Button - Desktop */}
                  <button
                    onClick={handleLogout}
                    className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-gray-300 hover:text-white transition-colors rounded-md hover:bg-dark-900/40"
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
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate("/login")}
                    className="px-3 py-1.5 text-sm text-white border border-neon-blue/30 rounded-md hover:bg-neon-blue/10 transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => navigate("/signup")}
                    className="px-3 py-1.5 text-sm bg-neon-blue text-dark-900 rounded-md hover:bg-neon-blue/90 transition-colors font-medium"
                  >
                    Sign Up
                  </button>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg bg-dark-900/60 border border-neon-blue/20 text-white hover:bg-dark-900/80 transition-colors"
              >
                <svg
                  className={`w-4 h-4 transition-transform duration-300 ${
                    isMobileMenuOpen ? "rotate-90" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* Add top padding to content to account for floating nav */}
      <div className="h-12 md:h-14"></div>

      {/* Modern Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={toggleMobileMenu}
          />

          {/* Slide-out Menu */}
          <div className="absolute top-0 right-0 h-full w-80 bg-dark-800/98 backdrop-blur-2xl border-l border-neon-blue/20 shadow-2xl shadow-neon-blue/10 backdrop-saturate-150">
            <div className="flex flex-col h-full">
              {/* Menu Header */}
              <div className="flex items-center justify-between p-6 border-b border-neon-blue/20">
                <div className="flex items-center gap-3">
                  <div className="size-8 text-neon-blue">
                    <svg
                      viewBox="0 0 48 48"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-full h-full"
                    >
                      <path
                        d="M39.5563 34.1455V13.8546C39.5563 15.708 36.8773 17.3437 32.7927 18.3189C30.2914 18.916 27.263 19.2655 24 19.2655C20.737 19.2655 17.7086 18.916 15.2073 18.3189C11.1227 17.3437 8.44365 15.708 8.44365 13.8546V34.1455C8.44365 35.9988 11.1227 37.6346 15.2073 38.6098C17.7086 39.2069 20.737 39.5564 24 39.5564C27.263 39.5564 30.2914 39.2069 32.7927 38.6098C36.8773 37.6346 39.5563 35.9988 39.5563 34.1455Z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                  <h2 className="text-white text-lg font-bold font-heading">
                    ElevateMe
                  </h2>
                </div>
                <button
                  onClick={toggleMobileMenu}
                  className="text-white hover:text-neon-blue transition-colors p-2 rounded-lg hover:bg-dark-900/40"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Search Bar for Mobile - Only on explore page */}
              {location.pathname === "/explore" && onSearchChange && (
                <div className="p-6 border-b border-neon-blue/10">
                  <div className="flex items-center bg-dark-900/60 rounded-xl border border-neon-blue/20 px-4 py-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16px"
                      height="16px"
                      fill="currentColor"
                      viewBox="0 0 256 256"
                      className="text-neon-blue/70 mr-3"
                    >
                      <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
                    </svg>
                    <input
                      placeholder="Search projects..."
                      className="flex-1 bg-transparent text-white placeholder:text-neon-blue/50 focus:outline-none"
                      value={searchQuery || ""}
                      onChange={onSearchChange}
                    />
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              <div className="flex-1 p-6 space-y-3">
                <button
                  onClick={() => {
                    navigate("/explore");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${
                    isActivePath("/explore")
                      ? "text-neon-blue bg-neon-blue/15 border border-neon-blue/30"
                      : "text-white hover:text-neon-blue hover:bg-dark-900/40"
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <span className="text-lg font-medium">Explore Projects</span>
                </button>

                {isLoggedIn && (
                  <>
                    <button
                      onClick={() => {
                        navigate("/my-profile");
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${
                        isActivePath("/my-profile")
                          ? "text-neon-blue bg-neon-blue/15 border border-neon-blue/30"
                          : "text-white hover:text-neon-blue hover:bg-dark-900/40"
                      }`}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span className="text-lg font-medium">My Profile</span>
                    </button>

                    <button
                      onClick={() => {
                        navigate("/upload");
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${
                        isActivePath("/upload")
                          ? "text-neon-blue bg-neon-blue/15 border border-neon-blue/30"
                          : "text-white hover:text-neon-blue hover:bg-dark-900/40"
                      }`}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      <span className="text-lg font-medium">
                        Upload Project
                      </span>
                    </button>
                  </>
                )}
              </div>

              {/* User Section */}
              {isLoggedIn ? (
                <div className="p-6 border-t border-neon-blue/20">
                  <div className="flex items-center gap-3 p-4 bg-dark-900/40 rounded-xl border border-neon-blue/10 mb-4">
                    <div
                      className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-12 border-2 border-neon-blue/30"
                      style={{
                        backgroundImage: userData?.avatar
                          ? `url("${userData.avatar}")`
                          : `url("https://ui-avatars.com/api/?name=${encodeURIComponent(
                              userData?.fullName || userData?.name || "User"
                            )}&background=06b6d4&color=fff")`,
                      }}
                    />
                    <div className="flex-1">
                      <p className="text-white font-medium">
                        {userData?.fullName || userData?.name || "User"}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {userData?.email || ""}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    <span className="text-lg font-medium">Logout</span>
                  </button>
                </div>
              ) : (
                <div className="p-6 border-t border-neon-blue/20 space-y-3">
                  <button
                    onClick={() => {
                      navigate("/login");
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 text-white border border-neon-blue/30 rounded-xl hover:bg-neon-blue/10 transition-colors text-lg font-medium"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      navigate("/signup");
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 bg-neon-blue text-dark-900 rounded-xl hover:bg-neon-blue/90 transition-colors text-lg font-medium"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

TopNavigation.propTypes = {
  searchQuery: PropTypes.string,
  onSearchChange: PropTypes.func,
};

export default TopNavigation;

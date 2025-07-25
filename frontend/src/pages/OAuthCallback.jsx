import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const OAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const code = searchParams.get("code");
        const state = searchParams.get("state");
        const error = searchParams.get("error");
        const provider = window.location.pathname.split("/")[2]; // Extract provider from URL: /auth/google/callback -> google

        if (error) {
          throw new Error(`OAuth error: ${error}`);
        }

        if (!code) {
          throw new Error("No authorization code received");
        }

        // Get pending user type from localStorage (for signup flow)
        const pendingUserType = localStorage.getItem("pendingUserType");

        // Exchange code for tokens
        const backendUrl = import.meta.env.PROD
          ? "https://your-domain.com"
          : "http://localhost:3001";

        const response = await fetch(
          `${backendUrl}/api/auth/${provider}/callback`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              code,
              state,
              userType: pendingUserType,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Authentication failed");
        }

        const data = await response.json();

        // Store token and user data
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Clean up pending user type
        localStorage.removeItem("pendingUserType");

        // Redirect based on user type or default to profile
        if (data.user.userType === "employer") {
          navigate("/employer/dashboard");
        } else {
          navigate("/my-profile");
        }
      } catch (error) {
        console.error("OAuth callback error:", error);
        setError(error.message);
        setLoading(false);

        // Redirect to login page after 3 seconds
        setTimeout(() => {
          navigate("/login");
        }, 3002);
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate]);

  if (loading && !error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f2424]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00ffff] mb-4 mx-auto"></div>
          <h2 className="text-white text-xl font-semibold mb-2">
            Completing authentication...
          </h2>
          <p className="text-[#8dcece]">Please wait while we sign you in.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f2424]">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mb-4">
            <svg
              className="w-16 h-16 text-red-500 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-white text-xl font-semibold mb-2">
            Authentication Failed
          </h2>
          <p className="text-[#8dcece] mb-4">{error}</p>
          <p className="text-[#8dcece] text-sm">Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default OAuthCallback;

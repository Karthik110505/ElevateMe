import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const AuthSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const userData = searchParams.get("user");

    if (token && userData) {
      try {
        // Store token and user data
        localStorage.setItem("token", token);
        localStorage.setItem("user", userData);

        // Parse user data to determine redirect
        const user = JSON.parse(decodeURIComponent(userData));

        // Redirect based on user type
        if (user.userType === "employer") {
          navigate("/employer/dashboard");
        } else {
          navigate("/my-profile");
        }
      } catch (error) {
        console.error("Error processing auth success:", error);
        navigate("/login?error=invalid_response");
      }
    } else {
      // Missing required parameters
      navigate("/login?error=missing_credentials");
    }
  }, [searchParams, navigate]);

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
};

export default AuthSuccess;

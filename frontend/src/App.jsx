import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import PublicProfile from "./pages/PublicProfile";
import UploadProject from "./pages/UploadProject";
import ExploreProjects from "./pages/ExploreProjects";
import ProjectDetail from "./pages/ProjectDetail";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import OAuthCallback from "./pages/OAuthCallback";
import AuthSuccess from "./pages/AuthSuccess";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/developer/signup" element={<SignupPage />} />
      <Route path="/employer/signup" element={<SignupPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* OAuth Callback Routes */}
      <Route path="/auth/google/callback" element={<OAuthCallback />} />
      <Route path="/auth/github/callback" element={<OAuthCallback />} />
      <Route path="/auth/linkedin/callback" element={<OAuthCallback />} />
      <Route path="/auth/success" element={<AuthSuccess />} />

      {/* Public Profile Routes */}
      <Route path="/profile/alex" element={<PublicProfile isOwner={false} />} />
      <Route
        path="/profile/:userId"
        element={<PublicProfile isOwner={false} />}
      />

      {/* Protected Routes - Require Authentication */}
      <Route
        path="/my-profile"
        element={
          <ProtectedRoute>
            <PublicProfile isOwner={true} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/upload"
        element={
          <ProtectedRoute>
            <UploadProject />
          </ProtectedRoute>
        }
      />
      <Route path="/explore" element={<ExploreProjects />} />
      <Route path="/projects/:projectId" element={<ProjectDetail />} />
    </Routes>
  );
}

export default App;

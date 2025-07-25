import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import TopNavigation from "../components/TopNavigation";

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    // Fetch current user info if logged in
    if (token) {
      fetchCurrentUser();
    }
  }, []);

  // Fetch current user info
  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3001/api/users/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data.user);
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  // Handle like/unlike project
  const handleLikeProject = async () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3001/api/projects/${projectId}/like`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Update the project state with new like status
        setProject((prev) => ({
          ...prev,
          likeCount: data.likeCount,
          isLiked: data.isLiked,
        }));
      }
    } catch (error) {
      console.error("Error liking project:", error);
    }
  };

  // Fetch project data from API
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");

        const headers = {};
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(
          `${
            import.meta.env.PROD
              ? "https://your-domain.com"
              : "http://localhost:3001"
          }/api/projects/${projectId}`,
          { headers }
        );

        if (!response.ok) {
          throw new Error("Project not found");
        }

        const data = await response.json();
        if (data.success) {
          setProject(data.project);

          // Check if this project has been viewed in this session
          const viewedProjects = JSON.parse(
            sessionStorage.getItem("viewedProjects") || "[]"
          );
          const hasViewed = viewedProjects.includes(projectId);

          // Only increment view count if not viewed in this session
          if (!hasViewed) {
            try {
              const viewResponse = await fetch(
                `http://localhost:3001/api/projects/${projectId}/view`,
                {
                  method: "POST",
                }
              );

              if (viewResponse.ok) {
                const viewData = await viewResponse.json();
                // Update the project state with new view count
                setProject((prev) => ({
                  ...prev,
                  views: viewData.views,
                }));

                // Mark this project as viewed in this session
                const updatedViewedProjects = [...viewedProjects, projectId];
                sessionStorage.setItem(
                  "viewedProjects",
                  JSON.stringify(updatedViewedProjects)
                );
              }
            } catch (viewError) {
              console.error("Error incrementing view count:", viewError);
            }
          }
        } else {
          throw new Error(data.message || "Failed to fetch project");
        }
      } catch (error) {
        console.error("Error fetching project:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading project...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">Error: {error}</div>
          <button
            onClick={() => navigate("/explore")}
            className="px-4 py-2 bg-cyan-400 text-dark-900 rounded-lg hover:bg-cyan-300 transition-colors"
          >
            Back to Explore
          </button>
        </div>
      </div>
    );
  }

  // Project not found
  if (!project) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Project not found</div>
          <button
            onClick={() => navigate("/explore")}
            className="px-4 py-2 bg-cyan-400 text-dark-900 rounded-lg hover:bg-cyan-300 transition-colors"
          >
            Back to Explore
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      {/* Navigation */}
      <TopNavigation />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Project Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => navigate("/explore")}
              className="flex items-center gap-2 text-neon-blue hover:text-neon-blue/80 transition-colors"
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Explore
            </button>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-3 font-heading text-white">
            {project.title}
          </h1>
          <div className="flex items-center gap-4 mb-4">
            <Link
              to={`/profile/${project.owner?._id}`}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div
                className="w-8 h-8 bg-center bg-no-repeat bg-cover rounded-full border border-neon-blue/20"
                style={{
                  backgroundImage: `url("${
                    project.owner?.avatar || "https://via.placeholder.com/32"
                  }")`,
                }}
              />
              <div>
                <p className="text-white font-medium text-sm hover:text-neon-blue transition-colors">
                  {project.owner?.fullName || project.owner?.name || "Unknown"}
                </p>
                {/* Only show email if current user is the project owner */}
                {currentUser && currentUser._id === project.owner?._id && (
                  <p className="text-gray-400 text-xs">
                    {project.owner?.email || ""}
                  </p>
                )}
              </div>
            </Link>
            <div className="text-gray-400 text-xs">
              {new Date(project.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </div>
          </div>
          <p className="text-gray-300 text-base leading-relaxed mb-4">
            {project.description}
          </p>

          {/* Tech Stack */}
          {project.technologies && project.technologies.length > 0 && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2 text-white">
                Technologies
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-neon-blue/10 text-neon-blue rounded-full text-xs font-medium"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {project.tags && project.tags.length > 0 && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2 text-white">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-dark-700 text-gray-300 rounded-full text-xs"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Project Media */}
        <div className="mb-6 flex justify-center">
          <div className="w-full max-w-4xl">
            {project.videoUrl ? (
              <div className="aspect-video bg-black rounded-lg overflow-hidden border border-neon-blue/20 shadow-lg">
                <iframe
                  src={project.videoUrl
                    .replace("youtu.be/", "youtube.com/embed/")
                    .replace("watch?v=", "embed/")}
                  title={project.title}
                  className="w-full h-full"
                  frameBorder="0"
                  allowFullScreen
                />
              </div>
            ) : project.mainImage ||
              (project.images && project.images.length > 0) ? (
              <div className="aspect-video bg-black rounded-lg overflow-hidden border border-neon-blue/20 shadow-lg">
                <img
                  src={project.mainImage || project.images[0]?.url}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-video bg-dark-800 rounded-lg flex items-center justify-center border border-neon-blue/20 shadow-lg">
                <p className="text-gray-400 text-sm">No media available</p>
              </div>
            )}
          </div>
        </div>

        {/* Project Links */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-3">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 bg-dark-800 hover:bg-dark-700 border border-neon-blue/20 hover:border-neon-blue/40 rounded-lg transition-all text-sm"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                <span className="text-white">GitHub</span>
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 bg-neon-blue hover:bg-neon-blue/90 text-dark-900 rounded-lg transition-all text-sm font-medium"
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
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                <span>Live Demo</span>
              </a>
            )}
          </div>
        </div>

        {/* Project Stats with Like Button */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-gray-400 text-sm">
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
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              <span className="text-white font-medium">
                {project.views || 0}
              </span>{" "}
              views
            </div>

            {/* Like Button - only for logged in users */}
            {isLoggedIn ? (
              <button
                onClick={handleLikeProject}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  project.isLiked
                    ? "bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/40"
                    : "bg-dark-800 text-white hover:bg-red-500/20 hover:text-red-400 border border-neon-blue/20 hover:border-red-500/40"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill={project.isLiked ? "currentColor" : "none"}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                <span>{project.isLiked ? "Liked" : "Like"}</span>
                <span className="text-gray-400">
                  ({project.likeCount || 0})
                </span>
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-gray-400 text-sm">
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
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  <span className="text-white font-medium">
                    {project.likeCount || 0}
                  </span>{" "}
                  likes
                </div>
                <button
                  onClick={() => navigate("/login")}
                  className="px-3 py-1.5 text-xs bg-neon-blue/20 text-neon-blue hover:bg-neon-blue/30 rounded-md transition-colors border border-neon-blue/30 hover:border-neon-blue/50"
                >
                  Login to Like
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Additional Information */}
        {project.features && project.features.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-white">
              Key Features
            </h3>
            <div className="bg-dark-800/50 border border-neon-blue/20 rounded-lg p-4">
              <ul className="space-y-2 text-gray-300 text-sm">
                {project.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-neon-blue mt-1 flex-shrink-0">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;

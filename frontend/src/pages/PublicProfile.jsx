import TopNavigation from "../components/TopNavigation";
import PropTypes from "prop-types";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const PublicProfile = ({ isOwner = false }) => {
  const navigate = useNavigate();
  const { userId } = useParams(); // Get userId from URL parameters
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userProjects, setUserProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);

  // Edit states
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [isEditingSocial, setIsEditingSocial] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [showProfilePhotoMenu, setShowProfilePhotoMenu] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Edit form data
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editSkills, setEditSkills] = useState([]);
  const [editSocialLinks, setEditSocialLinks] = useState({
    portfolio: "",
    github: "",
    linkedin: "",
    twitter: "",
  });
  const [editProject, setEditProject] = useState({
    title: "",
    description: "",
    technologies: [],
    githubUrl: "",
    liveUrl: "",
  });

  // Fetch user projects
  const fetchUserProjects = async () => {
    try {
      setProjectsLoading(true);
      const token = localStorage.getItem("token");

      let endpoint;
      let headers = {};

      if (userId) {
        // Viewing another user's projects - public endpoint
        endpoint = `http://localhost:3001/api/projects/user/${userId}`;
        console.log(
          "Fetching projects for user:",
          userId,
          "from endpoint:",
          endpoint
        );
      } else {
        // Viewing own projects - protected endpoint
        endpoint = "http://localhost:3001/api/projects/my-projects";
        headers.Authorization = `Bearer ${token}`;
        console.log("Fetching own projects from endpoint:", endpoint);
      }

      const response = await fetch(endpoint, { headers });
      console.log("Projects API response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Projects data received:", data);
        setUserProjects(data.projects || []);
      } else {
        const errorData = await response.json();
        console.error("Failed to fetch user projects:", errorData);
        setUserProjects([]);
      }
    } catch (error) {
      console.error("Error fetching user projects:", error);
      setUserProjects([]);
    } finally {
      setProjectsLoading(false);
    }
  };

  // Initialize edit data when userData changes
  useEffect(() => {
    if (userData) {
      setEditName(userData.fullName || userData.name || "");
      setEditBio(userData.bio || "");
      setEditSkills(userData.skills || []);
      setEditSocialLinks({
        portfolio: userData.socialLinks?.portfolio || userData.portfolio || "",
        github: userData.socialLinks?.github || userData.github || "",
        linkedin: userData.socialLinks?.linkedin || userData.linkedin || "",
        twitter: userData.socialLinks?.twitter || userData.twitter || "",
      });
    }
  }, [userData]);

  // Update user profile API call
  const updateUserProfile = async (updates) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token");
      }

      const response = await fetch(
        `${
          import.meta.env.PROD
            ? "https://your-domain.com"
            : "http://localhost:3001"
        }/api/users/profile`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const data = await response.json();
      if (data.success) {
        setUserData(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        return true;
      } else {
        throw new Error(data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
      return false;
    }
  };

  // Edit handlers
  const handleNameEdit = () => {
    setIsEditingName(true);
  };

  const handleNameSave = async () => {
    if (editName.trim()) {
      const success = await updateUserProfile({ fullName: editName.trim() });
      if (success) {
        setIsEditingName(false);
      }
    }
  };

  const handleNameCancel = () => {
    setEditName(userData?.fullName || userData?.name || "");
    setIsEditingName(false);
  };

  const handleBioEdit = () => {
    setIsEditingBio(true);
  };

  const handleBioSave = async () => {
    const success = await updateUserProfile({ bio: editBio });
    if (success) {
      setIsEditingBio(false);
    }
  };

  const handleBioCancel = () => {
    setEditBio(userData?.bio || "");
    setIsEditingBio(false);
  };

  const handleSkillsEdit = () => {
    setIsEditingSkills(true);
  };

  const handleSkillsAdd = (skillText) => {
    if (skillText.trim() && !editSkills.includes(skillText.trim())) {
      setEditSkills([...editSkills, skillText.trim()]);
    }
  };

  const handleSkillsRemove = (skillToRemove) => {
    setEditSkills(editSkills.filter((skill) => skill !== skillToRemove));
  };

  const handleSkillsSave = async () => {
    const success = await updateUserProfile({ skills: editSkills });
    if (success) {
      setIsEditingSkills(false);
    }
  };

  const handleSkillsCancel = () => {
    setEditSkills(userData?.skills || []);
    setIsEditingSkills(false);
  };

  const handleSocialEdit = () => {
    setIsEditingSocial(true);
  };

  const handleSocialSave = async () => {
    const success = await updateUserProfile({ socialLinks: editSocialLinks });
    if (success) {
      setIsEditingSocial(false);
    }
  };

  const handleSocialCancel = () => {
    setEditSocialLinks({
      portfolio: userData?.socialLinks?.portfolio || userData?.portfolio || "",
      github: userData?.socialLinks?.github || userData?.github || "",
      linkedin: userData?.socialLinks?.linkedin || userData?.linkedin || "",
      twitter: userData?.socialLinks?.twitter || userData?.twitter || "",
    });
    setIsEditingSocial(false);
  };

  // Project editing handlers
  const handleProjectEdit = (project) => {
    setEditingProjectId(project._id);
    setEditProject({
      title: project.title || "",
      description: project.description || "",
      technologies: project.technologies || [],
      githubUrl: project.githubUrl || "",
      liveUrl: project.liveUrl || "",
    });
  };

  const handleProjectSave = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token");
      }

      const response = await fetch(
        `${
          import.meta.env.PROD
            ? "https://your-domain.com"
            : "http://localhost:3001"
        }/api/projects/${editingProjectId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editProject),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update project");
      }

      const data = await response.json();
      if (data.success) {
        // Update the local projects list
        setUserProjects((prevProjects) =>
          prevProjects.map((project) =>
            project._id === editingProjectId
              ? { ...project, ...editProject }
              : project
          )
        );
        setEditingProjectId(null);
        setEditProject({
          title: "",
          description: "",
          technologies: [],
          githubUrl: "",
          liveUrl: "",
        });
      } else {
        throw new Error(data.message || "Failed to update project");
      }
    } catch (error) {
      console.error("Error updating project:", error);
      alert("Failed to update project. Please try again.");
    }
  };

  const handleProjectCancel = () => {
    setEditingProjectId(null);
    setEditProject({
      title: "",
      description: "",
      technologies: [],
      githubUrl: "",
      liveUrl: "",
    });
  };

  const handleProjectDelete = async (projectId) => {
    setProjectToDelete(projectId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token");
      }

      const response = await fetch(
        `${
          import.meta.env.PROD
            ? "https://your-domain.com"
            : "http://localhost:3001"
        }/api/projects/${projectToDelete}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete project");
      }

      // Remove the project from local state
      setUserProjects((prevProjects) =>
        prevProjects.filter((project) => project._id !== projectToDelete)
      );

      setShowDeleteConfirm(false);
      setProjectToDelete(null);
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("Failed to delete project. Please try again.");
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setProjectToDelete(null);
  };

  const handleTechAdd = (tech) => {
    if (tech.trim() && !editProject.technologies.includes(tech.trim())) {
      setEditProject((prev) => ({
        ...prev,
        technologies: [...prev.technologies, tech.trim()],
      }));
    }
  };

  const handleTechRemove = (techToRemove) => {
    setEditProject((prev) => ({
      ...prev,
      technologies: prev.technologies.filter((tech) => tech !== techToRemove),
    }));
  };

  // Profile photo management handlers
  // Profile photo file upload
  const handleProfilePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file");
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size should be less than 5MB");
      return;
    }

    try {
      setUploadingPhoto(true);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token");
      }

      const formData = new FormData();
      formData.append("profileImage", file);

      const response = await fetch(
        `${
          import.meta.env.PROD
            ? "https://your-domain.com"
            : "http://localhost:3001"
        }/api/users/profile-image`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to upload profile image");
      }

      const data = await response.json();
      if (data.success) {
        setUserData((prev) => {
          const nextUserData = {
            ...prev,
            avatar: data.profileImageUrl,
            profileImage: data.profileImageUrl,
            profilePicture: data.profileImageUrl,
          };
          localStorage.setItem("user", JSON.stringify(nextUserData));
          return nextUserData;
        });
        setShowProfilePhotoMenu(false);
      } else {
        throw new Error(data.message || "Failed to upload profile image");
      }
    } catch (error) {
      console.error("Error uploading profile image:", error);
      alert(`Failed to upload profile image: ${error.message}`);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemoveProfilePhoto = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token");
      }

      const response = await fetch(
        `${
          import.meta.env.PROD
            ? "https://your-domain.com"
            : "http://localhost:3001"
        }/api/users/profile`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ avatar: null }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to remove profile image");
      }

      const data = await response.json();
      if (data.success) {
        setUserData((prev) => ({ ...prev, avatar: null }));
        localStorage.setItem(
          "user",
          JSON.stringify({ ...userData, avatar: null })
        );
        setShowProfilePhotoMenu(false);
      } else {
        throw new Error(data.message || "Failed to remove profile image");
      }
    } catch (error) {
      console.error("Error removing profile image:", error);
      alert("Failed to remove profile image. Please try again.");
    }
  };

  // Get user data from database
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");

        // Determine which endpoint to use
        let endpoint,
          headers = { "Content-Type": "application/json" };

        if (userId) {
          // Viewing another user's profile - public endpoint
          endpoint = `${
            import.meta.env.PROD
              ? "https://your-domain.com"
              : "http://localhost:3001"
          }/api/users/${userId}`;
        } else {
          // Viewing own profile - protected endpoint
          if (!token) {
            navigate("/login");
            return;
          }
          endpoint = `${
            import.meta.env.PROD
              ? "https://your-domain.com"
              : "http://localhost:3001"
          }/api/users/profile`;
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(endpoint, { headers });

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();
        if (data.success) {
          setUserData(data.user);
          // Only update localStorage for own profile
          if (!userId) {
            localStorage.setItem("user", JSON.stringify(data.user));
          }
        } else {
          throw new Error(data.message || "Failed to fetch user data");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);

        // Fall back to localStorage data only for own profile
        if (!userId) {
          const user = localStorage.getItem("user");
          if (user) {
            try {
              const parsedUser = JSON.parse(user);
              setUserData(parsedUser);
            } catch (parseError) {
              console.error("Error parsing stored user data:", parseError);
              navigate("/login");
            }
          } else {
            navigate("/login");
          }
        } else {
          // For other user's profile, show error state instead of redirecting
          console.error("Failed to fetch user profile data");
          setUserData(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate, userId]);

  // Fetch user projects
  useEffect(() => {
    fetchUserProjects();
  }, [isOwner, userId]);

  // Close profile photo menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showProfilePhotoMenu &&
        !event.target.closest(".profile-photo-container")
      ) {
        setShowProfilePhotoMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showProfilePhotoMenu]);

  // Generate a colorful avatar based on user's name/email
  const generateAvatarUrl = (name, email) => {
    const initials = name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : email
      ? email.slice(0, 2).toUpperCase()
      : "U";

    // Generate a consistent color based on the user's name/email
    const colors = [
      "6366f1", // indigo
      "8b5cf6", // violet
      "ec4899", // pink
      "ef4444", // red
      "f97316", // orange
      "eab308", // yellow
      "22c55e", // green
      "06b6d4", // cyan
      "3b82f6", // blue
      "84cc16", // lime
    ];

    const str = name || email || "User";
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colorIndex = Math.abs(hash) % colors.length;
    const backgroundColor = colors[colorIndex];

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      initials
    )}&background=${backgroundColor}&color=fff&size=200&font-size=0.6&bold=true`;
  };

  // Get user's display name
  const displayName =
    userData?.name ||
    userData?.fullName ||
    userData?.email?.split("@")[0] ||
    "User";

  // Get user's profile image with comprehensive fallback logic
  const profileImage =
    userData?.profileImage || // Custom uploaded profile image
    userData?.profilePicture || // Schema-native profile picture field
    userData?.avatar || // Generic avatar field
    userData?.picture || // Google OAuth profile picture
    userData?.photo || // Alternative photo field
    generateAvatarUrl(displayName, userData?.email); // Generated avatar as fallback

  // Get user's title/role
  const userTitle =
    userData?.title ||
    userData?.role ||
    (userData?.userType === "employer" ? "Employer" : "Developer");

  // Show loading while fetching user data
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-dark-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-blue mb-4 mx-auto"></div>
          <h2 className="text-white text-xl font-semibold mb-2">
            Loading profile...
          </h2>
          <p className="text-gray-400">Please wait.</p>
        </div>
      </div>
    );
  }

  // Show error state if user data couldn't be loaded
  if (!isLoading && !userData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-dark-900">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4 mx-auto">
            <svg
              className="w-8 h-8 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-white text-xl font-semibold mb-2">
            Profile Not Found
          </h2>
          <p className="text-gray-400 mb-6">
            The user profile you're looking for doesn't exist or couldn't be
            loaded.
          </p>
          <button
            onClick={() => navigate("/explore")}
            className="px-6 py-3 bg-neon-blue hover:bg-neon-blue/80 text-dark-900 font-medium rounded-lg transition-colors"
          >
            Back to Explore
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="relative flex flex-col size-full min-h-screen bg-dark-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* TopNavigation */}
      <TopNavigation />

      {/* Neon Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-neon-blue/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-purple/10 rounded-full blur-3xl"></div>
      </div>

      {/* Main Content - Scrollable */}
      <motion.div
        className="flex-1 overflow-y-auto relative z-10"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Modern Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Profile Card */}
            <div className="lg:col-span-1 space-y-6">
              {/* Profile Card - Compact */}
              <motion.div
                className="bg-dark -800/80 backdrop-blur-xl rounded-xl border border-neon-blue/20 p-4 hover:border-neon-blue/40 transition-all duration-300"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                whileHover={{ scale: 1.02 }}
              >
                {/* Profile Image - Smaller with Error Handling */}
                <div className="flex justify-center mb-4">
                  <div className="relative group profile-photo-container">
                    <img
                      src={profileImage}
                      alt={`${userData?.name || "User"}'s profile`}
                      className="w-20 h-20 object-cover rounded-full border-2 border-neon-blue/50"
                      onError={(e) => {
                        // If the image fails to load, fall back to generated avatar
                        e.target.src = generateAvatarUrl(
                          userData?.name || "User"
                        );
                      }}
                    />

                    {/* Online Status Indicator */}
                    <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-dark-800 flex items-center justify-center">
                      <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                    </div>

                    {/* Profile Photo Edit Button - Only for Owner */}
                    {isOwner && (
                      <div className="relative">
                        <button
                          onClick={() =>
                            setShowProfilePhotoMenu(!showProfilePhotoMenu)
                          }
                          className="absolute -top-2 -left-2 w-8 h-8 bg-neon-blue/20 hover:bg-neon-blue/30 border border-neon-blue/30 hover:border-neon-blue/50 rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100"
                          title="Change Profile Photo"
                        >
                          <svg
                            className="w-4 h-4 text-neon-blue"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        </button>

                        {/* Profile Photo Menu */}
                        {showProfilePhotoMenu && (
                          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-dark-800 border border-neon-blue/30 rounded-lg shadow-2xl py-2 min-w-48 z-[9999]">
                            <div className="px-3 py-1 text-neon-blue text-xs font-medium border-b border-neon-blue/20 mb-1">
                              Profile Photo
                            </div>

                            <label className="flex items-center gap-2 px-3 py-2 hover:bg-neon-blue/10 cursor-pointer transition-colors">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleProfilePhotoUpload}
                                disabled={uploadingPhoto}
                                className="hidden"
                              />
                              <svg
                                className="w-4 h-4 text-green-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                />
                              </svg>
                              <span className="text-white text-sm">
                                {uploadingPhoto
                                  ? "Uploading..."
                                  : userData?.avatar
                                  ? "Change Photo"
                                  : "Upload Photo"}
                              </span>
                            </label>

                            {userData?.avatar && (
                              <button
                                onClick={handleRemoveProfilePhoto}
                                className="flex items-center gap-2 px-3 py-2 hover:bg-red-500/10 transition-colors w-full text-left"
                              >
                                <svg
                                  className="w-4 h-4 text-red-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                                <span className="text-red-400 text-sm">
                                  Remove Photo
                                </span>
                              </button>
                            )}

                            <div className="px-3 py-1 mt-1 pt-2 border-t border-neon-blue/20">
                              <p className="text-gray-400 text-xs">
                                Max size: 5MB
                                <br />
                                Formats: JPG, PNG, GIF
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Name and Title - Compact */}
                <div className="text-center space-y-1 mb-4">
                  {isEditingName ? (
                    <div className="flex items-center gap-2 justify-center">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="bg-dark-900/60 border border-neon-blue/30 rounded-lg px-2 py-1 text-white text-lg font-bold text-center focus:outline-none focus:border-neon-blue"
                        placeholder="Enter your name"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleNameSave();
                          }
                        }}
                      />
                      <button
                        onClick={handleNameSave}
                        className="p-1.5 hover:bg-green-500/20 rounded-full transition-colors"
                      >
                        <svg
                          className="w-3 h-3 text-green-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={handleNameCancel}
                        className="p-1.5 hover:bg-red-500/20 rounded-full transition-colors"
                      >
                        <svg
                          className="w-3 h-3 text-red-400"
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
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <h2 className="text-white text-lg font-bold font-heading">
                        {displayName}
                      </h2>
                      {isOwner && (
                        <button
                          onClick={handleNameEdit}
                          className="p-1 hover:bg-neon-blue/20 rounded-full transition-colors"
                        >
                          <svg
                            className="w-3 h-3 text-neon-blue"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  )}

                  <p className="text-neon-blue text-sm font-semibold">
                    {userTitle}
                  </p>

                  {/* Rating - Smaller */}
                  <div className="flex items-center justify-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-3 h-3 text-neon-blue fill-current"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="text-gray-400 text-xs ml-1">(4.9)</span>
                  </div>

                  {/* Status Badges - Smaller */}
                  <div className="flex flex-wrap gap-1 justify-center mt-2">
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-medium rounded-full border border-green-400/30">
                      Available for hire
                    </span>
                    <span className="px-2 py-0.5 bg-neon-blue/20 text-neon-blue text-xs font-medium rounded-full border border-neon-blue/30">
                      Open to collaborations
                    </span>
                  </div>
                </div>

                {/* About Me Section - Compact */}
                <div className="space-y-2 border-t border-neon-blue/20 pt-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white text-sm font-semibold">
                      💫 About Me
                    </h3>
                    {isOwner && !isEditingBio && (
                      <button
                        onClick={handleBioEdit}
                        className="p-1 hover:bg-neon-blue/20 rounded-full transition-colors"
                      >
                        <svg
                          className="w-3 h-3 text-neon-blue"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                    )}
                  </div>

                  {isEditingBio ? (
                    <div className="space-y-2">
                      <textarea
                        value={editBio}
                        onChange={(e) => setEditBio(e.target.value)}
                        className="w-full bg-dark-900/60 border border-neon-blue/30 rounded-lg px-2 py-2 text-gray-300 text-xs focus:outline-none focus:border-neon-blue resize-none"
                        rows={3}
                        placeholder="Tell the world about yourself..."
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleBioSave}
                          className="px-3 py-1 bg-neon-blue/20 text-neon-blue text-xs rounded-lg hover:bg-neon-blue/30 border border-neon-blue/30 transition-colors font-medium"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleBioCancel}
                          className="px-3 py-1 bg-gray-600/20 text-gray-400 text-xs rounded-lg hover:bg-gray-600/30 border border-gray-400/30 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-300 text-xs leading-relaxed">
                      {userData?.bio ||
                        "This developer hasn't added a bio yet. They're probably too busy coding amazing projects! 🚀"}
                    </p>
                  )}
                </div>
              </motion.div>

              {/* Skills Card - Compact */}
              <motion.div
                className="bg-dark-800/80 backdrop-blur-xl rounded-xl border border-neon-blue/20 p-4 hover:border-neon-blue/40 transition-all duration-300"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-white text-sm font-semibold">
                    🚀 Skills
                  </h3>
                  {isOwner && !isEditingSkills && (
                    <button
                      onClick={handleSkillsEdit}
                      className="p-1 hover:bg-neon-blue/20 rounded-full transition-colors"
                    >
                      <svg
                        className="w-3 h-3 text-neon-blue"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                  )}
                </div>

                {isEditingSkills ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Add a skill and press Enter"
                      className="w-full bg-dark-900/60 border border-neon-blue/30 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-neon-blue"
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && e.target.value.trim()) {
                          handleSkillsAdd(e.target.value.trim());
                          e.target.value = "";
                        }
                      }}
                    />
                    <div className="flex flex-wrap gap-1">
                      {editSkills.map((skill, index) => (
                        <div
                          key={index}
                          className="px-2 py-0.5 bg-neon-blue/20 border border-neon-blue/30 rounded-full text-neon-blue text-xs font-medium flex items-center gap-1"
                        >
                          {skill}
                          <button
                            onClick={() => handleSkillsRemove(skill)}
                            className="text-red-400 hover:text-red-300 text-sm leading-none"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSkillsSave}
                        className="px-3 py-1 bg-neon-blue/20 text-neon-blue text-xs rounded-lg hover:bg-neon-blue/30 border border-neon-blue/30 transition-colors font-medium"
                      >
                        Save Skills
                      </button>
                      <button
                        onClick={handleSkillsCancel}
                        className="px-3 py-1 bg-gray-600/20 text-gray-400 text-xs rounded-lg hover:bg-gray-600/30 border border-gray-400/30 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {(userData?.skills && userData.skills.length > 0
                      ? userData.skills
                      : [
                          "JavaScript",
                          "React",
                          "Node.js",
                          "Python",
                          "SQL",
                          "TypeScript",
                          "MongoDB",
                          "Express",
                        ]
                    ).map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 bg-dark-900/60 border border-neon-blue/30 rounded-full text-neon-blue text-xs font-medium hover:bg-neon-blue/10 hover:border-neon-blue/50 transition-all duration-300 cursor-default"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Right Column - Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Connect Section */}
              <motion.div
                className="bg-dark-800/80 backdrop-blur-xl rounded-xl border border-neon-blue/20 p-4 hover:border-neon-blue/40 transition-all duration-300"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-white text-sm font-semibold">
                    🔗 Connect
                  </h3>
                  {isOwner && !isEditingSocial && (
                    <button
                      onClick={handleSocialEdit}
                      className="p-1 hover:bg-neon-blue/20 rounded-full transition-colors"
                    >
                      <svg
                        className="w-3 h-3 text-neon-blue"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                  )}
                </div>

                {isEditingSocial ? (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <div>
                        <label className="block text-neon-blue text-xs font-medium mb-1">
                          Portfolio
                        </label>
                        <input
                          type="url"
                          value={editSocialLinks.portfolio}
                          onChange={(e) =>
                            setEditSocialLinks({
                              ...editSocialLinks,
                              portfolio: e.target.value,
                            })
                          }
                          className="w-full bg-dark-900/60 border border-neon-blue/30 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-neon-blue"
                          placeholder="https://your-portfolio.com"
                        />
                      </div>
                      <div>
                        <label className="block text-neon-blue text-xs font-medium mb-1">
                          GitHub
                        </label>
                        <input
                          type="url"
                          value={editSocialLinks.github}
                          onChange={(e) =>
                            setEditSocialLinks({
                              ...editSocialLinks,
                              github: e.target.value,
                            })
                          }
                          className="w-full bg-dark-900/60 border border-neon-blue/30 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-neon-blue"
                          placeholder="https://github.com/username"
                        />
                      </div>
                      <div>
                        <label className="block text-neon-blue text-xs font-medium mb-1">
                          LinkedIn
                        </label>
                        <input
                          type="url"
                          value={editSocialLinks.linkedin}
                          onChange={(e) =>
                            setEditSocialLinks({
                              ...editSocialLinks,
                              linkedin: e.target.value,
                            })
                          }
                          className="w-full bg-dark-900/60 border border-neon-blue/30 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-neon-blue"
                          placeholder="https://linkedin.com/in/username"
                        />
                      </div>
                      <div>
                        <label className="block text-neon-blue text-xs font-medium mb-1">
                          Twitter
                        </label>
                        <input
                          type="url"
                          value={editSocialLinks.twitter}
                          onChange={(e) =>
                            setEditSocialLinks({
                              ...editSocialLinks,
                              twitter: e.target.value,
                            })
                          }
                          className="w-full bg-dark-900/60 border border-neon-blue/30 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-neon-blue"
                          placeholder="https://twitter.com/username"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSocialSave}
                        className="px-3 py-1 bg-neon-blue/20 text-neon-blue text-xs rounded-lg hover:bg-neon-blue/30 border border-neon-blue/30 transition-colors font-medium"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleSocialCancel}
                        className="px-3 py-1 bg-gray-600/20 text-gray-400 text-xs rounded-lg hover:bg-gray-600/30 border border-gray-400/30 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {/* Portfolio Link */}
                    {(userData?.socialLinks?.portfolio ||
                      userData?.portfolio) && (
                      <a
                        href={
                          userData?.socialLinks?.portfolio ||
                          userData?.portfolio
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 bg-dark-900/60 rounded-lg border border-red-400/30 hover:border-red-400/50 hover:bg-red-500/10 transition-all duration-300 group"
                      >
                        <svg
                          className="w-4 h-4 text-red-400 group-hover:text-red-300"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.219-5.175 1.219-5.175s-.311-.623-.311-1.543c0-1.445.839-2.524 1.883-2.524.888 0 1.317.664 1.317 1.46 0 .889-.567 2.219-.858 3.449-.244 1.029.515 1.871 1.529 1.871 1.836 0 3.247-1.936 3.247-4.734 0-2.475-1.78-4.203-4.316-4.203-2.94 0-4.665 2.205-4.665 4.486 0 .887.342 1.839.769 2.357.084.102.097.191.072.295-.079.33-.254 1.037-.289 1.183-.045.189-.147.229-.338.138-1.249-.582-2.03-2.408-2.03-3.874 0-3.257 2.365-6.245 6.817-6.245 3.58 0 6.362 2.55 6.362 5.963 0 3.558-2.244 6.422-5.356 6.422-1.047 0-2.033-.546-2.371-1.193l-.644 2.457c-.233.896-.864 2.023-1.287 2.705.97.3 1.997.455 3.078.455 6.621 0 11.988-5.367 11.988-11.987C24.005 5.367 18.638.001 12.017.001z" />
                        </svg>
                        <span className="text-white text-xs font-medium group-hover:text-red-300">
                          Portfolio
                        </span>
                      </a>
                    )}

                    {/* GitHub Link */}
                    {(userData?.socialLinks?.github || userData?.github) && (
                      <a
                        href={userData?.socialLinks?.github || userData?.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 bg-dark-900/60 rounded-lg border border-gray-400/30 hover:border-gray-400/50 hover:bg-gray-500/10 transition-all duration-300 group"
                      >
                        <svg
                          className="w-4 h-4 text-gray-400 group-hover:text-gray-300"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                        <span className="text-white text-xs font-medium group-hover:text-gray-300">
                          GitHub
                        </span>
                      </a>
                    )}

                    {/* LinkedIn Link */}
                    {(userData?.socialLinks?.linkedin ||
                      userData?.linkedin) && (
                      <a
                        href={
                          userData?.socialLinks?.linkedin || userData?.linkedin
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 bg-dark-900/60 rounded-lg border border-blue-400/30 hover:border-blue-400/50 hover:bg-blue-500/10 transition-all duration-300 group"
                      >
                        <svg
                          className="w-4 h-4 text-blue-400 group-hover:text-blue-300"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                        <span className="text-white text-xs font-medium group-hover:text-blue-300">
                          LinkedIn
                        </span>
                      </a>
                    )}

                    {/* Twitter Link */}
                    {userData?.socialLinks?.twitter && (
                      <a
                        href={userData?.socialLinks?.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 bg-dark-900/60 rounded-lg border border-sky-400/30 hover:border-sky-400/50 hover:bg-sky-500/10 transition-all duration-300 group"
                      >
                        <svg
                          className="w-4 h-4 text-sky-400 group-hover:text-sky-300"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                        </svg>
                        <span className="text-white text-xs font-medium group-hover:text-sky-300">
                          Twitter
                        </span>
                      </a>
                    )}

                    {/* Empty state */}
                    {!userData?.socialLinks?.portfolio &&
                      !userData?.portfolio &&
                      !userData?.socialLinks?.github &&
                      !userData?.github &&
                      !userData?.socialLinks?.linkedin &&
                      !userData?.linkedin &&
                      !userData?.socialLinks?.twitter && (
                        <div className="col-span-2 text-center py-6 text-gray-400">
                          <p className="text-sm">No social links added yet</p>
                          {isOwner && (
                            <button
                              onClick={handleSocialEdit}
                              className="mt-2 text-neon-blue text-sm hover:text-neon-blue/80 transition-colors"
                            >
                              Add your links
                            </button>
                          )}
                        </div>
                      )}
                  </div>
                )}
              </motion.div>

              {/* Analytics Section */}
              <div className="bg-dark-800/80 backdrop-blur-xl rounded-xl border border-neon-blue/20 p-4 hover:border-neon-blue/40 transition-all duration-300">
                <h3 className="text-white text-lg font-bold font-heading mb-4">
                  📊 Analytics
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="text-center p-3 bg-dark-900/40 rounded-lg border border-neon-blue/10">
                    <div className="text-lg font-bold text-neon-blue mb-1">
                      {userProjects.length}
                    </div>
                    <div className="text-gray-400 text-xs">Projects</div>
                  </div>

                  <div className="text-center p-3 bg-dark-900/40 rounded-lg border border-green-400/10">
                    <div className="text-lg font-bold text-green-400 mb-1">
                      {userProjects.reduce(
                        (total, project) => total + (project.likeCount || 0),
                        0
                      )}
                    </div>
                    <div className="text-gray-400 text-xs">Total Likes</div>
                  </div>

                  <div className="text-center p-3 bg-dark-900/40 rounded-lg border border-purple-400/10">
                    <div className="text-lg font-bold text-purple-400 mb-1">
                      {userProjects.reduce(
                        (total, project) => total + (project.views || 0),
                        0
                      )}
                    </div>
                    <div className="text-gray-400 text-xs">Total Views</div>
                  </div>

                  <div className="text-center p-3 bg-dark-900/40 rounded-lg border border-orange-400/10">
                    <div className="text-lg font-bold text-orange-400 mb-1">
                      {userData?.skills?.length || 8}
                    </div>
                    <div className="text-gray-400 text-xs">Skills</div>
                  </div>
                </div>

                {/* Recent Activity - Compact */}
                <div className="mt-4 pt-4 border-t border-neon-blue/20">
                  <h4 className="text-white text-sm font-semibold mb-3">
                    🚀 Recent Activity
                  </h4>
                  <div className="space-y-2">
                    {userProjects.slice(0, 3).map((project) => (
                      <div
                        key={project._id}
                        className="flex items-center gap-2 p-2 bg-dark-900/40 rounded-lg"
                      >
                        <div className="w-1.5 h-1.5 bg-neon-blue rounded-full"></div>
                        <span className="text-gray-300 text-xs">
                          Uploaded{" "}
                          <span className="text-neon-blue font-medium">
                            {project.title}
                          </span>
                        </span>
                        <span className="text-gray-500 text-xs ml-auto">
                          {new Date(project.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                    {userProjects.length === 0 && (
                      <div className="text-center py-4 text-gray-400">
                        <p className="text-xs">No recent activity</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* My Projects - Detailed View */}
              <motion.div
                className="bg-dark-800/80 backdrop-blur-xl rounded-xl border border-neon-blue/20 p-6 hover:border-neon-blue/40 transition-all duration-300"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white text-xl font-bold font-heading">
                      🎨 My Projects
                    </h3>
                    <span className="px-3 py-1.5 bg-neon-blue/20 text-neon-blue text-sm rounded-full border border-neon-blue/30">
                      {userProjects.length}
                    </span>
                  </div>
                  {isOwner && (
                    <button
                      onClick={() => navigate("/upload")}
                      className="flex items-center gap-2 px-4 py-2 bg-neon-blue/20 text-neon-blue border border-neon-blue/30 rounded-lg hover:bg-neon-blue/30 hover:border-neon-blue/50 transition-all duration-300 text-sm font-medium"
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
                      Add Project
                    </button>
                  )}
                </div>

                {projectsLoading ? (
                  <div className="space-y-6">
                    {[...Array(3)].map((_, index) => (
                      <div key={index} className="animate-pulse">
                        <div className="flex gap-4">
                          <div className="w-32 h-24 bg-dark-900/60 rounded-lg"></div>
                          <div className="flex-1 space-y-3">
                            <div className="h-6 bg-dark-900/60 rounded w-3/4"></div>
                            <div className="h-4 bg-dark-900/60 rounded w-full"></div>
                            <div className="h-4 bg-dark-900/60 rounded w-2/3"></div>
                            <div className="flex gap-2">
                              <div className="h-6 bg-dark-900/60 rounded w-16"></div>
                              <div className="h-6 bg-dark-900/60 rounded w-16"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : userProjects.length > 0 ? (
                  <div className="space-y-6">
                    {userProjects.map((project) => (
                      <div
                        key={project._id}
                        className="group bg-dark-900/40 rounded-xl border border-neon-blue/10 hover:border-neon-blue/30 hover:bg-dark-900/60 transition-all duration-300 overflow-hidden"
                      >
                        {editingProjectId === project._id ? (
                          // Edit Mode
                          <div className="p-4 space-y-4">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-white text-lg font-bold">
                                Edit Project
                              </h4>
                              <div className="flex gap-2">
                                <button
                                  onClick={handleProjectSave}
                                  className="px-3 py-1.5 bg-neon-blue/20 text-neon-blue border border-neon-blue/30 rounded-lg hover:bg-neon-blue/30 text-sm font-medium transition-colors"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={handleProjectCancel}
                                  className="px-3 py-1.5 bg-gray-600/20 text-gray-400 border border-gray-400/30 rounded-lg hover:bg-gray-600/30 text-sm transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>

                            {/* Edit Form */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-neon-blue text-sm font-medium mb-2">
                                  Project Title
                                </label>
                                <input
                                  type="text"
                                  value={editProject.title}
                                  onChange={(e) =>
                                    setEditProject((prev) => ({
                                      ...prev,
                                      title: e.target.value,
                                    }))
                                  }
                                  className="w-full bg-dark-800/60 border border-neon-blue/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neon-blue"
                                  placeholder="Enter project title"
                                />
                              </div>

                              <div>
                                <label className="block text-neon-blue text-sm font-medium mb-2">
                                  GitHub URL
                                </label>
                                <input
                                  type="url"
                                  value={editProject.githubUrl}
                                  onChange={(e) =>
                                    setEditProject((prev) => ({
                                      ...prev,
                                      githubUrl: e.target.value,
                                    }))
                                  }
                                  className="w-full bg-dark-800/60 border border-neon-blue/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neon-blue"
                                  placeholder="https://github.com/username/repo"
                                />
                              </div>

                              <div className="md:col-span-2">
                                <label className="block text-neon-blue text-sm font-medium mb-2">
                                  Live Demo URL
                                </label>
                                <input
                                  type="url"
                                  value={editProject.liveUrl}
                                  onChange={(e) =>
                                    setEditProject((prev) => ({
                                      ...prev,
                                      liveUrl: e.target.value,
                                    }))
                                  }
                                  className="w-full bg-dark-800/60 border border-neon-blue/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neon-blue"
                                  placeholder="https://your-project-demo.com"
                                />
                              </div>

                              <div className="md:col-span-2">
                                <label className="block text-neon-blue text-sm font-medium mb-2">
                                  Description
                                </label>
                                <textarea
                                  value={editProject.description}
                                  onChange={(e) =>
                                    setEditProject((prev) => ({
                                      ...prev,
                                      description: e.target.value,
                                    }))
                                  }
                                  className="w-full bg-dark-800/60 border border-neon-blue/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neon-blue resize-none"
                                  rows={3}
                                  placeholder="Describe your project..."
                                />
                              </div>

                              <div className="md:col-span-2">
                                <label className="block text-neon-blue text-sm font-medium mb-2">
                                  Technologies
                                </label>
                                <input
                                  type="text"
                                  placeholder="Add a technology and press Enter"
                                  className="w-full bg-dark-800/60 border border-neon-blue/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neon-blue mb-2"
                                  onKeyPress={(e) => {
                                    if (
                                      e.key === "Enter" &&
                                      e.target.value.trim()
                                    ) {
                                      handleTechAdd(e.target.value.trim());
                                      e.target.value = "";
                                    }
                                  }}
                                />
                                <div className="flex flex-wrap gap-2">
                                  {editProject.technologies.map(
                                    (tech, index) => (
                                      <div
                                        key={index}
                                        className="px-2 py-1 bg-neon-blue/20 border border-neon-blue/30 rounded-lg text-neon-blue text-sm flex items-center gap-1"
                                      >
                                        {tech}
                                        <button
                                          onClick={() => handleTechRemove(tech)}
                                          className="text-red-400 hover:text-red-300 ml-1"
                                        >
                                          ×
                                        </button>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          // View Mode
                          <div
                            className="flex gap-4 p-4 cursor-pointer"
                            onClick={() => navigate(`/projects/${project._id}`)}
                          >
                            {/* Project Image */}
                            <div
                              className="w-32 h-24 bg-center bg-no-repeat bg-cover rounded-lg border border-neon-blue/20 flex-shrink-0 group-hover:scale-105 transition-transform duration-300"
                              style={{
                                backgroundImage: project.mainImage
                                  ? `url("${project.mainImage}")`
                                  : 'url("https://via.placeholder.com/128x96/1a1a2e/00d4aa?text=No+Image")',
                              }}
                            />

                            {/* Project Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="text-white text-lg font-bold font-heading group-hover:text-neon-blue transition-colors line-clamp-1">
                                  {project.title}
                                </h4>
                                <div className="flex gap-2 ml-4">
                                  {isOwner && (
                                    <div className="flex gap-1">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleProjectEdit(project);
                                        }}
                                        className="p-2 text-neon-blue hover:text-neon-blue/80 bg-neon-blue/10 hover:bg-neon-blue/20 rounded-lg transition-colors"
                                        title="Edit Project"
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
                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                          />
                                        </svg>
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleProjectDelete(project._id);
                                        }}
                                        className="p-2 text-red-400 hover:text-red-300 bg-red-400/10 hover:bg-red-400/20 rounded-lg transition-colors"
                                        title="Delete Project"
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
                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                          />
                                        </svg>
                                      </button>
                                    </div>
                                  )}
                                  {project.githubUrl && (
                                    <a
                                      href={project.githubUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-2 text-gray-400 hover:text-white bg-dark-800/50 hover:bg-dark-800/80 rounded-lg transition-colors"
                                      onClick={(e) => e.stopPropagation()}
                                      title="View Code"
                                    >
                                      <svg
                                        className="w-4 h-4"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                      </svg>
                                    </a>
                                  )}
                                  {project.liveUrl && (
                                    <a
                                      href={project.liveUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-2 text-neon-blue hover:text-neon-blue/80 bg-neon-blue/10 hover:bg-neon-blue/20 rounded-lg transition-colors"
                                      onClick={(e) => e.stopPropagation()}
                                      title="Live Demo"
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
                                    </a>
                                  )}
                                </div>
                              </div>

                              <p className="text-gray-300 text-sm leading-relaxed mb-3 line-clamp-2">
                                {project.description}
                              </p>

                              {/* Technologies */}
                              <div className="flex flex-wrap gap-2 mb-3">
                                {project.technologies
                                  ?.slice(0, 4)
                                  .map((tech, index) => (
                                    <span
                                      key={index}
                                      className="px-2 py-1 bg-neon-blue/20 text-neon-blue text-xs rounded-lg border border-neon-blue/30"
                                    >
                                      {tech}
                                    </span>
                                  ))}
                                {project.technologies?.length > 4 && (
                                  <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded-lg border border-gray-400/30">
                                    +{project.technologies.length - 4} more
                                  </span>
                                )}
                              </div>

                              {/* Project Stats */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 text-sm text-gray-400">
                                  <span className="flex items-center gap-1">
                                    <svg
                                      className="w-4 h-4"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    {project.likeCount || 0}
                                  </span>
                                  <span className="flex items-center gap-1">
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
                                    {project.views || 0}
                                  </span>
                                </div>
                                <span className="text-xs text-gray-500">
                                  {new Date(
                                    project.createdAt
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-4 text-gray-400">
                      <svg
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        className="w-full h-full"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                    </div>
                    <h4 className="text-white text-lg font-semibold mb-2">
                      {isOwner ? "No projects yet" : "No projects found"}
                    </h4>
                    <p className="text-gray-400 text-sm mb-4">
                      {isOwner
                        ? "Start showcasing your work by uploading your first project!"
                        : "This developer hasn't uploaded any projects yet."}
                    </p>
                    {isOwner && (
                      <button
                        onClick={() => navigate("/upload")}
                        className="px-6 py-3 bg-neon-blue/20 text-neon-blue border border-neon-blue/30 rounded-lg hover:bg-neon-blue/30 hover:border-neon-blue/50 transition-all duration-300 text-sm font-medium"
                      >
                        Upload Your First Project
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-800 border border-red-400/30 rounded-xl shadow-2xl max-w-md w-full mx-auto animate-in fade-in-0 zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-red-400/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/20 rounded-full">
                  <svg
                    className="w-6 h-6 text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5C3.312 18.333 4.274 20 5.814 20z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white text-lg font-bold">
                    Delete Project
                  </h3>
                  <p className="text-gray-400 text-sm">
                    This action cannot be undone
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <p className="text-gray-300 leading-relaxed">
                Are you sure you want to delete this project? All project data,
                including images, descriptions, and statistics will be
                permanently removed from your profile.
              </p>

              <div className="mt-4 p-3 bg-red-500/10 border border-red-400/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-red-400 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-red-400 text-sm font-medium">
                    This action is irreversible
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 pt-0 flex gap-3 justify-end">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-600/20 text-gray-300 border border-gray-400/30 rounded-lg hover:bg-gray-600/30 hover:text-white transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-400/30 rounded-lg hover:bg-red-500/30 hover:text-red-300 transition-all duration-200 font-medium flex items-center gap-2"
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

PublicProfile.propTypes = {
  isOwner: PropTypes.bool,
};

export default PublicProfile;

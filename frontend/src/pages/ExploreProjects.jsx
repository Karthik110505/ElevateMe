import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TopNavigation from "../components/TopNavigation";

const ExploreProjects = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("newest");
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedTechStack, setSelectedTechStack] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [availableTechStack, setAvailableTechStack] = useState([]);
  const [activeFilters, setActiveFilters] = useState({
    tags: false,
    techStack: false,
    popularity: false,
    newest: false,
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      // You might want to decode the token to get user info
      // For now, we'll fetch user info from the API
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
      } else {
        console.error("Failed to fetch current user:", response.status);
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  // Fetch all projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:3001/api/projects");

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            let projectsToShow = data.projects;

            // If user is logged in and currentUser is loaded, filter out their own projects
            if (isLoggedIn && currentUser && currentUser._id) {
              projectsToShow = data.projects.filter(
                (project) => project.owner?._id !== currentUser._id
              );
            }

            setProjects(projectsToShow);
            setFilteredProjects(projectsToShow);

            // Extract unique tags and technologies for filters
            const allTags = [
              ...new Set(projectsToShow.flatMap((p) => p.tags || [])),
            ];
            const allTech = [
              ...new Set(projectsToShow.flatMap((p) => p.technologies || [])),
            ];
            setAvailableTags(allTags);
            setAvailableTechStack(allTech);
          }
        } else {
          console.error("Failed to fetch projects");
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch projects after authentication status is determined
    // For logged-in users, wait for currentUser to be loaded
    if (!isLoggedIn || (isLoggedIn && currentUser)) {
      fetchProjects();
    }
  }, [isLoggedIn, currentUser]);

  // Filter and sort projects
  useEffect(() => {
    let filtered = [...projects];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (project) =>
          project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (project.technologies || []).some((tech) =>
            tech.toLowerCase().includes(searchQuery.toLowerCase())
          ) ||
          (project.tags || []).some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    // Apply tag filters
    if (selectedTags.length > 0) {
      filtered = filtered.filter((project) =>
        selectedTags.some((tag) => (project.tags || []).includes(tag))
      );
    }

    // Apply tech stack filters
    if (selectedTechStack.length > 0) {
      filtered = filtered.filter((project) =>
        selectedTechStack.some((tech) =>
          (project.technologies || []).includes(tech)
        )
      );
    }

    // Apply sorting
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "popularity":
        filtered.sort(
          (a, b) =>
            (b.likeCount || 0) +
            (b.views || 0) -
            ((a.likeCount || 0) + (a.views || 0))
        );
        break;
      case "title":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }

    setFilteredProjects(filtered);
  }, [projects, searchQuery, selectedTags, selectedTechStack, sortBy]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".relative")) {
        setActiveFilters({
          tags: false,
          techStack: false,
          popularity: false,
          newest: false,
        });
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterClick = (filterType) => {
    setActiveFilters((prev) => ({
      ...prev,
      [filterType]: !prev[filterType],
    }));
  };

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
    setActiveFilters((prev) => ({
      ...prev,
      popularity: newSortBy === "popularity",
      newest: newSortBy === "newest",
    }));
  };

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const toggleTechStack = (tech) => {
    setSelectedTechStack((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    );
  };

  const clearAllFilters = () => {
    setSelectedTags([]);
    setSelectedTechStack([]);
    setSearchQuery("");
    setSortBy("newest");
    setActiveFilters({
      tags: false,
      techStack: false,
      popularity: false,
      newest: false,
    });
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-dark-900">
      {/* Neon background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-neon-blue/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent-purple/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <TopNavigation
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />

      {/* Main Content */}
      <div className="relative z-10 px-4 md:px-20 lg:px-40 flex flex-1 justify-center py-5">
        <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
          {/* Page Title */}
          <h2 className="text-white tracking-light text-[28px] font-bold leading-tight px-4 text-left pb-3 pt-5 font-heading">
            Explore Projects
          </h2>

          {/* Filter Buttons */}
          <div className="flex gap-3 p-3 flex-wrap pr-4">
            {/* Sort by Newest */}
            <button
              onClick={() => handleSortChange("newest")}
              className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full backdrop-blur-sm pl-4 pr-4 transition-all duration-300 ${
                sortBy === "newest"
                  ? "bg-neon-blue/20 border border-neon-blue text-neon-blue"
                  : "bg-dark-800/80 border border-neon-blue/30 text-white hover:border-neon-blue"
              }`}
            >
              <p className="text-sm font-medium leading-normal font-sans">
                Newest
              </p>
            </button>

            {/* Sort by Popularity */}
            <button
              onClick={() => handleSortChange("popularity")}
              className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full backdrop-blur-sm pl-4 pr-4 transition-all duration-300 ${
                sortBy === "popularity"
                  ? "bg-neon-blue/20 border border-neon-blue text-neon-blue"
                  : "bg-dark-800/80 border border-neon-blue/30 text-white hover:border-neon-blue"
              }`}
            >
              <p className="text-sm font-medium leading-normal font-sans">
                Popularity
              </p>
            </button>

            {/* Tags Filter */}
            <div className="relative">
              <button
                onClick={() => handleFilterClick("tags")}
                className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full backdrop-blur-sm pl-4 pr-2 transition-all duration-300 ${
                  activeFilters.tags || selectedTags.length > 0
                    ? "bg-neon-blue/20 border border-neon-blue text-neon-blue"
                    : "bg-dark-800/80 border border-neon-blue/30 text-white hover:border-neon-blue"
                }`}
              >
                <p className="text-sm font-medium leading-normal font-sans">
                  Tags {selectedTags.length > 0 && `(${selectedTags.length})`}
                </p>
                <div className="text-current">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16px"
                    height="16px"
                    fill="currentColor"
                    viewBox="0 0 256 256"
                  >
                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
                  </svg>
                </div>
              </button>

              {/* Tags Dropdown */}
              {activeFilters.tags && (
                <div className="absolute top-10 left-0 z-20 bg-dark-800 border border-neon-blue/30 rounded-lg p-4 min-w-48 max-h-64 overflow-y-auto">
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1 rounded-full text-xs transition-all ${
                          selectedTags.includes(tag)
                            ? "bg-neon-blue text-dark-900"
                            : "bg-dark-700 text-white hover:bg-neon-blue/20"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Tech Stack Filter */}
            <div className="relative">
              <button
                onClick={() => handleFilterClick("techStack")}
                className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full backdrop-blur-sm pl-4 pr-2 transition-all duration-300 ${
                  activeFilters.techStack || selectedTechStack.length > 0
                    ? "bg-neon-blue/20 border border-neon-blue text-neon-blue"
                    : "bg-dark-800/80 border border-neon-blue/30 text-white hover:border-neon-blue"
                }`}
              >
                <p className="text-sm font-medium leading-normal font-sans">
                  Tech Stack{" "}
                  {selectedTechStack.length > 0 &&
                    `(${selectedTechStack.length})`}
                </p>
                <div className="text-current">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16px"
                    height="16px"
                    fill="currentColor"
                    viewBox="0 0 256 256"
                  >
                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
                  </svg>
                </div>
              </button>

              {/* Tech Stack Dropdown */}
              {activeFilters.techStack && (
                <div className="absolute top-10 left-0 z-20 bg-dark-800 border border-neon-blue/30 rounded-lg p-4 min-w-48 max-h-64 overflow-y-auto">
                  <div className="flex flex-wrap gap-2">
                    {availableTechStack.map((tech) => (
                      <button
                        key={tech}
                        onClick={() => toggleTechStack(tech)}
                        className={`px-3 py-1 rounded-full text-xs transition-all ${
                          selectedTechStack.includes(tech)
                            ? "bg-neon-blue text-dark-900"
                            : "bg-dark-700 text-white hover:bg-neon-blue/20"
                        }`}
                      >
                        {tech}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Clear Filters */}
            {(selectedTags.length > 0 ||
              selectedTechStack.length > 0 ||
              searchQuery) && (
              <button
                onClick={clearAllFilters}
                className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full bg-red-500/20 border border-red-500/50 text-red-400 backdrop-blur-sm pl-4 pr-4 hover:bg-red-500/30 transition-all duration-300"
              >
                <p className="text-sm font-medium leading-normal font-sans">
                  Clear All
                </p>
              </button>
            )}
          </div>

          {/* Results Summary */}
          <div className="px-4 pb-2">
            <p className="text-cyan-300/70 text-sm">
              Showing {filteredProjects.length} of {projects.length} projects
              {searchQuery && ` for "${searchQuery}"`}
            </p>
          </div>
          {/* Projects Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
            {loading ? (
              // Loading skeleton
              [...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-3 pb-3 animate-pulse"
                >
                  <div className="bg-dark-800/50 backdrop-blur-sm border border-neon-blue/20 rounded-xl p-4">
                    <div className="w-full aspect-video bg-gray-700 rounded-lg mb-4"></div>
                    <div className="space-y-3">
                      <div className="h-6 bg-gray-700 rounded w-3/4"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-700 rounded"></div>
                        <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <div
                  key={project._id}
                  className="flex flex-col cursor-pointer group w-full"
                  onClick={() => navigate(`/projects/${project._id}`)}
                >
                  <div className="bg-dark-800/50 backdrop-blur-sm border border-neon-blue/20 rounded-xl p-4 hover:border-neon-blue/50 hover:shadow-lg hover:shadow-neon-blue/25 transition-all duration-300 group-hover:transform group-hover:scale-105 h-full flex flex-col">
                    <div
                      className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg mb-4 bg-gray-800 flex-shrink-0"
                      style={{
                        backgroundImage: project.mainImage
                          ? `url("${project.mainImage}")`
                          : 'url("https://via.placeholder.com/400x225?text=No+Image")',
                      }}
                    />
                    <div className="flex-1 flex flex-col">
                      <p className="text-white text-base font-semibold leading-normal font-heading mb-2 line-clamp-2 flex-shrink-0">
                        {project.title}
                      </p>
                      <p className="text-cyan-300/80 text-sm font-normal leading-normal font-sans mb-3 line-clamp-3 flex-1">
                        {project.shortDescription || project.description}
                      </p>

                      {/* Tech Stack Tags */}
                      <div className="flex flex-wrap gap-1 flex-shrink-0">
                        {project.technologies &&
                          project.technologies
                            .slice(0, 3)
                            .map((tech, index) => (
                              <span
                                key={index}
                                className="bg-neon-blue/10 text-neon-blue px-2 py-1 rounded-full text-xs font-medium"
                              >
                                {tech}
                              </span>
                            ))}
                        {project.technologies &&
                          project.technologies.length > 3 && (
                            <span className="text-neon-blue/70 text-xs py-1">
                              +{project.technologies.length - 3} more
                            </span>
                          )}
                      </div>

                      {/* Project Stats - Simple display only */}
                      <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                        <div className="flex items-center gap-3">
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
                          <span>
                            {new Date(project.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <span className="flex items-center gap-1 text-gray-500">
                          <svg
                            className="w-3 h-3"
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
                          {project.likeCount || 0} likes
                        </span>
                      </div>

                      {/* Project Links */}
                      {(project.githubUrl || project.liveUrl) && (
                        <div className="flex gap-2 mt-3">
                          {project.githubUrl && (
                            <a
                              href={project.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              GitHub
                            </a>
                          )}
                          {project.liveUrl && (
                            <a
                              href={project.liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-green-400 hover:text-green-300 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Live Demo
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Empty state
              <div className="col-span-full text-center py-12">
                <div className="text-gray-400 text-lg mb-4">
                  No projects found
                </div>
                <p className="text-gray-500 text-sm">
                  Try adjusting your search or filter criteria
                </p>
                <button
                  onClick={clearAllFilters}
                  className="mt-4 px-6 py-3 bg-neon-blue hover:bg-neon-blue-light text-dark-900 font-bold rounded-full transition-all duration-300"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 flex justify-center border-t border-neon-blue/20 bg-dark-900/50 backdrop-blur-sm">
        <div className="flex max-w-[960px] flex-1 flex-col">
          <div className="flex flex-col gap-6 px-5 py-10 text-center">
            <div className="flex flex-wrap items-center justify-center gap-6 sm:flex-row sm:justify-around">
              <a
                className="text-cyan-300 text-base font-normal leading-normal min-w-40 font-sans hover:text-cyan-400 transition-colors"
                href="/about"
              >
                About
              </a>
              <a
                className="text-cyan-300 text-base font-normal leading-normal min-w-40 font-sans hover:text-cyan-400 transition-colors"
                href="/contact"
              >
                Contact
              </a>
              <a
                className="text-cyan-300 text-base font-normal leading-normal min-w-40 font-sans hover:text-cyan-400 transition-colors"
                href="/terms"
              >
                Terms of Service
              </a>
              <a
                className="text-cyan-300 text-base font-normal leading-normal min-w-40 font-sans hover:text-cyan-400 transition-colors"
                href="/privacy"
              >
                Privacy Policy
              </a>
            </div>
            <p className="text-cyan-300/70 text-base font-normal leading-normal font-sans">
              @2025 ElevateMe. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ExploreProjects;

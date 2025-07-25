import { useState } from "react";
import TopNavigation from "../components/TopNavigation";
import { motion } from "framer-motion";

const UploadProject = () => {
  const [formData, setFormData] = useState({
    title: "",
    videoDemo: "",
    description: "",
    githubLink: "",
    liveSiteLink: "",
    tags: [],
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [showTagInput, setShowTagInput] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const predefinedTags = [
    "React",
    "Vue",
    "Angular",
    "Node.js",
    "Express",
    "MongoDB",
    "MySQL",
    "PostgreSQL",
    "JavaScript",
    "TypeScript",
    "Python",
    "Java",
    "C++",
    "PHP",
    "Ruby",
    "Go",
    "Machine Learning",
    "AI",
    "Data Science",
    "Blockchain",
    "Cryptocurrency",
    "Mobile App",
    "Web App",
    "Desktop App",
    "Game Development",
    "AR/VR",
    "E-commerce",
    "Social Media",
    "Portfolio",
    "Blog",
    "CMS",
    "API",
    "Frontend",
    "Backend",
    "Full Stack",
    "DevOps",
    "Cloud",
    "AWS",
    "Docker",
    "Hackathon",
    "Open Source",
    "Personal Project",
    "Team Project",
    "Startup",
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log("Input change detected:", name, value);
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addTag = (tag) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleNewTagSubmit = (e) => {
    e.preventDefault();
    if (newTag.trim()) {
      addTag(newTag.trim());
      setNewTag("");
      setShowTagInput(false);
    }
  };

  const handleFileUpload = (e) => {
    console.log("File upload triggered", e.target.files);
    const files = Array.from(e.target.files);

    if (files.length > 0) {
      setSelectedFiles(files);

      // Create image previews
      const previews = files.map((file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            resolve({
              file,
              preview: event.target.result,
              name: file.name,
              size: (file.size / 1024 / 1024).toFixed(2), // Size in MB
            });
          };
          reader.readAsDataURL(file);
        });
      });

      Promise.all(previews).then(setImagePreviews);

      setIsUploading(true);
      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setIsUploading(false);
        }
      }, 200);
    }
  };

  const removeImage = (indexToRemove) => {
    const newPreviews = imagePreviews.filter(
      (_, index) => index !== indexToRemove
    );
    const newFiles = selectedFiles.filter(
      (_, index) => index !== indexToRemove
    );

    setImagePreviews(newPreviews);
    setSelectedFiles(newFiles);

    // Update file input
    const fileInput = document.getElementById("file-upload");
    if (newFiles.length === 0) {
      fileInput.value = "";
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );

    if (files.length > 0) {
      const syntheticEvent = {
        target: { files },
      };
      handleFileUpload(syntheticEvent);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous messages
    setUploadError("");
    setUploadSuccess("");

    // Basic validation
    if (!formData.title.trim()) {
      setUploadError("Project title is required");
      return;
    }

    if (!formData.description.trim()) {
      setUploadError("Project description is required");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formDataToSend = new FormData();

      // Add text fields
      formDataToSend.append("title", formData.title);
      formDataToSend.append("videoDemo", formData.videoDemo);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("githubLink", formData.githubLink);
      formDataToSend.append("liveSiteLink", formData.liveSiteLink);
      formDataToSend.append("tags", JSON.stringify(formData.tags));

      // Add files if any were uploaded
      if (selectedFiles.length > 0) {
        selectedFiles.forEach((file) => {
          formDataToSend.append("images", file);
        });
      }

      // Simulate progress for user experience
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Use the authenticated endpoint to properly set the owner
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Please log in to upload projects");
      }

      const response = await fetch("http://localhost:3001/api/projects", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type for FormData, let the browser set it
        },
        body: formDataToSend,
      });

      const result = await response.json();

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success) {
        setUploadSuccess("Project uploaded successfully!");
        // Reset form
        setFormData({
          title: "",
          videoDemo: "",
          description: "",
          githubLink: "",
          liveSiteLink: "",
          tags: [],
        });
        // Reset file input and previews
        setSelectedFiles([]);
        setImagePreviews([]);
        document.getElementById("file-upload").value = "";

        // Clear success message after 3 seconds
        setTimeout(() => {
          setUploadSuccess("");
          setUploadProgress(0);
        }, 3000);
      } else {
        setUploadError(result.message || "Upload failed");
        if (result.errors && Array.isArray(result.errors)) {
          setUploadError(
            result.errors.map((err) => err.message || err).join(", ")
          );
        }
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError(
        "An error occurred while uploading the project. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <motion.div
      className="relative flex size-full min-h-screen flex-col bg-dark-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Neon background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-neon-blue/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent-purple/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      {/* TopNavigation */}
      <TopNavigation />

      {/* Main Content */}
      <motion.div
        className="relative z-10 px-4 md:px-8 lg:px-16 flex flex-1 justify-center py-5"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="layout-content-container flex flex-col max-w-[680px] flex-1">
          {/* Page Title */}
          <div className="flex flex-wrap justify-between gap-3 p-4">
            <p className="text-white tracking-light text-[24px] md:text-[28px] font-bold leading-tight min-w-72 font-heading">
              Upload Project
            </p>
          </div>

          <motion.form
            onSubmit={handleSubmit}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {/* Error Message */}
            {uploadError && (
              <div className="mx-4 mb-4 p-4 bg-red-500/20 border border-red-500/40 rounded-xl text-red-300">
                {uploadError}
              </div>
            )}

            {/* Success Message */}
            {uploadSuccess && (
              <div className="mx-4 mb-4 p-4 bg-green-500/20 border border-green-500/40 rounded-xl text-green-300">
                {uploadSuccess}
              </div>
            )}

            {/* Project Title */}
            <div className="flex max-w-full md:max-w-[400px] flex-wrap items-end gap-4 px-4 py-2">
              <label className="flex flex-col min-w-40 flex-1">
                <p className="text-white text-base font-medium leading-normal pb-2 font-sans">
                  Project Title
                </p>
                <input
                  type="text"
                  name="title"
                  placeholder="Enter project title"
                  className="w-full p-3 border border-neon-blue/30 bg-dark-800 text-white rounded-xl h-12 placeholder:text-neon-blue/70 focus:border-neon-blue transition-all duration-300"
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </label>
            </div>

            {/* Video Demo */}
            <div className="flex max-w-full md:max-w-[400px] flex-wrap items-end gap-4 px-4 py-2">
              <label className="flex flex-col min-w-40 flex-1">
                <p className="text-white text-base font-medium leading-normal pb-2 font-sans">
                  Video Demo (or YouTube/Vimeo Link)
                </p>
                <input
                  type="url"
                  name="videoDemo"
                  placeholder="Upload video or paste link"
                  className="w-full p-3 border border-neon-blue/30 bg-dark-800 text-white rounded-xl h-12 placeholder:text-neon-blue/70 focus:border-neon-blue transition-all duration-300"
                  value={formData.videoDemo}
                  onChange={handleInputChange}
                />
              </label>
            </div>

            {/* Description */}
            <div className="flex max-w-full md:max-w-[400px] flex-wrap items-end gap-4 px-4 py-2">
              <label className="flex flex-col min-w-40 flex-1">
                <p className="text-white text-base font-medium leading-normal pb-2 font-sans">
                  Description
                </p>
                <textarea
                  name="description"
                  placeholder="Describe your project"
                  className="w-full p-3 border border-neon-blue/30 bg-dark-800 text-white rounded-xl min-h-28 placeholder:text-neon-blue/70 focus:border-neon-blue transition-all duration-300 resize-none"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </label>
            </div>

            {/* GitHub Link */}
            <div className="flex max-w-full md:max-w-[400px] flex-wrap items-end gap-4 px-4 py-2">
              <label className="flex flex-col min-w-40 flex-1">
                <p className="text-white text-base font-medium leading-normal pb-2 font-sans">
                  GitHub Link
                </p>
                <input
                  type="url"
                  name="githubLink"
                  placeholder="Link to your project's GitHub repository"
                  className="w-full p-3 border border-neon-blue/30 bg-dark-800 text-white rounded-xl h-12 placeholder:text-neon-blue/70 focus:border-neon-blue transition-all duration-300"
                  value={formData.githubLink}
                  onChange={handleInputChange}
                />
              </label>
            </div>

            {/* Live Site Link */}
            <div className="flex max-w-full md:max-w-[400px] flex-wrap items-end gap-4 px-4 py-2">
              <label className="flex flex-col min-w-40 flex-1">
                <p className="text-white text-base font-medium leading-normal pb-2 font-sans">
                  Live Site Link (Optional)
                </p>
                <input
                  type="url"
                  name="liveSiteLink"
                  placeholder="Link to the live project site"
                  className="w-full p-3 border border-neon-blue/30 bg-dark-800 text-white rounded-xl h-12 placeholder:text-neon-blue/70 focus:border-neon-blue transition-all duration-300"
                  value={formData.liveSiteLink}
                  onChange={handleInputChange}
                />
              </label>
            </div>

            {/* Tags */}
            <div className="flex max-w-full md:max-w-[600px] flex-wrap items-start gap-4 px-4 py-2">
              <div className="flex flex-col min-w-40 flex-1">
                <p className="text-white text-base font-medium leading-normal pb-2 font-sans">
                  Tags
                </p>

                {/* Selected Tags Display */}
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3 p-2 border border-neon-blue/20 rounded-xl bg-dark-800/50">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-2 px-2 py-1 bg-neon-blue/20 border border-neon-blue/40 rounded-full text-white text-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="hover:bg-red-500/30 rounded-full p-1 transition-colors"
                        >
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
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Predefined Tags */}
                <div className="mb-3">
                  <p className="text-neon-blue/80 text-sm font-medium mb-2">
                    Popular Tags:
                  </p>
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                    {predefinedTags.map((tag, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => addTag(tag)}
                        disabled={formData.tags.includes(tag)}
                        className={`px-2 py-1 text-sm rounded-full border transition-all duration-200 ${
                          formData.tags.includes(tag)
                            ? "bg-neon-blue/30 border-neon-blue/50 text-white cursor-not-allowed opacity-50"
                            : "bg-dark-800 border-neon-blue/30 text-white hover:bg-neon-blue/20 hover:border-neon-blue/60 cursor-pointer"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Add Custom Tag */}
                <div className="flex flex-col gap-2">
                  {!showTagInput ? (
                    <button
                      type="button"
                      onClick={() => setShowTagInput(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-accent-purple/20 border border-accent-purple/40 rounded-xl text-white hover:bg-accent-purple/30 transition-all duration-200 self-start"
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
                      Add Custom Tag
                    </button>
                  ) : (
                    <form onSubmit={handleNewTagSubmit} className="flex gap-2">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Enter custom tag"
                        className="flex-1 p-2 border border-neon-blue/30 bg-dark-800 text-white rounded-lg placeholder:text-neon-blue/70 focus:border-neon-blue transition-all duration-300"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-neon-blue/30 border border-neon-blue/50 rounded-lg text-white hover:bg-neon-blue/40 transition-all duration-200"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowTagInput(false);
                          setNewTag("");
                        }}
                        className="px-4 py-2 bg-red-500/20 border border-red-500/40 rounded-lg text-white hover:bg-red-500/30 transition-all duration-200"
                      >
                        Cancel
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>

            {/* Upload Progress (show only when uploading) */}
            {isUploading && (
              <div className="flex flex-col gap-3 p-4">
                <div className="flex gap-6 justify-between">
                  <p className="text-white text-base font-medium leading-normal font-sans">
                    Uploading...
                  </p>
                </div>
                <div className="rounded bg-[#474747]">
                  <div
                    className="h-2 rounded bg-[#8dcece] transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-[#8dcece] text-sm font-normal leading-normal font-sans">
                  {uploadProgress}%
                </p>
              </div>
            )}

            {/* File Upload Area */}
            <motion.div
              className="flex flex-col p-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <motion.div
                className={`flex flex-col items-center gap-4 rounded-xl border-2 border-dashed px-4 py-8 transition-colors ${
                  isDragOver
                    ? "border-neon-blue bg-neon-blue/10"
                    : "border-[#2e6b6b]"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                whileHover={{ scale: 1.02, borderColor: "#06b6d4" }}
                animate={{
                  scale: isDragOver ? 1.05 : 1,
                  borderColor: isDragOver ? "#06b6d4" : "#2e6b6b",
                }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex max-w-[400px] flex-col items-center gap-2">
                  <p className="text-white text-lg font-bold leading-tight tracking-[-0.015em] max-w-[400px] text-center font-heading">
                    Upload Thumbnails/Snapshots
                  </p>
                  <p className="text-white text-sm font-normal leading-normal max-w-[400px] text-center font-sans">
                    Drag and drop files here, or click to browse
                  </p>
                </div>
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer"
                  onClick={() => console.log("File upload label clicked")}
                >
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    onClick={() => console.log("File input clicked")}
                  />
                  <span className="flex min-w-[84px] max-w-[400px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#204b4b] text-white text-sm font-bold leading-normal tracking-[0.015em] font-sans">
                    {imagePreviews.length > 0
                      ? `${imagePreviews.length} Files Selected`
                      : "Browse Files"}
                  </span>
                </label>
              </motion.div>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="mt-4">
                  <p className="text-white text-base font-medium leading-normal pb-2 font-sans">
                    Selected Images ({imagePreviews.length})
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {imagePreviews.map((imageData, index) => (
                      <div
                        key={index}
                        className="relative group rounded-lg overflow-hidden border border-neon-blue/30 bg-dark-800"
                      >
                        <img
                          src={imageData.preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="bg-red-500/80 hover:bg-red-500 text-white rounded-full p-1 transition-colors"
                          >
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
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                        <div className="p-1">
                          <p className="text-white text-xs truncate">
                            {imageData.name}
                          </p>
                          <p className="text-neon-blue/70 text-xs">
                            {imageData.size} MB
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Submit Button */}
            <motion.div
              className="flex px-4 py-3 justify-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <motion.button
                type="submit"
                className="flex min-w-[120px] max-w-[200px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-6 bg-gradient-to-r from-neon-blue to-accent-purple text-dark-900 text-sm font-bold leading-normal tracking-[0.015em] font-sans hover:shadow-lg hover:shadow-neon-blue/25 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="truncate">Publish Project</span>
              </motion.button>
            </motion.div>
          </motion.form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default UploadProject;

const express = require("express");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");
const {
  validateProject,
  handleValidationErrors,
} = require("../middleware/validation");
const Project = require("../models/Project");

const router = express.Router();

// @route   GET /api/projects/health
// @desc    Health check for projects service
// @access  Public
router.get("/health", async (req, res) => {
  try {
    // Test database connection by counting projects
    const projectCount = await Project.countDocuments();

    res.json({
      success: true,
      message: "Projects service is healthy",
      data: {
        totalProjects: projectCount,
        uploadEnabled: !!(
          process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY
        ),
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Projects service is unhealthy",
      error: error.message,
    });
  }
});

// @route   GET /api/projects
// @desc    Get all projects
// @access  Public
router.get("/", async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("owner", "fullName email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      projects,
    });
  } catch (error) {
    console.error("Get projects error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   GET /api/projects/user/:userId
// @desc    Get projects by user ID
// @access  Public
router.get("/user/:userId", async (req, res) => {
  try {
    const projects = await Project.find({ owner: req.params.userId })
      .populate("owner", "fullName email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      projects,
    });
  } catch (error) {
    console.error("Get user projects error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   GET /api/projects/my-projects
// @desc    Get current user's projects
// @access  Private
router.get("/my-projects", auth, async (req, res) => {
  try {
    const projects = await Project.find({ owner: req.user.id })
      .populate("owner", "fullName email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      projects,
    });
  } catch (error) {
    console.error("Get user projects error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   GET /api/projects/:id
// @desc    Get project by ID
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("owner", "fullName email profilePicture")
      .populate("comments.user", "fullName profilePicture");

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // If user is authenticated, include like status
    let projectData = project.toObject();
    if (req.headers.authorization) {
      try {
        const jwt = require("jsonwebtoken");
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        projectData.isLiked = project.likes.includes(decoded.user.id);
      } catch (error) {
        // Token invalid, continue without like status
        projectData.isLiked = false;
      }
    } else {
      projectData.isLiked = false;
    }

    res.json({
      success: true,
      project: projectData,
    });
  } catch (error) {
    console.error("Get project error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   POST /api/projects/test
// @desc    Create a project (test endpoint without auth)
// @access  Public
router.post(
  "/test",
  upload.multiple("images", 5),
  validateProject,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { title, videoDemo, description, githubLink, liveSiteLink, tags } =
        req.body;

      // Parse tags if it's a string
      let parsedTags = [];
      if (tags) {
        parsedTags = typeof tags === "string" ? JSON.parse(tags) : tags;
      }

      // For testing, create a dummy user ID
      const testUserId = "507f1f77bcf86cd799439011"; // Valid ObjectId format

      // Map frontend data to backend schema
      const projectData = {
        title,
        description,
        shortDescription: description.substring(0, 200),
        technologies: Array.isArray(parsedTags) ? parsedTags : [],
        category: "other",
        difficulty: "intermediate",
        githubUrl: githubLink,
        liveUrl: liveSiteLink,
        videoUrl: videoDemo,
        owner: testUserId,
        isPublic: true,
      };

      // Handle uploaded images
      if (req.files && req.files.length > 0) {
        projectData.images = req.files.map((file, index) => {
          // Normalize file URL for both Cloudinary and local storage
          let imageUrl = file.path || file.secure_url || file.url;
          if (!imageUrl?.startsWith("http")) {
            // Local storage: convert filesystem path to accessible URL
            imageUrl = `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;
          }
          return {
            url: imageUrl,
            caption: `Project image ${index + 1}`,
            isMain: index === 0,
          };
        });
      }

      console.log("Project data being saved:", projectData);

      const newProject = new Project(projectData);
      const project = await newProject.save();

      res.json({
        success: true,
        project,
        message: "Project created successfully (test mode)",
      });
    } catch (error) {
      console.error("Create project error:", error);

      if (error.name === "ValidationError") {
        const errors = Object.values(error.errors).map((err) => err.message);
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors,
        });
      }

      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },
  upload.handleMulterError
);

// @route   POST /api/projects
// @desc    Create a project
// @access  Private
router.post(
  "/",
  auth,
  upload.multiple("images", 5),
  validateProject,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { title, videoDemo, description, githubLink, liveSiteLink, tags } =
        req.body;

      // Parse tags if it's a string
      let parsedTags = [];
      if (tags) {
        parsedTags = typeof tags === "string" ? JSON.parse(tags) : tags;
      }

      // Map frontend data to backend schema
      const projectData = {
        title,
        description,
        shortDescription: description.substring(0, 200), // Auto-generate from description
        technologies: Array.isArray(parsedTags) ? parsedTags : [],
        category: "other", // Default category, could be enhanced later
        difficulty: "intermediate", // Default difficulty, could be enhanced later
        githubUrl: githubLink,
        liveUrl: liveSiteLink,
        videoUrl: videoDemo,
        owner: req.user.id,
        isPublic: true,
      };

      // Handle uploaded images
      if (req.files && req.files.length > 0) {
        projectData.images = req.files.map((file, index) => {
          // Normalize file URL for both Cloudinary and local storage
          let imageUrl = file.path || file.secure_url || file.url;
          if (!imageUrl?.startsWith("http")) {
            // Local storage: convert filesystem path to accessible URL
            imageUrl = `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;
          }
          return {
            url: imageUrl,
            caption: `Project image ${index + 1}`,
            isMain: index === 0, // First image is main
          };
        });
      }

      const newProject = new Project(projectData);
      const project = await newProject.save();
      await project.populate("owner", "fullName email");

      res.json({
        success: true,
        project,
      });
    } catch (error) {
      console.error("Create project error:", error.message);

      // Handle validation errors
      if (error.name === "ValidationError") {
        const errors = Object.values(error.errors).map((err) => err.message);
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors,
        });
      }

      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  },
  upload.handleMulterError
);

// @route   POST /api/projects/upload-images
// @desc    Upload project images separately
// @access  Private
router.post(
  "/upload-images",
  auth,
  upload.multiple("images", 5),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No files uploaded",
        });
      }

      const uploadedImages = req.files.map((file, index) => ({
        url: file.path,
        caption: `Project image ${index + 1}`,
        isMain: index === 0,
      }));

      res.json({
        success: true,
        images: uploadedImages,
      });
    } catch (error) {
      console.error("Upload images error:", error.message);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  },
  upload.handleMulterError
);

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Private
router.put("/:id", auth, async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Make sure user owns project
    if (project.owner.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    project = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).populate("owner", "fullName email");

    res.json({
      success: true,
      project,
    });
  } catch (error) {
    console.error("Update project error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete project
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Make sure user owns project
    if (project.owner.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    await Project.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Project deleted",
    });
  } catch (error) {
    console.error("Delete project error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   POST /api/projects/:id/like
// @desc    Toggle like on a project
// @access  Private
router.post("/:id/like", auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Check if user already liked the project
    const userLikeIndex = project.likes.indexOf(req.user.id);
    let isLiked;

    if (userLikeIndex > -1) {
      // User has liked, so remove like
      project.likes.splice(userLikeIndex, 1);
      isLiked = false;
    } else {
      // User hasn't liked, so add like
      project.likes.push(req.user.id);
      isLiked = true;
    }

    // Save the project
    await project.save();

    const likeCount = project.likes.length;

    res.json({
      success: true,
      isLiked,
      likeCount,
      message: isLiked ? "Project liked" : "Project unliked",
    });
  } catch (error) {
    console.error("Like project error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   POST /api/projects/:id/comments
// @desc    Add a comment to a project
// @access  Private
router.post("/:id/comments", auth, async (req, res) => {
  try {
    const { text } = req.body;
    const trimmedText = (text || "").trim();

    if (!trimmedText) {
      return res.status(400).json({
        success: false,
        message: "Comment text is required",
      });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    project.comments.push({
      user: req.user.id,
      text: trimmedText,
    });

    await project.save();
    await project.populate("comments.user", "fullName profilePicture");

    const newComment = project.comments[project.comments.length - 1];

    res.status(201).json({
      success: true,
      message: "Comment added",
      comment: newComment,
      commentCount: project.comments.length,
    });
  } catch (error) {
    console.error("Add comment error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   PUT /api/projects/:id/comments/:commentId
// @desc    Edit a comment on a project
// @access  Private (comment owner only)
router.put("/:id/comments/:commentId", auth, async (req, res) => {
  try {
    const { text } = req.body;
    const trimmedText = (text || "").trim();

    if (!trimmedText) {
      return res.status(400).json({
        success: false,
        message: "Comment text is required",
      });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const comment = project.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    if (comment.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to edit this comment",
      });
    }

    comment.text = trimmedText;
    comment.editedAt = new Date();

    await project.save();
    await project.populate("comments.user", "fullName profilePicture");

    const updatedComment = project.comments.id(req.params.commentId);

    res.json({
      success: true,
      message: "Comment updated",
      comment: updatedComment,
    });
  } catch (error) {
    console.error("Edit comment error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   DELETE /api/projects/:id/comments/:commentId
// @desc    Delete a comment from a project
// @access  Private (comment owner only)
router.delete("/:id/comments/:commentId", auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const comment = project.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    if (comment.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this comment",
      });
    }

    comment.deleteOne();
    await project.save();

    res.json({
      success: true,
      message: "Comment deleted",
      commentId: req.params.commentId,
      commentCount: project.comments.length,
    });
  } catch (error) {
    console.error("Delete comment error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   POST /api/projects/:id/view
// @desc    Increment project view count
// @access  Public
router.post("/:id/view", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Get client IP for basic duplicate prevention
    const clientIP =
      req.ip ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      (req.connection.socket ? req.connection.socket.remoteAddress : null);

    // Create a simple key for rate limiting (IP + project ID)
    const viewKey = `view_${clientIP}_${req.params.id}`;

    // Simple in-memory rate limiting (in production, use Redis)
    if (!global.viewLimitTracker) {
      global.viewLimitTracker = new Map();
    }

    const now = Date.now();
    const lastViewTime = global.viewLimitTracker.get(viewKey);

    // Only allow one view per IP per project every 5 minutes
    if (lastViewTime && now - lastViewTime < 5 * 60 * 1000) {
      return res.json({
        success: true,
        views: project.views,
        message: "View already counted recently",
      });
    }

    // Increment views using the model method
    await project.incrementViews();

    // Update the rate limit tracker
    global.viewLimitTracker.set(viewKey, now);

    // Clean up old entries periodically (keep only last hour)
    if (global.viewLimitTracker.size > 1000) {
      const oneHourAgo = now - 60 * 60 * 1000;
      for (const [key, time] of global.viewLimitTracker.entries()) {
        if (time < oneHourAgo) {
          global.viewLimitTracker.delete(key);
        }
      }
    }

    res.json({
      success: true,
      views: project.views,
      message: "View count incremented",
    });
  } catch (error) {
    console.error("Increment view error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;

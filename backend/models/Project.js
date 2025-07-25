const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Project title is required"],
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Project description is required"],
      maxlength: [1000, "Description cannot be more than 1000 characters"],
    },
    shortDescription: {
      type: String,
      required: [true, "Short description is required"],
      maxlength: [200, "Short description cannot be more than 200 characters"],
    },

    // Project details
    technologies: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],
    category: {
      type: String,
      required: [true, "Project category is required"],
      enum: [
        "web-development",
        "mobile-development",
        "desktop-application",
        "data-science",
        "machine-learning",
        "blockchain",
        "game-development",
        "devops",
        "other",
      ],
    },
    status: {
      type: String,
      enum: ["in-progress", "completed", "on-hold"],
      default: "completed",
    },

    // Project links and resources
    liveUrl: {
      type: String,
      match: [/^https?:\/\/.+/, "Please enter a valid URL"],
    },
    githubUrl: {
      type: String,
      match: [
        /^https?:\/\/(www\.)?github\.com\/.+/,
        "Please enter a valid GitHub URL",
      ],
    },
    videoUrl: {
      type: String,
      match: [/^https?:\/\/.+/, "Please enter a valid video URL"],
    },

    // Media
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        caption: {
          type: String,
          maxlength: [200, "Caption cannot be more than 200 characters"],
        },
        isMain: {
          type: Boolean,
          default: false,
        },
      },
    ],

    // Project owner
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Collaboration
    collaborators: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        role: {
          type: String,
          enum: ["frontend", "backend", "fullstack", "designer", "other"],
          default: "other",
        },
      },
    ],

    // Engagement metrics
    views: {
      type: Number,
      default: 0,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Project metadata
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      required: [true, "Project difficulty is required"],
    },
    duration: {
      type: String,
      maxlength: [50, "Duration cannot be more than 50 characters"],
    },
    featured: {
      type: Boolean,
      default: false,
    },

    // Project timeline
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },

    // Search and discovery
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],

    // Visibility
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for like count
projectSchema.virtual("likeCount").get(function () {
  return this.likes.length;
});

// Virtual for main image
projectSchema.virtual("mainImage").get(function () {
  const mainImg = this.images.find((img) => img.isMain);
  return mainImg
    ? mainImg.url
    : this.images.length > 0
    ? this.images[0].url
    : null;
});

// Indexes
projectSchema.index({ owner: 1 });
projectSchema.index({ category: 1 });
projectSchema.index({ technologies: 1 });
projectSchema.index({ tags: 1 });
projectSchema.index({ featured: 1 });
projectSchema.index({ isPublic: 1 });
projectSchema.index({ createdAt: -1 });
projectSchema.index({ views: -1 });
projectSchema.index({ likes: -1 });

// Text index for search
projectSchema.index(
  {
    title: "text",
    description: "text",
    shortDescription: "text",
    technologies: "text",
    tags: "text",
  },
  {
    weights: {
      title: 10,
      shortDescription: 5,
      technologies: 3,
      tags: 2,
      description: 1,
    },
  }
);

// Pre-save middleware
projectSchema.pre("save", function (next) {
  // Ensure only one main image
  if (this.images && this.images.length > 0) {
    const mainImages = this.images.filter((img) => img.isMain);
    if (mainImages.length > 1) {
      this.images.forEach((img, index) => {
        img.isMain = index === 0;
      });
    } else if (mainImages.length === 0) {
      this.images[0].isMain = true;
    }
  }

  // Auto-generate tags from technologies
  if (this.technologies && this.technologies.length > 0) {
    const techTags = this.technologies.map((tech) =>
      tech.toLowerCase().replace(/\s+/g, "-")
    );
    this.tags = [...new Set([...this.tags, ...techTags])];
  }

  next();
});

// Method to increment views
projectSchema.methods.incrementViews = function () {
  this.views += 1;
  return this.save();
};

// Method to toggle like
projectSchema.methods.toggleLike = function (userId) {
  const userLikeIndex = this.likes.indexOf(userId);

  if (userLikeIndex > -1) {
    this.likes.splice(userLikeIndex, 1);
  } else {
    this.likes.push(userId);
  }

  return this.save();
};

// Static method to get featured projects
projectSchema.statics.getFeatured = function (limit = 6) {
  return this.find({ featured: true, isPublic: true })
    .populate("owner", "fullName profilePicture userType")
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to search projects
projectSchema.statics.searchProjects = function (query, filters = {}) {
  const searchQuery = {
    isPublic: true,
    ...filters,
  };

  if (query) {
    searchQuery.$text = { $search: query };
  }

  return this.find(searchQuery)
    .populate("owner", "fullName profilePicture userType")
    .sort(query ? { score: { $meta: "textScore" } } : { createdAt: -1 });
};

module.exports = mongoose.model("Project", projectSchema);

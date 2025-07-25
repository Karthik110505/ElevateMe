const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      maxlength: [100, "Name cannot be more than 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: function () {
        return !this.oauthProvider;
      },
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    userType: {
      type: String,
      required: [true, "User type is required"],
      enum: ["developer", "employer"],
    },

    // OAuth fields
    oauthProvider: {
      type: String,
      enum: ["google", "github", "linkedin"],
      default: null,
    },
    oauthId: {
      type: String,
      default: null,
    },

    // Profile information
    profilePicture: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      maxlength: [500, "Bio cannot be more than 500 characters"],
    },
    location: {
      type: String,
      maxlength: [100, "Location cannot be more than 100 characters"],
    },
    website: {
      type: String,
      match: [/^https?:\/\/.+/, "Please enter a valid URL"],
    },

    // Developer-specific fields
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    experience: {
      type: String,
      enum: ["entry", "junior", "mid", "senior", "lead"],
      required: false, // Make optional during signup, can be required during profile completion
    },

    // Social Links
    socialLinks: {
      github: {
        type: String,
        match: [
          /^https?:\/\/(www\.)?github\.com\/.+/,
          "Please enter a valid GitHub URL",
        ],
        default: null,
      },
      linkedin: {
        type: String,
        match: [
          /^https?:\/\/(www\.)?linkedin\.com\/.+/,
          "Please enter a valid LinkedIn URL",
        ],
        default: null,
      },
      twitter: {
        type: String,
        match: [
          /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/.+/,
          "Please enter a valid Twitter/X URL",
        ],
        default: null,
      },
      portfolio: {
        type: String,
        match: [/^https?:\/\/.+/, "Please enter a valid portfolio URL"],
        default: null,
      },
    },

    // Legacy fields (keeping for backward compatibility)
    github: {
      type: String,
      match: [
        /^https?:\/\/(www\.)?github\.com\/.+/,
        "Please enter a valid GitHub URL",
      ],
    },
    linkedin: {
      type: String,
      match: [
        /^https?:\/\/(www\.)?linkedin\.com\/in\/.+/,
        "Please enter a valid LinkedIn URL",
      ],
    },
    portfolio: {
      type: String,
      match: [/^https?:\/\/.+/, "Please enter a valid portfolio URL"],
    },

    // Employer-specific fields
    company: {
      type: String,
      maxlength: [100, "Company name cannot be more than 100 characters"],
      required: false, // Make optional during signup
    },
    companySize: {
      type: String,
      enum: ["1-10", "11-50", "51-200", "201-500", "500+"],
      required: false, // Make optional during signup
    },
    industry: {
      type: String,
      maxlength: [100, "Industry cannot be more than 100 characters"],
      required: false, // Make optional during signup
    },

    // Account status
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },

    // Verification tokens
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for user's projects
userSchema.virtual("projects", {
  ref: "Project",
  localField: "_id",
  foreignField: "owner",
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ userType: 1 });
userSchema.index({ skills: 1 });
userSchema.index({ location: 1 });

// Pre-save middleware to hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check password
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile
userSchema.methods.getPublicProfile = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.emailVerificationToken;
  delete userObject.emailVerificationExpires;
  delete userObject.passwordResetToken;
  delete userObject.passwordResetExpires;
  delete userObject.oauthId;
  return userObject;
};

// Static method to find by email
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method for OAuth users
userSchema.statics.findOrCreateOAuthUser = async function (profile, provider) {
  let user = await this.findOne({
    $or: [
      { email: profile.email },
      { oauthId: profile.id, oauthProvider: provider },
    ],
  });

  if (user) {
    // Update OAuth info if user exists
    if (!user.oauthProvider) {
      user.oauthProvider = provider;
      user.oauthId = profile.id;
      user.isEmailVerified = true;
      await user.save();
    }
    return user;
  }

  // Create new user
  const newUser = new this({
    fullName: profile.displayName || profile.name,
    email: profile.email,
    profilePicture: profile.picture || profile.avatar_url,
    oauthProvider: provider,
    oauthId: profile.id,
    isEmailVerified: true,
    userType: "developer", // Default, can be changed later
  });

  return await newUser.save();
};

module.exports = mongoose.model("User", userSchema);

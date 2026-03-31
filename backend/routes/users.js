const express = require("express");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");
const User = require("../models/User");

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get profile error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put("/profile", auth, async (req, res) => {
  try {
    const updates = { ...req.body };

    if (updates.name && !updates.fullName) {
      updates.fullName = updates.name;
    }
    delete updates.name;

    const allowedUpdates = [
      "fullName",
      "bio",
      "skills",
      "socialLinks",
      "title",
      "role",
      "location",
      "website",
      "github",
      "linkedin",
      "portfolio",
      "company",
      "companySize",
      "industry",
      "experience",
    ];

    const safeUpdates = Object.keys(updates).reduce((acc, key) => {
      if (allowedUpdates.includes(key)) {
        acc[key] = updates[key];
      }
      return acc;
    }, {});

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: safeUpdates },
      { new: true, runValidators: true }
    ).select("-password");

    const normalizedUser = user.toObject();
    normalizedUser.name = normalizedUser.fullName;

    res.json({
      success: true,
      user: normalizedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user public profile by ID
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get user profile error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   POST /api/users/profile-image
// @desc    Upload profile image
// @access  Private
router.post("/profile-image", auth, upload.profileImage, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select an image file to upload.",
      });
    }

    const uploadedPath = req.file.path || req.file.secure_url || req.file.url;
    const profileImageUrl = uploadedPath?.startsWith("http")
      ? uploadedPath
      : `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    // Update user's avatar URL in database
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          profilePicture: profileImageUrl,
        },
      },
      { new: true }
    ).select("-password");

    const normalizedUser = user.toObject();
    normalizedUser.profileImage = normalizedUser.profilePicture;
    normalizedUser.avatar = normalizedUser.profilePicture;

    res.json({
      success: true,
      message: "Profile image uploaded successfully",
      profileImageUrl,
      user: normalizedUser,
    });
  } catch (error) {
    console.error("Profile image upload error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while uploading image",
    });
  }
});

// Add multer error handling middleware
router.use(upload.handleMulterError);

// @route   DELETE /api/users/profile-image
// @desc    Remove profile image
// @access  Private
router.delete("/profile-image", auth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $unset: { profilePicture: 1 } },
      { new: true }
    ).select("-password");

    const normalizedUser = user.toObject();
    normalizedUser.profileImage = null;
    normalizedUser.avatar = null;

    res.json({
      success: true,
      message: "Profile image removed",
      user: normalizedUser,
    });
  } catch (error) {
    console.error("Remove profile image error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;

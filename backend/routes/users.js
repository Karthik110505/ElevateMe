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
    const updates = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true }
    ).select("-password");

    res.json({
      success: true,
      user,
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

    // Update user's avatar URL in database
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          avatar: req.file.path,
          profileImage: req.file.path,
        },
      },
      { new: true }
    ).select("-password");

    res.json({
      success: true,
      message: "Profile image uploaded successfully",
      profileImageUrl: req.file.path,
      user,
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
      { $unset: { profileImage: 1, avatar: 1 } },
      { new: true }
    ).select("-password");

    res.json({
      success: true,
      message: "Profile image removed",
      user,
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

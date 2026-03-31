const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const path = require("path");
const fs = require("fs");

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const hasCloudinaryConfig =
  !!process.env.CLOUDINARY_CLOUD_NAME &&
  !!process.env.CLOUDINARY_API_KEY &&
  !!process.env.CLOUDINARY_API_SECRET;

// Configure Cloudinary when credentials are available
if (hasCloudinaryConfig) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const localUploadStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "..", "uploads");
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const fileExt = path.extname(file.originalname || "").toLowerCase();
    const safeExt = fileExt || ".jpg";
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${safeExt}`);
  },
});

// Profile image specific storage configuration
const profileImageStorage = hasCloudinaryConfig
  ? new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: "elevateme/profile-images",
        allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
        public_id: (req, file) => {
          return `profile-${req.user.id}-${Date.now()}`;
        },
        transformation: [
          {
            width: 400,
            height: 400,
            crop: "fill",
            gravity: "face",
            quality: "auto:good",
          },
        ],
      },
    })
  : localUploadStorage;

// Regular project images storage configuration
const storage = hasCloudinaryConfig
  ? new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: "elevateme",
        allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
        public_id: (req, file) => {
          const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
          return `${file.fieldname}-${uniqueSuffix}`;
        },
        transformation: [
          { width: 1200, height: 800, crop: "limit", quality: "auto:good" },
        ],
      },
    })
  : localUploadStorage;

// File filter function
const fileFilter = (req, file, cb) => {
  // Check file type
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(
      new Error("Only image files (JPEG, JPG, PNG, GIF, WebP) are allowed!"),
      false
    );
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: MAX_IMAGE_SIZE_BYTES,
    files: 5, // Maximum 5 files at once
  },
  fileFilter: fileFilter,
});

// Configure multer for profile images
const profileImageUpload = multer({
  storage: profileImageStorage,
  limits: {
    fileSize: MAX_IMAGE_SIZE_BYTES,
    files: 1, // Only 1 profile image at a time
  },
  fileFilter: fileFilter,
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 5MB.",
      });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Too many files. Maximum is 5 files.",
      });
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message: "Unexpected file field.",
      });
    }
  }

  if (err?.message?.includes("Only image files")) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  next(err);
};

// Export different upload configurations
module.exports = {
  // Single file upload
  single: (fieldName) => upload.single(fieldName),

  // Multiple files upload
  multiple: (fieldName, maxCount = 5) => upload.array(fieldName, maxCount),

  // Multiple fields upload
  fields: (fields) => upload.fields(fields),

  // Profile image upload
  profileImage: profileImageUpload.single("profileImage"),

  // Handle multer errors
  handleMulterError,

  // Direct access to cloudinary for manual operations
  cloudinary,
};

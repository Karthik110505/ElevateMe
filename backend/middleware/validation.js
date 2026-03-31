const { body, validationResult } = require("express-validator");

// Validation rules for project creation
const validateProject = [
  body("title")
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters"),

  body("description")
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Description must be between 10 and 1000 characters"),

  body("githubLink")
    .optional({ checkFalsy: true })
    .trim()
    .isURL()
    .withMessage("GitHub link must be a valid URL"),

  body("liveSiteLink")
    .optional({ checkFalsy: true })
    .trim()
    .isURL()
    .withMessage("Live site link must be a valid URL"),

  body("videoDemo")
    .optional({ checkFalsy: true })
    .trim()
    .isURL()
    .withMessage("Video demo must be a valid URL"),

  body("tags")
    .optional()
    .custom((value) => {
      // If it's a string, try to parse it as JSON
      if (typeof value === "string") {
        try {
          const parsed = JSON.parse(value);
          if (!Array.isArray(parsed)) {
            throw new Error("Tags must be an array");
          }
          return true;
        } catch (e) {
          throw new Error("Invalid tags format");
        }
      }
      // If it's already an array, that's fine
      if (Array.isArray(value)) {
        return true;
      }
      throw new Error("Tags must be an array");
    }),
];

// Middleware to handle validation results
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation errors",
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
      })),
    });
  }
  next();
};

module.exports = {
  validateProject,
  handleValidationErrors,
};

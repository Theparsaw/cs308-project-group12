const fs = require("fs");
const path = require("path");
const multer = require("multer");
const AppError = require("../utils/appError");

const uploadsDir = path.join(__dirname, "..", "uploads", "profile-images");

// Make sure the upload folder exists before multer tries to write files into it
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const safeExtension = path.extname(file.originalname || "").toLowerCase() || ".jpg";
    cb(null, `profile-${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExtension}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new AppError("Please upload a valid image file", 400, "INVALID_FILE_TYPE"));
  }

  return cb(null, true);
};

const uploadProfilePhoto = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});

module.exports = {
  uploadProfilePhoto,
};

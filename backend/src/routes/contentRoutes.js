const express = require("express");
const multer = require("multer");
const path = require("path");

const {
  uploadContent,
  getContent,
  deleteContent
} = require("../controllers/contentController");

const router = express.Router();

/* ---------------- FILE VALIDATION ---------------- */

// Allowed MIME types
const allowedMimeTypes = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "application/pdf",
  "text/plain"
];

// Allowed file extensions
const allowedExtensions = [
  ".png",
  ".jpg",
  ".jpeg",
  ".pdf",
  ".txt"
];

/* ---------------- MULTER STORAGE ---------------- */

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const safeName =
      Date.now() +
      "-" +
      file.originalname.replace(/\s+/g, "_");

    cb(null, safeName);
  }
});

/* ---------------- MULTER CONFIG ---------------- */

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const ext = path
      .extname(file.originalname)
      .toLowerCase();

    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(
        new Error("Invalid file type (MIME not allowed)")
      );
    }

    if (!allowedExtensions.includes(ext)) {
      return cb(
        new Error("Invalid file extension")
      );
    }

    cb(null, true);
  }
});

/* ---------------- ROUTES ---------------- */

// Upload
router.post(
  "/upload",
  upload.single("file"),
  uploadContent
);

// Get (password-aware POST)
router.post("/:id", getContent);

// 🔥 Manual Delete Route
router.delete("/:id", deleteContent);

module.exports = router;

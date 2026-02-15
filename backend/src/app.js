const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const multer = require("multer");
const path = require("path");
const contentRoutes = require("./routes/contentRoutes");

const app = express();

/* ---------------- SECURITY MIDDLEWARE ---------------- */

// Hide "X-Powered-By: Express"
app.disable("x-powered-by");

// Secure HTTP headers
app.use(helmet());

// CORS Configuration
app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: false
  })
);

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

/* ---------------- BODY PARSING ---------------- */

// Limit JSON body size (prevents abuse)
app.use(express.json({ limit: "1mb" }));

/* ---------------- STATIC FILES ---------------- */

// Serve uploads folder securely
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    dotfiles: "deny",
    index: false,
    redirect: false
  })
);

/* ---------------- ROUTES ---------------- */

app.use("/api/content", contentRoutes);

/* ---------------- GLOBAL ERROR HANDLER ---------------- */

app.use((err, req, res, next) => {

  // Multer-specific errors
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      error: "File upload error: " + err.message,
    });
  }

  // Generic errors
  if (err) {
    console.error("GLOBAL ERROR:", err);
    return res.status(400).json({
      error: err.message || "Something went wrong",
    });
  }

  next();
});

module.exports = app;

const Content = require("../models/Content");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");

/* =========================================
   UPLOAD CONTENT
========================================= */

exports.uploadContent = async (req, res) => {
  try {
    const { text, expiryDateTime, maxViews, password } = req.body;

    // Must provide text OR file
    if (!text && !req.file) {
      return res.status(400).json({ error: "No content provided" });
    }

    // Text limit
    if (text && text.length > 5000) {
      return res.status(400).json({
        error: "Text exceeds 5000 character limit"
      });
    }

    // Validate maxViews
    let parsedMaxViews = null;
    if (maxViews !== undefined && maxViews !== "") {
      parsedMaxViews = Number(maxViews);

      if (isNaN(parsedMaxViews) || parsedMaxViews <= 0) {
        return res.status(400).json({
          error: "Invalid maximum views"
        });
      }
    }

    // Expiry logic (default 10 min)
    let expiresAt;
    if (expiryDateTime) {
      const userExpiry = new Date(expiryDateTime);

      if (isNaN(userExpiry.getTime()) || userExpiry <= new Date()) {
        return res.status(400).json({
          error: "Invalid expiry date"
        });
      }

      expiresAt = userExpiry;
    } else {
      expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    }

    // Hash password if provided
    let hashedPassword = null;
    if (password && password.trim() !== "") {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const content = new Content({
      type: text ? "text" : "file",
      text: text || null,
      fileUrl: req.file ? `/uploads/${req.file.filename}` : null,
      fileName: req.file ? req.file.originalname : null,
      expiresAt,
      maxViews: parsedMaxViews,
      viewsUsed: 0,
      password: hashedPassword
    });

    await content.save();

    return res.status(201).json({
      link: `http://localhost:5173/${content._id}`
    });

  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    return res.status(500).json({
      error: "Upload failed"
    });
  }
};

/* =========================================
   GET CONTENT
========================================= */

exports.getContent = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid link" });
    }

    const content = await Content.findById(id);

    if (!content) {
      return res.status(404).json({ error: "Content not found" });
    }

    // Expiry check
    if (content.expiresAt <= new Date()) {
      return res.status(410).json({ error: "Link expired" });
    }

    // Max views check
    if (
      content.maxViews !== null &&
      content.viewsUsed >= content.maxViews
    ) {
      return res.status(410).json({
        error: "Maximum views exceeded"
      });
    }

    // Password protection
    if (content.password) {
      if (!password) {
        return res.status(401).json({
          requirePassword: true
        });
      }

      const isMatch = await bcrypt.compare(password, content.password);

      if (!isMatch) {
        return res.status(403).json({
          error: "Incorrect password"
        });
      }
    }

    // Increment views AFTER validation
    content.viewsUsed += 1;
    await content.save();

    return res.status(200).json({
      type: content.type,
      text: content.text,
      fileUrl: content.fileUrl,
      fileName: content.fileName,
      expiresAt: content.expiresAt,
      maxViews: content.maxViews,
      viewsUsed: content.viewsUsed
    });

  } catch (err) {
    console.error("FETCH ERROR:", err);
    return res.status(500).json({
      error: "Something went wrong"
    });
  }
};

/* =========================================
   DELETE CONTENT
========================================= */

exports.deleteContent = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid link" });
    }

    const content = await Content.findById(id);

    if (!content) {
      return res.status(404).json({ error: "Content not found" });
    }

    // 🔐 If password protected → verify
    if (content.password) {
      if (!password) {
        return res.status(401).json({
          requirePassword: true
        });
      }

      const isMatch = await bcrypt.compare(
        password,
        content.password
      );

      if (!isMatch) {
        return res.status(403).json({
          error: "Incorrect password"
        });
      }
    }

    /* ================= FIXED FILE DELETE ================= */

    if (content.fileUrl) {
      const filePath = path.join(
        process.cwd(),
        content.fileUrl.replace(/^\//, "") // remove leading slash
      );

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Content.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Content deleted successfully"
    });

  } catch (err) {
    console.error("DELETE ERROR:", err);
    return res.status(500).json({
      error: "Delete failed"
    });
  }
};

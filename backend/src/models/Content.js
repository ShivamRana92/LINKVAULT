const mongoose = require("mongoose");

const contentSchema = new mongoose.Schema({
  type: { type: String, required: true },
  text: String,
  fileUrl: String,
  fileName: String,

  expiresAt: {
    type: Date,
    required: true
  },

  maxViews: {
    type: Number,
    default: null
  },

  viewsUsed: {
    type: Number,
    default: 0
  },

  // 🔐 NEW FIELD
  password: {
    type: String,
    default: null
  }

}, { timestamps: true });

// TTL index
contentSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Content", contentSchema);

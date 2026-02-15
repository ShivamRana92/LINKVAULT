require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");
const path = require("path");

// Connect Database
connectDB();

// 🔥 Serve uploaded files statically
app.use(
  "/uploads",
  require("express").static(path.join(__dirname, "uploads"))
);

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key"; // Ensure you set JWT_SECRET in .env
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error("❌ MongoDB URI is missing. Set MONGO_URI in .env file.");
  process.exit(1);
}

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });

// Connect to MongoDB
mongoose
  .connect(mongoURI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// Define User Schema and Model
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  nationality: { type: String, required: true },
  mobile: { type: String, required: true },
  dob: { type: Date, required: true },
  aadhaar: { type: String },
  aadhaarImage: { type: String },
  pan: { type: String },
  panImage: { type: String },
  passport: { type: String },
  passportImage: { type: String },
});

const User = mongoose.model("User", userSchema);

// Signup Endpoint
app.post(
  "/signup",
  upload.fields([
    { name: "aadhaarImage", maxCount: 1 },
    { name: "panImage", maxCount: 1 },
    { name: "passportImage", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { firstName, lastName, email, password, nationality, mobile, dob, aadhaar, pan, passport } = req.body;

      // Check if user already exists
      if (await User.findOne({ email })) {
        return res.status(400).json({ message: "Email already exists!" });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      const userData = {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        nationality,
        mobile,
        dob,
      };

      if (nationality === "India") {
        userData.aadhaar = aadhaar || null;
        userData.aadhaarImage = req.files["aadhaarImage"]?.[0]?.path || null;
        userData.pan = pan || null;
        userData.panImage = req.files["panImage"]?.[0]?.path || null;
      } else {
        userData.passport = passport || null;
        userData.passportImage = req.files["passportImage"]?.[0]?.path || null;
      }

      // Save new user
      await new User(userData).save();
      res.status(201).json({ message: "Signup successful! You can now log in." });
    } catch (err) {
      console.error("Signup Error:", err);
      res.status(500).json({ message: "An error occurred during signup." });
    }
  }
);

// Login Endpoint
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password!" });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });

    res.json({ message: "Login successful!", token, userId: user._id });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "An error occurred during login." });
  }
});

// Get User Details
app.get("/user-details/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found!" });
    res.json(user);
  } catch (err) {
    console.error("Fetch User Error:", err);
    res.status(500).json({ message: "An error occurred while fetching user details." });
  }
});

// Delete User
app.delete("/user/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found!" });

    ["aadhaarImage", "panImage", "passportImage"].forEach((field) => {
      if (user[field]) fs.unlinkSync(user[field]);
    });

    res.json({ message: "User deleted successfully!" });
  } catch (err) {
    console.error("Delete User Error:", err);
    res.status(500).json({ message: "An error occurred while deleting the user." });
  }
});

// Start Server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

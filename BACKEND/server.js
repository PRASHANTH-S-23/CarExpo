const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
//will add later
const mongoURI = process.env.MONGO_URI;

const app = express();
const PORT = 3000;
const JWT_SECRET = "your_jwt_secret_key"; // Replace with a secure key in production

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use("/uploads", express.static("uploads")); // Serve uploaded images

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique file name
  },
});

const upload = multer({ storage: storage });

// Connect to MongoDB
mongoose.connect("mongodb+srv://Prashanth_KUMAR_S_23:Prashanth23@carexpodb.hyrng.mongodb.net/?retryWrites=true&w=majority&appName=carExpoDB")
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("MongoDB connection error:", err));

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
      const {
        firstName,
        lastName,
        email,
        password,
        nationality,
        mobile,
        dob,
        aadhaar,
        pan,
        passport,
      } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists!" });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Prepare the user data
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
        userData.aadhaarImage = req.files["aadhaarImage"]
          ? req.files["aadhaarImage"][0].path
          : null;
        userData.pan = pan || null;
        userData.panImage = req.files["panImage"]
          ? req.files["panImage"][0].path
          : null;
      } else {
        userData.passport = passport || null;
        userData.passportImage = req.files["passportImage"]
          ? req.files["passportImage"][0].path
          : null;
      }

      // Save new user to the database
      const newUser = new User(userData);
      await newUser.save();

      res
        .status(201)
        .json({ message: "Signup successful! You can now log in." });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "An error occurred during signup." });
    }
  }
);

// Login Endpoint
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password!" });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password!" });
    }

    // Generate a JWT token
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ message: "Login successful!", token, userId: user._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "An error occurred during login." });
  }
});

// User Details Endpoint
app.get("/user-details/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "An error occurred while fetching user details." });
  }
});

// Delete User Endpoint
app.delete("/user/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    // Find and delete the user
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    // Optionally, remove uploaded images
    if (user.aadhaarImage) {
      const fs = require("fs");
      fs.unlinkSync(user.aadhaarImage);
    }
    if (user.panImage) {
      const fs = require("fs");
      fs.unlinkSync(user.panImage);
    }
    if (user.passportImage) {
      const fs = require("fs");
      fs.unlinkSync(user.passportImage);
    }

    res.json({ message: "User deleted successfully!" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "An error occurred while deleting the user." });
  }
});

// Start the Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

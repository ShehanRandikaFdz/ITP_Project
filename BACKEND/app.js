const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

// Import routes
const studentRoutes = require("./Routes/StudentRoutes");
const attendanceRoutes = require("./Routes/StudentAttendanceRoutes");
const examResultsRoutes = require("./Routes/ExamResultsRoutes");
const inventoryRoutes = require("./Routes/inventoryRoutes");
const recentActivityRoutes = require("./Routes/RecentActivityRoutes");
const staffRoutes = require("./Routes/StaffRoutes");
const leaveRoutes = require("./Routes/LeaveRoutes");
const staffAttendanceRoutes = require("./Routes/StaffAttendanceRoutes");
const eventRoutes = require("./Routes/EventRoutes");

const app = express();

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, "uploads");
const staffUploadsDir = path.join(uploadDir, "staff");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

if (!fs.existsSync(staffUploadsDir)) {
  fs.mkdirSync(staffUploadsDir, { recursive: true });
}

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  })
);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/student", studentRoutes);
app.use("/activity", recentActivityRoutes);
app.use("/inventory", inventoryRoutes);
app.use("/exam-results", examResultsRoutes);
app.use("/attendance", attendanceRoutes);
app.use("/events", eventRoutes);

// Staff management routes
app.use("/api/staff", staffRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/staff-attendance", staffAttendanceRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("Server is running...");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Connect to MongoDB
const MONGODB_URI = "mongodb+srv://admin:itp25@mkv.5cddqys.mongodb.net/SSMS";
const PORT = 5000;

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
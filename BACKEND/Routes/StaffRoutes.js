const express = require("express")
const router = express.Router()
const multer = require("multer")
const path = require("path")
const staffController = require("../Controllers/StaffController")

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/staff"))
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname)
    cb(null, "staff-" + uniqueSuffix + ext)
  },
})

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true)
    } else {
      cb(new Error("Only image files are allowed!"), false)
    }
  },
})

// Staff enrollment routes
router.post("/", upload.single("photo"), staffController.addStaff)
router.get("/", staffController.getAllStaff)
router.get("/:id", staffController.getStaffById)
router.put("/:id", upload.single("photo"), staffController.updateStaff)
router.delete("/:id", staffController.deleteStaff)

// Authentication routes
router.post("/login", staffController.login)
router.post("/change-password/:id", staffController.changePassword)

// Dashboard routes
router.get("/dashboard/staff/:id", staffController.getStaffDashboard)
router.get("/dashboard/admin", staffController.getAdminDashboard)

module.exports = router

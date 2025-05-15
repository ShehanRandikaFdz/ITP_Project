const express = require("express")
const router = express.Router()
const leaveController = require("../Controllers/LeaveController")

// Leave management routes
router.post("/", leaveController.applyLeave)
router.get("/", leaveController.getAllLeaves)
router.get("/staff/:staffId", leaveController.getStaffLeaves)
router.get("/pending", leaveController.getPendingLeaves)
router.get("/balance/:staffId", leaveController.getLeaveBalance)

// Process leave (approve/reject) - must come before /:id routes
router.put("/:id/process", leaveController.updateLeaveStatus)

// Standard CRUD operations
router.get("/:id", leaveController.getLeaveById)
router.put("/:id", leaveController.updateLeave)
router.delete("/:id", leaveController.deleteLeave)

router.get("/report/monthly/:month/:year", leaveController.getMonthlyLeaveReport)
router.get("/report/annual/:year", leaveController.getAnnualLeaveReport)
router.get("/report/generate", leaveController.generateLeaveReport)
router.get("/chart/staff/:staffId", leaveController.getStaffLeaveChart)
router.get("/prediction/:staffId", leaveController.getLeavePrediction)

module.exports = router

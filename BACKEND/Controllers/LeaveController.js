const Leave = require("../Models/LeaveModel")
const Staff = require("../Models/StaffModel")
const mongoose = require("mongoose")

// Helper function to send SMS (mock implementation)
const sendSMS = async (phoneNumber, message) => {
  console.log(`SMS sent to ${phoneNumber}: ${message}`)
  // In a real implementation, you would use a service like Twilio, Nexmo, etc.
  return true
}

// Apply for leave
exports.applyLeave = async (req, res) => {
  try {
    const { staffId, leaveType, startDate, endDate, halfDay, reason } = req.body

    // Validate staff exists
    const staff = await Staff.findById(staffId)
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found",
      })
    }

    // Calculate duration in days
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end - start)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 // +1 to include both start and end dates

    // Adjust duration for half day
    const duration = halfDay ? diffDays - 0.5 : diffDays

    // Create new leave request
    const newLeave = new Leave({
      staffId,
      leaveType,
      startDate,
      endDate,
      duration,
      halfDay,
      reason,
      // Attachments would be handled separately with file uploads
    })

    await newLeave.save()

    res.status(201).json({
      success: true,
      message: "Leave request submitted successfully",
      data: newLeave,
    })
  } catch (error) {
    console.error("Error applying for leave:", error)
    res.status(500).json({
      success: false,
      message: "Failed to submit leave request",
      error: error.message,
    })
  }
}

// Get all leave requests
exports.getAllLeaves = async (req, res) => {
  try {
    const { status, startDate, endDate, leaveType } = req.query
    const query = {}

    // Apply filters
    if (status) {
      query.status = status
    }

    if (leaveType) {
      query.leaveType = leaveType
    }

    if (startDate && endDate) {
      query.startDate = { $gte: new Date(startDate) }
      query.endDate = { $lte: new Date(endDate) }
    } else if (startDate) {
      query.startDate = { $gte: new Date(startDate) }
    } else if (endDate) {
      query.endDate = { $lte: new Date(endDate) }
    }

    const leaves = await Leave.find(query)
      .populate("staffId", "staffId fullName email phoneNumber staffType")
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: leaves.length,
      data: leaves,
    })
  } catch (error) {
    console.error("Error fetching leave requests:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch leave requests",
      error: error.message,
    })
  }
}

// Get leave requests for a specific staff member
exports.getStaffLeaves = async (req, res) => {
  try {
    const { staffId } = req.params
    const { status } = req.query

    const query = { staffId }

    if (status) {
      query.status = status
    }

    const leaves = await Leave.find(query).sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: leaves.length,
      data: leaves,
    })
  } catch (error) {
    console.error("Error fetching staff leave requests:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch staff leave requests",
      error: error.message,
    })
  }
}

// Get pending leave requests
exports.getPendingLeaves = async (req, res) => {
  try {
    const pendingLeaves = await Leave.find({ status: "Pending" })
      .populate("staffId", "staffId fullName email phoneNumber staffType")
      .sort({ createdAt: 1 }) // Oldest first

    res.status(200).json({
      success: true,
      count: pendingLeaves.length,
      data: pendingLeaves,
    })
  } catch (error) {
    console.error("Error fetching pending leave requests:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch pending leave requests",
      error: error.message,
    })
  }
}

// Get leave request by ID
exports.getLeaveById = async (req, res) => {
  try {
    const { id } = req.params
    const leave = await Leave.findById(id).populate("staffId", "staffId fullName email phoneNumber staffType")

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found",
      })
    }

    res.status(200).json({
      success: true,
      data: leave,
    })
  } catch (error) {
    console.error("Error fetching leave request:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch leave request",
      error: error.message,
    })
  }
}

// Update leave request
exports.updateLeave = async (req, res) => {
  try {
    const { id } = req.params
    const { leaveType, startDate, endDate, halfDay, reason } = req.body

    // Find leave request
    const leave = await Leave.findById(id)
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found",
      })
    }

    // Only allow updates if status is pending
    if (leave.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "Cannot update leave request that has been processed",
      })
    }

    // Calculate duration in days if dates changed
    let duration = leave.duration
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      const diffTime = Math.abs(end - start)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
      duration =
        halfDay !== undefined ? (halfDay ? diffDays - 0.5 : diffDays) : leave.halfDay ? diffDays - 0.5 : diffDays
    }

    // Update leave request
    const updatedLeave = await Leave.findByIdAndUpdate(
      id,
      {
        leaveType: leaveType || leave.leaveType,
        startDate: startDate || leave.startDate,
        endDate: endDate || leave.endDate,
        duration,
        halfDay: halfDay !== undefined ? halfDay : leave.halfDay,
        reason: reason || leave.reason,
      },
      { new: true },
    )

    res.status(200).json({
      success: true,
      message: "Leave request updated successfully",
      data: updatedLeave,
    })
  } catch (error) {
    console.error("Error updating leave request:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update leave request",
      error: error.message,
    })
  }
}

// Delete leave request
exports.deleteLeave = async (req, res) => {
  try {
    const { id } = req.params

    // Find leave request
    const leave = await Leave.findById(id)
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found",
      })
    }

    // Only allow deletion if status is pending
    if (leave.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete leave request that has been processed",
      })
    }

    await Leave.findByIdAndDelete(id)

    res.status(200).json({
      success: true,
      message: "Leave request deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting leave request:", error)
    res.status(500).json({
      success: false,
      message: "Failed to delete leave request",
      error: error.message,
    })
  }
}

// Update leave status (approve/reject)
exports.updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status, approvedBy, rejectionReason } = req.body

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'Approved' or 'Rejected'",
      })
    }

    // Find leave request
    const leave = await Leave.findById(id)
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found",
      })
    }

    // Find staff member
    const staff = await Staff.findById(leave.staffId)
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found",
      })
    }

    // Update leave status
    const updateData = {
      status,
      approvedBy,
      approvedDate: new Date(),
    }

    if (status === "Rejected" && rejectionReason) {
      updateData.rejectionReason = rejectionReason
    }

    const updatedLeave = await Leave.findByIdAndUpdate(id, updateData, { new: true })

    // Send SMS notification
    const message =
      status === "Approved"
        ? `Your leave request from ${leave.startDate.toLocaleDateString()} to ${leave.endDate.toLocaleDateString()} has been approved.`
        : `Your leave request from ${leave.startDate.toLocaleDateString()} to ${leave.endDate.toLocaleDateString()} has been rejected. Reason: ${rejectionReason || "Not specified"}`

    await sendSMS(staff.phoneNumber, message)

    res.status(200).json({
      success: true,
      message: `Leave request ${status.toLowerCase()} successfully`,
      data: updatedLeave,
    })
  } catch (error) {
    console.error("Error updating leave status:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update leave status",
      error: error.message,
    })
  }
}

// Get leave balance for a staff member
exports.getLeaveBalance = async (req, res) => {
  try {
    const { staffId } = req.params
    const { year } = req.query
    
    const currentYear = new Date().getFullYear()
    const requestedYear = year ? parseInt(year) : currentYear
    const previousYear = requestedYear - 1
    
    // Find staff member
    const staff = await Staff.findById(staffId)
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found",
      })
    }

    // Get all approved leaves for this staff member (regardless of date)
    const approvedLeaves = await Leave.find({
      staffId,
      status: "Approved",
    })

    // Calculate taken leaves by type
    const takenLeaves = {
      Annual: 0,
      Casual: 0,
      Medical: 0,
      Other: 0,
      Total: 0,
    }

    approvedLeaves.forEach((leave) => {
      takenLeaves[leave.leaveType] += leave.duration
      takenLeaves.Total += leave.duration
    })

    // Default leave allocation (can be customized based on staff type, years of service, etc.)
    const leaveAllocation = {
      Annual: 14,
      Casual: 7,
      Medical: 21,
      Other: 0,
      Total: 42,
    }

    // Calculate remaining leaves
    const remainingLeaves = {
      Annual: leaveAllocation.Annual - takenLeaves.Annual,
      Casual: leaveAllocation.Casual - takenLeaves.Casual,
      Medical: leaveAllocation.Medical - takenLeaves.Medical,
      Other: leaveAllocation.Other - takenLeaves.Other,
      Total: leaveAllocation.Total - takenLeaves.Total,
      remaining: leaveAllocation.Total - takenLeaves.Total
    }

    // Create monthly stats for current year
    const monthlyStats = Array(12).fill().map(() => ({ fullDay: 0, halfDay: 0 }));
    const prevMonthlyStats = Array(12).fill().map(() => ({ fullDay: 0, halfDay: 0 }));
    
    // Process all leaves to populate monthly stats
    approvedLeaves.forEach(leave => {
      const leaveStartDate = new Date(leave.startDate);
      const leaveYear = leaveStartDate.getFullYear();
      const leaveMonth = leaveStartDate.getMonth();
      
      if (leaveYear === requestedYear) {
        if (leave.halfDay) {
          monthlyStats[leaveMonth].halfDay += leave.duration;
        } else {
          monthlyStats[leaveMonth].fullDay += leave.duration;
        }
      } else if (leaveYear === previousYear) {
        if (leave.halfDay) {
          prevMonthlyStats[leaveMonth].halfDay += leave.duration;
        } else {
          prevMonthlyStats[leaveMonth].fullDay += leave.duration;
        }
      }
    });

    res.status(200).json({
      success: true,
      data: {
        allocation: leaveAllocation,
        taken: takenLeaves,
        remaining: remainingLeaves,
        monthlyStats,
        prevMonthlyStats,
        year: requestedYear,
        previousYear
      },
    })
  } catch (error) {
    console.error("Error fetching leave balance:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch leave balance",
      error: error.message,
    })
  }
}

// Get monthly leave report
exports.getMonthlyLeaveReport = async (req, res) => {
  try {
    const { month, year } = req.params
    const monthNum = Number.parseInt(month) - 1 // JavaScript months are 0-indexed
    const yearNum = Number.parseInt(year)

    const startDate = new Date(yearNum, monthNum, 1)
    const endDate = new Date(yearNum, monthNum + 1, 0) // Last day of month

    const leaves = await Leave.find({
      status: "Approved",
      startDate: { $lte: endDate },
      endDate: { $gte: startDate },
    }).populate("staffId", "staffId fullName staffType")

    // Process data for report
    const reportData = leaves.map((leave) => ({
      staffId: leave.staffId.staffId,
      staffName: leave.staffId.fullName,
      staffType: leave.staffId.staffType,
      leaveType: leave.leaveType,
      startDate: leave.startDate,
      endDate: leave.endDate,
      duration: leave.duration,
      halfDay: leave.halfDay,
    }))

    res.status(200).json({
      success: true,
      month: monthNum + 1,
      year: yearNum,
      count: reportData.length,
      data: reportData,
    })
  } catch (error) {
    console.error("Error generating monthly leave report:", error)
    res.status(500).json({
      success: false,
      message: "Failed to generate monthly leave report",
      error: error.message,
    })
  }
}

// Get annual leave report
exports.getAnnualLeaveReport = async (req, res) => {
  try {
    const { year } = req.params
    const yearNum = Number.parseInt(year)

    const startDate = new Date(yearNum, 0, 1)
    const endDate = new Date(yearNum, 11, 31)

    const leaves = await Leave.find({
      status: "Approved",
      startDate: { $lte: endDate },
      endDate: { $gte: startDate },
    }).populate("staffId", "staffId fullName staffType")

    // Process data for report
    const reportData = leaves.map((leave) => ({
      staffId: leave.staffId.staffId,
      staffName: leave.staffId.fullName,
      staffType: leave.staffId.staffType,
      leaveType: leave.leaveType,
      startDate: leave.startDate,
      endDate: leave.endDate,
      duration: leave.duration,
      halfDay: leave.halfDay,
    }))

    // Group by month for chart data
    const monthlyData = Array(12).fill(0)
    const halfDayData = Array(12).fill(0)

    leaves.forEach((leave) => {
      // This is a simplified calculation - in a real app, you'd need to handle leaves spanning multiple months
      const month = leave.startDate.getMonth()
      if (leave.halfDay) {
        halfDayData[month] += leave.duration
      } else {
        monthlyData[month] += leave.duration
      }
    })

    res.status(200).json({
      success: true,
      year: yearNum,
      count: reportData.length,
      data: reportData,
      chartData: {
        fullDay: monthlyData,
        halfDay: halfDayData,
      },
    })
  } catch (error) {
    console.error("Error generating annual leave report:", error)
    res.status(500).json({
      success: false,
      message: "Failed to generate annual leave report",
      error: error.message,
    })
  }
}

// Get staff leave chart data
exports.getStaffLeaveChart = async (req, res) => {
  try {
    const { staffId } = req.params
    const currentYear = new Date().getFullYear()
    const previousYear = currentYear - 1

    // Get current year data
    const currentYearStart = new Date(currentYear, 0, 1)
    const currentYearEnd = new Date(currentYear, 11, 31)

    const currentYearLeaves = await Leave.find({
      staffId,
      status: "Approved",
      startDate: { $gte: currentYearStart, $lte: currentYearEnd },
    })

    // Get previous year data
    const previousYearStart = new Date(previousYear, 0, 1)
    const previousYearEnd = new Date(previousYear, 11, 31)

    const previousYearLeaves = await Leave.find({
      staffId,
      status: "Approved",
      startDate: { $gte: previousYearStart, $lte: previousYearEnd },
    })

    // Process data for chart
    const currentYearData = Array(12).fill(0)
    const currentYearHalfDayData = Array(12).fill(0)
    const previousYearData = Array(12).fill(0)
    const previousYearHalfDayData = Array(12).fill(0)

    // Process current year leaves
    currentYearLeaves.forEach((leave) => {
      const month = leave.startDate.getMonth()
      if (leave.halfDay) {
        currentYearHalfDayData[month] += leave.duration
      } else {
        currentYearData[month] += leave.duration
      }
    })

    // Process previous year leaves
    previousYearLeaves.forEach((leave) => {
      const month = leave.startDate.getMonth()
      if (leave.halfDay) {
        previousYearHalfDayData[month] += leave.duration
      } else {
        previousYearData[month] += leave.duration
      }
    })

    res.status(200).json({
      success: true,
      data: {
        currentYear: {
          year: currentYear,
          fullDay: currentYearData,
          halfDay: currentYearHalfDayData,
        },
        previousYear: {
          year: previousYear,
          fullDay: previousYearData,
          halfDay: previousYearHalfDayData,
        },
      },
    })
  } catch (error) {
    console.error("Error generating staff leave chart:", error)
    res.status(500).json({
      success: false,
      message: "Failed to generate staff leave chart",
      error: error.message,
    })
  }
}

// Get leave prediction
exports.getLeavePrediction = async (req, res) => {
  try {
    const { staffId } = req.params

    // Get historical leave data for the staff member
    const historicalLeaves = await Leave.find({
      staffId,
      status: "Approved",
    }).sort({ startDate: 1 })

    if (historicalLeaves.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No historical data available for prediction",
        data: {
          monthlyPrediction: Array(12).fill(0),
        },
      })
    }

    // Group leaves by month
    const leavesByMonth = Array(12).fill(0)

    historicalLeaves.forEach((leave) => {
      const month = leave.startDate.getMonth()
      leavesByMonth[month] += leave.duration
    })

    // Simple prediction based on historical patterns
    // In a real app, you'd use more sophisticated algorithms
    const totalYears = new Set(historicalLeaves.map((leave) => leave.startDate.getFullYear())).size || 1

    // Average leaves per month based on historical data
    const monthlyPrediction = leavesByMonth.map((count) => +(count / totalYears).toFixed(1))

    res.status(200).json({
      success: true,
      data: {
        monthlyPrediction,
      },
    })
  } catch (error) {
    console.error("Error generating leave prediction:", error)
    res.status(500).json({
      success: false,
      message: "Failed to generate leave prediction",
      error: error.message,
    })
  }
}

// Generate leave report based on query parameters
exports.generateLeaveReport = async (req, res) => {
  try {
    const { month, year, staffId } = req.query;
    const query = { status: "Approved" };
    
    // Apply filters
    if (staffId) {
      query.staffId = staffId;
    }
    
    // Handle date filtering
    if (year) {
      const yearNum = parseInt(year);
      if (month) {
        // Month and year specified
        const monthNum = parseInt(month) - 1; // JS months are 0-indexed
        const startDate = new Date(yearNum, monthNum, 1);
        const endDate = new Date(yearNum, monthNum + 1, 0); // Last day of month
        
        query.startDate = { $lte: endDate };
        query.endDate = { $gte: startDate };
      } else {
        // Only year specified
        const startDate = new Date(yearNum, 0, 1);
        const endDate = new Date(yearNum, 11, 31);
        
        query.startDate = { $lte: endDate };
        query.endDate = { $gte: startDate };
      }
    }
    
    // Fetch leaves with applied filters
    const leaves = await Leave.find(query)
      .populate("staffId", "staffId fullName email phoneNumber staffType")
      .sort({ startDate: -1 });
      
    // Process leave data for report
    const report = leaves.map(leave => ({
      _id: leave._id,
      staffId: leave.staffId.staffId,
      staffName: leave.staffId.fullName,
      staffType: leave.staffId.staffType,
      leaveType: leave.leaveType,
      startDate: leave.startDate,
      endDate: leave.endDate,
      duration: leave.duration,
      halfDay: leave.halfDay,
      status: leave.status
    }));
    
    // Calculate summary statistics
    const summary = {
      totalRequests: report.length,
      totalDays: report.reduce((sum, leave) => sum + leave.duration, 0),
      byType: {
        Annual: report.filter(leave => leave.leaveType === "Annual").length,
        Casual: report.filter(leave => leave.leaveType === "Casual").length,
        Medical: report.filter(leave => leave.leaveType === "Medical").length
      }
    };
    
    res.status(200).json({
      success: true,
      filters: { month, year, staffId },
      summary,
      report
    });
  } catch (error) {
    console.error("Error generating leave report:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate leave report",
      error: error.message
    });
  }
};

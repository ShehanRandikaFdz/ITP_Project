const mongoose = require("mongoose")

const LeaveSchema = new mongoose.Schema(
  {
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
    },
    leaveType: {
      type: String,
      enum: ["Annual", "Casual", "Medical", "Other"],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number, // Number of days
      required: true,
    },
    halfDay: {
      type: Boolean,
      default: false,
    },
    halfDayType: {
      type: String,
      enum: ["First Half", "Second Half"],
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
    },
    approvedDate: {
      type: Date,
    },
    rejectionReason: {
      type: String,
    },
    attachments: [
      {
        type: String, // File paths
      },
    ],
    year: {
      type: Number,
      required: true,
      default: () => new Date().getFullYear(),
    },
    month: {
      type: Number,
      required: true,
      default: () => new Date().getMonth() + 1,
    },
    notificationSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

// Create indexes for efficient querying
LeaveSchema.index({ staffId: 1, year: 1 })
LeaveSchema.index({ status: 1, startDate: 1 })
LeaveSchema.index({ staffId: 1, status: 1 })

// Virtual for leave status change notification
LeaveSchema.virtual('statusChanged').get(function() {
  return this.isModified('status')
})

module.exports = mongoose.model("Leave", LeaveSchema)

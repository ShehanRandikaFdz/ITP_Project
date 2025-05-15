const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const SALT_WORK_FACTOR = 10

// Generate a unique staff ID
const generateStaffId = () => {
  // Format: ST-YYYYNNNNN (Year + 5 digit number)
  const year = new Date().getFullYear().toString()
  const randomDigits = Math.floor(10000 + Math.random() * 90000).toString() // 5 digits
  return `ST-${year}${randomDigits}`
}

const StaffSchema = new mongoose.Schema(
  {
    staffId: {
      type: String,
      unique: true,
      default: generateStaffId,
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    nic: {
      type: String,
      required: [true, "NIC is required"],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/.+@.+\..+/, "Please enter a valid email address"],
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    staffType: {
      type: String,
      required: [true, "Staff type is required"],
      enum: ["Academic", "Non-Academic"],
    },
    designation: {
      type: String,
      required: [true, "Designation is required"],
      trim: true,
    },
    photo: {
      type: String,
      default: "/default-avatar.png",
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    rfidCardId: {
      type: String,
      unique: true,
      sparse: true,
    },
    leaveBalance: {
      annual: { type: Number, default: 21 }, // Annual leave days
      casual: { type: Number, default: 7 },  // Casual leave days
      medical: { type: Number, default: 14 }, // Medical leave days
    },
    role: {
      type: String,
      enum: ["admin", "staff"],
      default: "staff",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    passwordChangedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
)

// Hash password before saving
StaffSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified or is new
  if (!this.isModified("password")) return next()

  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(SALT_WORK_FACTOR)
    // Hash the password along with the new salt
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Method to compare passwords
StaffSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

// Method to check if password was changed after a certain timestamp
StaffSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10)
    return JWTTimestamp < changedTimestamp
  }
  return false
}

module.exports = mongoose.model("Staff", StaffSchema)

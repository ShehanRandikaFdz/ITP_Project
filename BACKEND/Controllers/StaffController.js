const Staff = require("../Models/StaffModel")
const crypto = require("crypto")
const fs = require("fs")
const path = require("path")
const nodemailer = require("nodemailer")

// Email configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

// Helper function to generate random password
const generatePassword = () => {
  return Math.random().toString(36).slice(-8) // Generate 8 character password
}

// Helper function to send email
const sendEmail = async (email, password) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your Staff Account Credentials",
    html: `
      <h2>Welcome to the Staff Management System</h2>
      <p>Your account has been created successfully.</p>
      <p>Here are your login credentials:</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Password:</strong> ${password}</p>
      <p>Please change your password after your first login.</p>
      <p>Best regards,<br>Staff Management System</p>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    return true
  } catch (error) {
    console.error("Error sending email:", error)
    return false
  }
}

// Enroll a new staff member
const addStaff = async (req, res) => {
  try {
    const {
      fullName,
      nic,
      email,
      phoneNumber,
      address,
      staffType,
      designation,
    } = req.body

    // Validate required fields
    if (!fullName || !nic || !email || !phoneNumber || !address || !staffType || !designation) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      })
    }

    // Check if staff already exists
    const existingStaff = await Staff.findOne({
      $or: [{ email }, { nic }],
    })

    if (existingStaff) {
      return res.status(400).json({
        success: false,
        message: "Staff member with this email or NIC already exists",
      })
    }

    // Create new staff member with NIC as password
    const newStaff = new Staff({
      fullName,
      nic,
      email,
      phoneNumber,
      address,
      staffType,
      designation,
      password: nic, // Use NIC as initial password
      photo: req.file ? `/uploads/staff/${req.file.filename}` : "/default-avatar.png",
    })

    await newStaff.save()

    // Send email with credentials if email configuration is available
    let emailSent = false;
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      emailSent = await sendEmail(email, nic); // Send NIC as password
    }

    res.status(201).json({
      success: true,
      message: "Staff member added successfully",
      data: {
        ...newStaff.toObject(),
        password: undefined, // Don't send password in response
      },
      emailSent,
    })
  } catch (error) {
    console.error("Error adding staff:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add staff member",
      error: error.message,
    })
  }
}

// Get all staff members
const getAllStaff = async (req, res) => {
  try {
    const { search, staffType, sort } = req.query
    let query = {}

    // Apply search filter
    if (search) {
      query = {
        $or: [
          { fullName: { $regex: search, $options: "i" } },
          { nic: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } }
        ],
      }
    }

    // Apply staff type filter
    if (staffType) {
      query.staffType = staffType.toLowerCase() // Convert to lowercase to match enum
    }

    // Apply sorting
    let sortOption = {}
    if (sort === "name") {
      sortOption = { fullName: 1 }
    } else if (sort === "type") {
      sortOption = { staffType: 1 }
    } else {
      sortOption = { createdAt: -1 } // Default sort by creation date (newest first)
    }

    const staff = await Staff.find(query).sort(sortOption).lean()

    // Get staff counts
    const academicCount = await Staff.countDocuments({ staffType: "academic" })
    const nonAcademicCount = await Staff.countDocuments({ staffType: "non-academic" })
    const totalCount = await Staff.countDocuments()

    res.status(200).json({
      success: true,
      data: staff,
      counts: {
        total: totalCount,
        academic: academicCount,
        nonAcademic: nonAcademicCount,
      },
    })
  } catch (error) {
    console.error("Error fetching staff:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch staff members",
      error: error.message,
    })
  }
}

// Get staff member by ID
const getStaffById = async (req, res) => {
  try {
    const { id } = req.params
    const staff = await Staff.findById(id).select("-password")

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found",
      })
    }

    res.status(200).json({
      success: true,
      data: staff,
    })
  } catch (error) {
    console.error("Error fetching staff member:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch staff member",
      error: error.message,
    })
  }
}

// Update staff member by ID
const updateStaff = async (req, res) => {
  try {
    const { id } = req.params
    const { fullName, nic, email, phoneNumber, address, staffType, designation } = req.body

    // Check if staff exists
    const staff = await Staff.findById(id)
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found",
      })
    }

    // Check if email or NIC is already used by another staff member
    const existingStaff = await Staff.findOne({
      $and: [{ _id: { $ne: id } }, { $or: [{ email }, { nic }] }],
    })

    if (existingStaff) {
      return res.status(400).json({
        success: false,
        message: "Email or NIC already in use by another staff member",
      })
    }

    // Update staff data
    staff.fullName = fullName || staff.fullName
    staff.nic = nic || staff.nic
    staff.email = email || staff.email
    staff.phoneNumber = phoneNumber || staff.phoneNumber
    staff.address = address || staff.address
    staff.staffType = staffType || staff.staffType
    staff.designation = designation || staff.designation

    // Update photo if provided via multer
    if (req.file) {
      // Delete old photo if it's not the default
      if (staff.photo && staff.photo !== "/default-avatar.png") {
        const oldPhotoPath = path.join(__dirname, "..", staff.photo)
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath)
        }
      }
      staff.photo = `/uploads/staff/${req.file.filename}`
    }

    await staff.save()

    res.status(200).json({
      success: true,
      message: "Staff member updated successfully",
      data: {
        ...staff.toObject(),
        password: undefined,
      },
    })
  } catch (error) {
    console.error("Error updating staff member:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update staff member",
      error: error.message,
    })
  }
}

// Delete staff member by ID
const deleteStaff = async (req, res) => {
  try {
    const { id } = req.params

    const staff = await Staff.findById(id)
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found",
      })
    }

    // Delete staff photo if it's not the default
    if (staff.photo && staff.photo !== "/default-avatar.png") {
      const photoPath = path.join(__dirname, "..", staff.photo)
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath)
      }
    }

    await Staff.findByIdAndDelete(id)

    res.status(200).json({
      success: true,
      message: "Staff member deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting staff member:", error)
    res.status(500).json({
      success: false,
      message: "Failed to delete staff member",
      error: error.message,
    })
  }
}

// Staff login
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Find staff by email
    const staff = await Staff.findOne({ email });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found",
      });
    }

    // Verify role
    if (staff.role !== role) {
      return res.status(403).json({
        success: false,
        message: "Invalid role for this account",
      });
    }

    // Check password
    const isPasswordValid = await staff.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    // Update last login
    staff.lastLogin = new Date();
    await staff.save();

    // Generate token (you might want to use JWT here)
    const token = crypto.randomBytes(32).toString('hex');

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      data: {
        _id: staff._id,
        staffId: staff.staffId,
        fullName: staff.fullName,
        email: staff.email,
        phoneNumber: staff.phoneNumber,
        staffType: staff.staffType,
        designation: staff.designation,
        photo: staff.photo,
        role: staff.role
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { id } = req.params
    const { currentPassword, newPassword } = req.body

    const staff = await Staff.findById(id)
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found",
      })
    }

    // Verify current password
    const isPasswordValid = await staff.comparePassword(currentPassword)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      })
    }

    // Update password
    staff.password = newPassword
    await staff.save()

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    })
  } catch (error) {
    console.error("Error changing password:", error)
    res.status(500).json({
      success: false,
      message: "Failed to change password",
      error: error.message,
    })
  }
}

// Get staff dashboard data
const getStaffDashboard = async (req, res) => {
  try {
    const { id } = req.params

    const staff = await Staff.findById(id).select("-password")
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found",
      })
    }

    // Get additional data for dashboard (can be expanded)
    const dashboardData = {
      staff: staff,
      // Add more dashboard data as needed
    }

    res.status(200).json({
      success: true,
      data: dashboardData,
    })
  } catch (error) {
    console.error("Error fetching staff dashboard:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch staff dashboard",
      error: error.message,
    })
  }
}

// Get admin dashboard data
const getAdminDashboard = async (req, res) => {
  try {
    // Get staff counts
    const totalStaff = await Staff.countDocuments()
    const academicStaff = await Staff.countDocuments({ staffType: "academic" })
    const nonAcademicStaff = await Staff.countDocuments({ staffType: "non-academic" })

    // Get recent staff additions (last 5)
    const recentStaff = await Staff.find().select("-password").sort({ createdAt: -1 }).limit(5).lean()

    const dashboardData = {
      counts: {
        total: totalStaff,
        academic: academicStaff,
        nonAcademic: nonAcademicStaff,
      },
      recentStaff,
      // Add more dashboard data as needed
    }

    res.status(200).json({
      success: true,
      data: dashboardData,
    })
  } catch (error) {
    console.error("Error fetching admin dashboard:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch admin dashboard",
      error: error.message,
    })
  }
}

// Create default admin user if none exists
const createDefaultAdmin = async () => {
  try {
    const adminExists = await Staff.findOne({ role: 'admin' });
    if (!adminExists) {
      const admin = new Staff({
        fullName: 'System Admin',
        nic: '123456789V',
        email: 'admin@school.com',
        phoneNumber: '0771234567',
        address: 'School Office',
        staffType: 'Non-Academic',
        designation: 'System Administrator',
        password: 'Admin@123', // This will be hashed by the pre-save middleware
        role: 'admin',
        isActive: true
      });
      await admin.save();
      console.log('Default admin user created successfully');
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
};

// Create default staff user if none exists
const createDefaultStaff = async () => {
  try {
    const staffExists = await Staff.findOne({ email: 'staff@school.com' });
    if (!staffExists) {
      const staff = new Staff({
        fullName: 'Test Staff',
        nic: '987654321V',
        email: 'staff@school.com',
        phoneNumber: '0777654321',
        address: 'Staff Quarters',
        staffType: 'Academic',
        designation: 'Teacher',
        password: 'Staff@123', // This will be hashed by the pre-save middleware
        role: 'staff',
        isActive: true
      });
      await staff.save();
      console.log('Default staff user created successfully');
    }
  } catch (error) {
    console.error('Error creating default staff:', error);
  }
};

// Call the function when the server starts
createDefaultAdmin();
createDefaultStaff();

module.exports = {
  addStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
  login,
  changePassword,
  getStaffDashboard,
  getAdminDashboard,
}

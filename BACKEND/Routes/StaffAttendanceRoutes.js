const express = require('express');
const router = express.Router();
const StaffAttendance = require('../Models/StaffAttendance');
const Staff = require('../Models/Staff');

// Get all staff attendance records
router.get('/', async (req, res) => {
  try {
    const attendance = await StaffAttendance.find()
      .populate('staffId', 'name email')
      .sort({ date: -1 });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get attendance for a specific staff member
router.get('/:staffId', async (req, res) => {
  try {
    const attendance = await StaffAttendance.find({ staffId: req.params.staffId })
      .populate('staffId', 'name email')
      .sort({ date: -1 });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new attendance record
router.post('/', async (req, res) => {
  try {
    const { staffId, date, status, remarks } = req.body;
    
    // Check if staff exists
    const staff = await Staff.findById(staffId);
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    // Check if attendance record already exists for this date
    const existingRecord = await StaffAttendance.findOne({
      staffId,
      date: new Date(date)
    });

    if (existingRecord) {
      return res.status(400).json({ message: 'Attendance record already exists for this date' });
    }

    const newAttendance = new StaffAttendance({
      staffId,
      date: new Date(date),
      status,
      remarks
    });

    const savedAttendance = await newAttendance.save();
    res.status(201).json(savedAttendance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update an attendance record
router.put('/:id', async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const updatedAttendance = await StaffAttendance.findByIdAndUpdate(
      req.params.id,
      { status, remarks },
      { new: true }
    ).populate('staffId', 'name email');

    if (!updatedAttendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    res.json(updatedAttendance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete an attendance record
router.delete('/:id', async (req, res) => {
  try {
    const deletedAttendance = await StaffAttendance.findByIdAndDelete(req.params.id);
    if (!deletedAttendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    res.json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 
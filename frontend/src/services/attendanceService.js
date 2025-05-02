import axios from "axios"

const API_URL = "http://localhost:5000/attendance"

// Get attendance for a class on a specific date
export const getClassAttendance = async (classId, date) => {
  try {
    const response = await axios.get(`${API_URL}/class/${classId}`, {
      params: { date },
    })
    return response.data
  } catch (error) {
    console.error(`Error fetching attendance for class ${classId}:`, error)
    throw error
  }
}

// Get attendance for a specific student
export const getStudentAttendance = async (studentId) => {
  try {
    const response = await axios.get(`${API_URL}/student/${studentId}`)
    return response.data
  } catch (error) {
    console.error(`Error fetching attendance for student ${studentId}:`, error)
    throw error
  }
}

// Save attendance for a class
export const saveAttendance = async (attendanceData) => {
  try {
    const response = await axios.post(API_URL, attendanceData)
    return response.data
  } catch (error) {
    console.error("Error saving attendance:", error)
    throw error
  }
}

// Update attendance record
export const updateAttendance = async (attendanceId, attendanceData) => {
  try {
    const response = await axios.put(`${API_URL}/${attendanceId}`, attendanceData)
    return response.data
  } catch (error) {
    console.error(`Error updating attendance with ID ${attendanceId}:`, error)
    throw error
  }
}

// Get attendance statistics for a student
export const getStudentAttendanceStats = async (studentId) => {
  try {
    const response = await axios.get(`${API_URL}/stats/${studentId}`)
    return response.data
  } catch (error) {
    console.error(`Error fetching attendance stats for student ${studentId}:`, error)
    throw error
  }
}

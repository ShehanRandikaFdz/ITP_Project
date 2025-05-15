import axios from "axios"

const API_URL = "http://localhost:5000/staff"

export const staffService = {
  // Get all staff members
  getStaffMembers: async () => {
    try {
      const response = await axios.get(API_URL)
      return response.data
    } catch (error) {
      console.error("Error fetching staff members:", error)
      throw error
    }
  },

  // Get a specific staff member
  getStaffMember: async (staffId) => {
    try {
      const response = await axios.get(`${API_URL}/${staffId}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching staff member ${staffId}:`, error)
      throw error
    }
  },

  // Create a new staff member
  createStaffMember: async (staffData) => {
    try {
      const response = await axios.post(API_URL, staffData)
      return response.data
    } catch (error) {
      console.error("Error creating staff member:", error)
      throw error
    }
  },

  // Update a staff member
  updateStaffMember: async (staffId, staffData) => {
    try {
      const response = await axios.put(`${API_URL}/${staffId}`, staffData)
      return response.data
    } catch (error) {
      console.error(`Error updating staff member ${staffId}:`, error)
      throw error
    }
  },

  // Delete a staff member
  deleteStaffMember: async (staffId) => {
    try {
      const response = await axios.delete(`${API_URL}/${staffId}`)
      return response.data
    } catch (error) {
      console.error(`Error deleting staff member ${staffId}:`, error)
      throw error
    }
  },

  // Staff login
  staffLogin: async (credentials) => {
    try {
      const response = await axios.post(`${API_URL}/login`, credentials)
      return response.data
    } catch (error) {
      console.error("Error during staff login:", error)
      throw error
    }
  },

  // Get staff profile
  getStaffProfile: async (staffId) => {
    try {
      const response = await axios.get(`${API_URL}/${staffId}/profile`)
      return response.data
    } catch (error) {
      console.error(`Error fetching staff profile ${staffId}:`, error)
      throw error
    }
  },

  // Update staff profile
  updateStaffProfile: async (staffId, profileData) => {
    try {
      const response = await axios.put(`${API_URL}/${staffId}/profile`, profileData)
      return response.data
    } catch (error) {
      console.error(`Error updating staff profile ${staffId}:`, error)
      throw error
    }
  }
} 
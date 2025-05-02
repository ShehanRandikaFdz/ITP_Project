import axios from "axios"

const API_URL = "http://localhost:5000/api/leaves"

export const leaveService = {
  // Get all leave requests
  getLeaveRequests: async () => {
    try {
      const response = await axios.get(API_URL)
      return response.data
    } catch (error) {
      console.error("Error fetching leave requests:", error)
      throw error
    }
  },

  // Get leave requests for a specific staff member
  getStaffLeaveRequests: async (staffId) => {
    try {
      const response = await axios.get(`${API_URL}/staff/${staffId}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching leave requests for staff ${staffId}:`, error)
      throw error
    }
  },

  // Get leave requests for a specific staff member (alias for getStaffLeaveRequests)
  getStaffLeaves: async (staffId) => {
    try {
      console.log("Fetching leaves for staff:", staffId);
      const response = await axios.get(`${API_URL}/staff/${staffId}`);
      console.log("Raw staff leaves response:", response.data);
      
      // Ensure we're returning an array
      const leaves = Array.isArray(response.data.data) ? response.data.data : [];
      
      return {
        success: true,
        data: leaves
      };
    } catch (error) {
      console.error(`Error fetching leave requests for staff ${staffId}:`, {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: {
          url: error.config?.url,
          method: error.config?.method
        }
      });
      return {
        success: false,
        data: []
      };
    }
  },

  // Get leave statistics for a staff member
  getStaffLeaveStats: async (staffId) => {
    try {
      const response = await axios.get(`${API_URL}/balance/${staffId}`)
      console.log("Raw leave balance response:", response.data)
      
      // Transform the response to match the expected structure
      const leaveBalance = response.data || {
        annual: 21,
        casual: 7,
        medical: 14,
        remaining: 42,
        taken: {
          annual: 0,
          casual: 0,
          medical: 0,
          total: 0
        }
      }
      
      return {
        success: true,
        data: {
          leaveBalance,
          monthlyStats: Array(12).fill().map(() => ({ fullDay: 0, halfDay: 0 })),
          prevMonthlyStats: Array(12).fill().map(() => ({ fullDay: 0, halfDay: 0 }))
        }
      }
    } catch (error) {
      console.error(`Error fetching leave stats for staff ${staffId}:`, error)
      return {
        success: false,
        data: {
          leaveBalance: {
            annual: 21,
            casual: 7,
            medical: 14,
            remaining: 42,
            taken: {
              annual: 0,
              casual: 0,
              medical: 0,
              total: 0
            }
          },
          monthlyStats: Array(12).fill().map(() => ({ fullDay: 0, halfDay: 0 })),
          prevMonthlyStats: Array(12).fill().map(() => ({ fullDay: 0, halfDay: 0 }))
          }
      }
    }
  },

  // Apply for leave
  applyLeave: async (leaveData) => {
    try {
      console.log("Sending leave application data:", leaveData);
      const response = await axios.post(API_URL, leaveData);
      console.log("Leave application response:", response.data);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        };
      } else {
        throw new Error(response.data.message || "Failed to apply for leave");
      }
    } catch (error) {
      console.error("Detailed error applying for leave:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data
        }
      });
      throw error;
    }
  },

  // Update a leave request
  updateLeave: async (leaveId, leaveData) => {
    try {
      const response = await axios.put(`${API_URL}/${leaveId}`, leaveData)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error(`Error updating leave request ${leaveId}:`, error)
      throw error
    }
  },

  // Delete a leave request
  deleteLeave: async (leaveId) => {
    try {
      const response = await axios.delete(`${API_URL}/${leaveId}`)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error(`Error deleting leave request ${leaveId}:`, error)
      throw error
    }
  },

  // Create a new leave request
  createLeaveRequest: async (leaveData) => {
    try {
      const response = await axios.post(API_URL, leaveData)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error("Error creating leave request:", error)
      throw error
    }
  },

  // Update a leave request
  updateLeaveRequest: async (leaveId, leaveData) => {
    try {
      const response = await axios.put(`${API_URL}/${leaveId}`, leaveData)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error(`Error updating leave request ${leaveId}:`, error)
      throw error
    }
  },

  // Delete a leave request
  deleteLeaveRequest: async (leaveId) => {
    try {
      const response = await axios.delete(`${API_URL}/${leaveId}`)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error(`Error deleting leave request ${leaveId}:`, error)
      throw error
    }
  },

  // Approve a leave request
  approveLeaveRequest: async (leaveId) => {
    try {
      const response = await axios.put(`${API_URL}/${leaveId}/approve`)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error(`Error approving leave request ${leaveId}:`, error)
      throw error
    }
  },

  // Reject a leave request
  rejectLeaveRequest: async (leaveId, reason) => {
    try {
      const response = await axios.put(`${API_URL}/${leaveId}/reject`, { reason })
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error(`Error rejecting leave request ${leaveId}:`, error)
      throw error
    }
  },

  // Get all leave requests (admin view)
  getAllLeaves: async (filters = {}) => {
    try {
      console.log("Fetching all leaves with filters:", filters);
      const response = await axios.get(API_URL, { params: filters });
      console.log("All leaves response:", response.data);
      
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      console.error("Error fetching all leaves:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          params: error.config?.params
        }
      });
      return {
        success: false,
        data: []
      };
    }
  },

  // Process leave request (approve/reject)
  processLeave: async (leaveId, status, adminId, rejectionReason) => {
    try {
      console.log("Processing leave request:", { leaveId, status, adminId, rejectionReason });
      const response = await axios.put(`${API_URL}/${leaveId}/process`, {
        status,
        approvedBy: adminId,
        rejectionReason
      });
      console.log("Process leave response:", response.data);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        };
      } else {
        throw new Error(response.data.message || "Failed to process leave request");
      }
    } catch (error) {
      console.error("Error processing leave request:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data
        }
      });
      throw error;
    }
  }
} 
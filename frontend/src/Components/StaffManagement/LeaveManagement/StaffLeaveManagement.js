"use client"

import { useState, useEffect } from "react"
import { leaveService } from "../../../services/leaveService"
import { useToast } from "../../../hooks/use-toast"
import "../../../styles/leave-management.css"

const StaffLeaveManagement = () => {
  const { toast } = useToast()
  const [leaves, setLeaves] = useState([])
  const [leaveStats, setLeaveStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showApplyForm, setShowApplyForm] = useState(false)
  const [selectedLeave, setSelectedLeave] = useState(null)
  const [chartYear, setChartYear] = useState(new Date().getFullYear())
  const [chartMonth, setChartMonth] = useState(new Date().getMonth())

  // Get staff ID from localStorage
  const staffId = localStorage.getItem('staffId')

  useEffect(() => {
    if (staffId) {
      fetchLeaveData()
    }
  }, [staffId])

  if (!staffId) {
    return (
      <div className="error-message">
        Please log in to access leave management.
      </div>
    )
  }

  const fetchLeaveData = async () => {
    try {
      setLoading(true)

      // Fetch leave requests
      const leaveData = await leaveService.getStaffLeaves(staffId)
      console.log("Leave data response:", leaveData)
      setLeaves(leaveData.data || [])

      // Default leave stats structure
      const defaultLeaveStats = {
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

      // Fetch leave statistics
      const statsResponse = await leaveService.getStaffLeaveStats(staffId)
      
      // Debug log
      console.log("Raw stats response:", statsResponse);
      
      if (statsResponse && statsResponse.success && statsResponse.data) {
        // Create a complete structure by merging with defaults
        const receivedData = statsResponse.data
        
        // Deep merge the leave balance data to ensure taken values are preserved
        const mergedStats = {
          leaveBalance: {
            ...defaultLeaveStats.leaveBalance,
            ...(receivedData.leaveBalance || {}),
            taken: {
              ...defaultLeaveStats.leaveBalance.taken,
              ...(receivedData.leaveBalance?.taken || {})
            }
          },
          monthlyStats: receivedData.monthlyStats || defaultLeaveStats.monthlyStats,
          prevMonthlyStats: receivedData.prevMonthlyStats || defaultLeaveStats.prevMonthlyStats
        }
        
        // Debug logs
        console.log("Received leave stats:", receivedData);
        console.log("Merged leave stats:", mergedStats);
        console.log("Annual leave remaining:", mergedStats.leaveBalance.annual);
        
        setLeaveStats(mergedStats)
      } else {
        // Use default values if data is not available
        setLeaveStats(defaultLeaveStats)
      }

      setLoading(false)
    } catch (error) {
      console.error("Error fetching leave data:", error)
      toast({
        title: "Error",
        description: "Failed to load leave data",
        variant: "destructive",
      })
      
      // Set default values on error
      setLeaves([]) // Set empty array instead of null/undefined
      setLeaveStats({
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
      })
      
      setLoading(false)
    }
  }

  const handleApplyLeave = async (leaveData) => {
    try {
      console.log("Handling leave application with data:", leaveData);
      
      // Ensure staffId is present
      if (!staffId) {
        throw new Error("Staff ID not found. Please log in again.");
      }

      // Format dates to ISO string
      const formattedData = {
        ...leaveData,
        staffId,
        startDate: new Date(leaveData.startDate).toISOString(),
        endDate: new Date(leaveData.endDate).toISOString()
      };

      console.log("Formatted leave data:", formattedData);

      const response = await leaveService.applyLeave(formattedData);
      console.log("Leave application response:", response);

      if (response.success) {
        toast({
          title: "Success",
          description: "Leave application submitted successfully",
          variant: "success",
        });

        setShowApplyForm(false);
        // Refresh leave data
        await fetchLeaveData();
      } else {
        throw new Error(response.message || "Failed to apply for leave");
      }
    } catch (error) {
      console.error("Detailed error in handleApplyLeave:", {
        message: error.message,
        response: error.response?.data,
        stack: error.stack
      });
      
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Failed to apply for leave",
        variant: "destructive",
      });
    }
  };

  const handleUpdateLeave = async (leaveId, leaveData) => {
    try {
      await leaveService.updateLeave(leaveId, leaveData)

      toast({
        title: "Success",
        description: "Leave application updated successfully",
        variant: "success",
      })

      setSelectedLeave(null)
      fetchLeaveData()
    } catch (error) {
      console.error("Error updating leave:", error)
      toast({
        title: "Error",
        description: "Failed to update leave application",
        variant: "destructive",
      })
    }
  }

  const handleDeleteLeave = async (leaveId) => {
    if (window.confirm("Are you sure you want to cancel this leave application?")) {
      try {
        await leaveService.deleteLeave(leaveId)

        toast({
          title: "Success",
          description: "Leave application cancelled successfully",
          variant: "success",
        })

        fetchLeaveData()
      } catch (error) {
        console.error("Error deleting leave:", error)
        toast({
          title: "Error",
          description: "Failed to cancel leave application",
          variant: "destructive",
        })
      }
    }
  }

  const navigateMonth = (direction) => {
    let newMonth = chartMonth
    let newYear = chartYear

    if (direction === "prev") {
      newMonth--
      if (newMonth < 0) {
        newMonth = 11
        newYear--
      }
    } else {
      newMonth++
      if (newMonth > 11) {
        newMonth = 0
        newYear++
      }
    }

    setChartMonth(newMonth)
    setChartYear(newYear)
  }

  // Function to manually calculate annual leave bar width
  const getAnnualLeaveWidth = () => {
    if (!leaveStats || !leaveStats.leaveBalance) return "0%";
    
    // Get annual leave value
    const annualLeave = leaveStats.leaveBalance.annual;
    
    // Calculate percentage (max 100%)
    let percentage = Math.min((annualLeave / 14) * 100, 100);
    
    // Force it to be less than 100% if it's displayed incorrectly
    if (annualLeave < 14) {
      // If less than max, we need to calculate exact percentage
      percentage = (annualLeave / 14) * 100;
    } else {
      // If equal or greater than max, it should be 100%
      percentage = 100;
    }
    
    console.log("Annual leave percentage calculated:", percentage);
    return `${percentage}%`;
  }

  if (loading) {
    return <div className="loading-spinner">Loading leave data...</div>
  }

  return (
    <div className="staff-leave-container">
      <div className="leave-header">
        <div>
          <h1 className="leave-title">Leave Management</h1>
          <p className="leave-subtitle">Apply for leave and check your leave balance</p>
        </div>
        <button onClick={() => setShowApplyForm(true)} className="apply-leave-button">
          Apply for Leave
        </button>
      </div>

      <div className="leave-dashboard">
        <div className="leave-balance-card">
          <h2 className="card-title">Leave Balance</h2>

          {leaveStats && leaveStats.leaveBalance && (
            <div className="leave-balance">
              <div className="leave-item">
                <div className="leave-details">
                  <span className="leave-type">Annual Leave</span>
                  <span className="leave-count">{leaveStats.leaveBalance.annual} / 14 days</span>
                </div>
                {/* Custom annual leave progress bar */}
                <div style={{ 
                  height: '12px',
                  backgroundColor: '#f1f5f9',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  {/* This is a completely new implementation of the progress bar */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '100%',
                    width: getAnnualLeaveWidth(),
                    backgroundColor: '#3b82f6',
                    borderRadius: '6px'
                  }}></div>
                </div>
              </div>

              <div className="leave-item">
                <div className="leave-details">
                  <span className="leave-type">Casual Leave</span>
                  <span className="leave-count">{leaveStats.leaveBalance.casual} / 7 days</span>
                </div>
                <div className="leave-progress">
                  <div
                    className="progress-fill casual"
                    style={{ width: `${Math.min(leaveStats.leaveBalance.casual / 7 * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="leave-item">
                <div className="leave-details">
                  <span className="leave-type">Medical Leave</span>
                  <span className="leave-count">{leaveStats.leaveBalance.medical} / 21 days</span>
                </div>
                <div className="leave-progress">
                  <div
                    className="progress-fill medical"
                    style={{ width: `${Math.min(leaveStats.leaveBalance.medical / 21 * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

             
        
              
              {/* Detailed breakdown of taken leave */}
              <div className="leave-taken-breakdown">
                <h3>Taken Leave Breakdown</h3>
                <div className="leave-breakdown-list">
                  <div className="leave-breakdown-item">
                    <span>Annual Leave:</span>
                    <span>{leaveStats.leaveBalance.annual - 14} days</span>
                  </div>
                  <div className="leave-breakdown-item">
                    <span>Casual Leave:</span>
                    <span>{7 - leaveStats.leaveBalance.casual} days</span>
                  </div>
                  <div className="leave-breakdown-item">
                    <span>Medical Leave:</span>
                    <span>{21 - leaveStats.leaveBalance.medical} days</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="leave-chart-card">
          <h2 className="card-title">Leave History</h2>

          {leaveStats && leaveStats.monthlyStats ? (
            <div className="leave-chart">
              <div className="chart-header">
                <button onClick={() => navigateMonth("prev")} className="chart-nav-button">
                  &lt;
                </button>
                <h3 className="chart-title">
                  {new Date(chartYear, chartMonth).toLocaleString("default", { month: "long" })} {chartYear}
                </h3>
                <button onClick={() => navigateMonth("next")} className="chart-nav-button">
                  &gt;
                </button>
              </div>
              
              <div className="chart-container" style={{ height: "200px", display: "flex", alignItems: "flex-end", justifyContent: "center", gap: "2rem" }}>
                {leaveStats.monthlyStats[chartMonth]?.fullDay > 0 && (
                  <div className="chart-bar-wrapper">
                    <div className="chart-bar full-day" 
                         style={{ 
                           height: `${Math.min(leaveStats.monthlyStats[chartMonth].fullDay * 25, 150)}px`, 
                           width: '40px',
                         }}>
                      <span className="bar-value">
                        {leaveStats.monthlyStats[chartMonth].fullDay} days
                      </span>
                    </div>
                    <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Full Day</div>
                  </div>
                )}
                
                {leaveStats.monthlyStats[chartMonth]?.halfDay > 0 && (
                  <div className="chart-bar-wrapper">
                    <div className="chart-bar half-day" 
                         style={{ 
                           height: `${Math.min(leaveStats.monthlyStats[chartMonth].halfDay * 25, 150)}px`, 
                           width: '40px',
                         }}>
                      <span className="bar-value">
                        {leaveStats.monthlyStats[chartMonth].halfDay} days
                      </span>
                    </div>
                    <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Half Day</div>
                  </div>
                )}
                
                {(!leaveStats.monthlyStats[chartMonth] || 
                  (leaveStats.monthlyStats[chartMonth].fullDay === 0 &&
                  leaveStats.monthlyStats[chartMonth].halfDay === 0)) && (
                    <div className="no-data">No leave data for this month</div>
                  )}
              </div>

              {/* Add a year comparison if data is available */}
              {leaveStats.prevMonthlyStats && leaveStats.prevMonthlyStats.some(stats => stats.fullDay > 0 || stats.halfDay > 0) && (
                <div className="chart-comparison">
                  <h4>Compared to previous year:</h4>
                  
                  <div className="comparison-row">
                    <div className="comparison-label">Current Year:</div>
                    <div className="comparison-bar">
                      <div className="comparison-bar-fill current"
                           style={{ 
                             width: `${Math.min(((leaveStats.monthlyStats[chartMonth]?.fullDay || 0) + (leaveStats.monthlyStats[chartMonth]?.halfDay || 0) * 0.5) * 10, 100)}%`
                           }}>
                      </div>
                    </div>
                    <div className="comparison-value">
                      {(leaveStats.monthlyStats[chartMonth]?.fullDay || 0) + (leaveStats.monthlyStats[chartMonth]?.halfDay || 0) * 0.5} days
                    </div>
                  </div>
                  
                  <div className="comparison-row">
                    <div className="comparison-label">Previous Year:</div>
                    <div className="comparison-bar">
                      <div className="comparison-bar-fill previous"
                           style={{ 
                             width: `${Math.min(((leaveStats.prevMonthlyStats[chartMonth]?.fullDay || 0) + (leaveStats.prevMonthlyStats[chartMonth]?.halfDay || 0) * 0.5) * 10, 100)}%`
                           }}>
                      </div>
                    </div>
                    <div className="comparison-value">
                      {(leaveStats.prevMonthlyStats[chartMonth]?.fullDay || 0) + (leaveStats.prevMonthlyStats[chartMonth]?.halfDay || 0) * 0.5} days
                    </div>
                  </div>
                </div>
              )}
              
              <div className="chart-legend">
                <div className="legend-item">
                  <span className="legend-color full-day"></span>
                  <span className="legend-label">Full Day</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color half-day"></span>
                  <span className="legend-label">Half Day</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-data-message">No leave history available</div>
          )}
        </div>

        <div className="leave-history-card">
          <h2 className="card-title">Leave Applications</h2>

          {leaves.length === 0 ? (
            <div className="no-leaves-message">No leave applications found</div>
          ) : (
            <div className="leave-list">
              <table className="leave-table">
                <thead>
                  <tr>
                    <th>Leave Type</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.map((leave) => (
                    <tr key={leave._id}>
                      <td>{leave.leaveType}</td>
                      <td>{new Date(leave.startDate).toLocaleDateString()}</td>
                      <td>{new Date(leave.endDate).toLocaleDateString()}</td>
                      <td>
                        {leave.duration} {leave.duration === 1 ? "day" : "days"}
                        {leave.halfDay && " (Half day)"}
                      </td>
                      <td>
                        <span className={`leave-status ${leave.status.toLowerCase()}`}>{leave.status}</span>
                      </td>
                      <td>
                        <div className="leave-actions">
                          {leave.status === "Pending" && (
                            <>
                              <button
                                onClick={() => setSelectedLeave(leave)}
                                className="action-button edit-button"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteLeave(leave._id)}
                                className="action-button delete-button"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {(showApplyForm || selectedLeave) && (
        <div className="leave-form-overlay">
          <div className="leave-form-container">
            <div className="form-header">
              <h2 className="form-title">{selectedLeave ? "Edit Leave Application" : "Apply for Leave"}</h2>
              <button onClick={() => {
                setShowApplyForm(false)
                setSelectedLeave(null)
              }} className="close-button">
                &times;
              </button>
            </div>
            <LeaveApplicationForm
              leave={selectedLeave}
              onSubmit={selectedLeave ? handleUpdateLeave : handleApplyLeave}
              onCancel={() => {
                setShowApplyForm(false)
                setSelectedLeave(null)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

const LeaveApplicationForm = ({ leave, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    leaveType: leave?.leaveType || "Annual",
    startDate: leave?.startDate ? new Date(leave.startDate).toISOString().substring(0, 10) : "",
    endDate: leave?.endDate ? new Date(leave.endDate).toISOString().substring(0, 10) : "",
    halfDay: leave?.halfDay || false,
    reason: leave?.reason || "",
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validate form data
    if (!formData.startDate || !formData.endDate || !formData.reason) {
      alert("Please fill all required fields")
      return
    }
    
    const startDate = new Date(formData.startDate)
    const endDate = new Date(formData.endDate)
    
    if (endDate < startDate) {
      alert("End date cannot be before start date")
      return
    }
    
    if (leave) {
      onSubmit(leave._id, formData)
    } else {
      onSubmit(formData)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label">Leave Type</label>
        <select
          name="leaveType"
          value={formData.leaveType}
          onChange={handleChange}
          className="form-select"
          required
        >
          <option value="Annual">Annual Leave</option>
          <option value="Casual">Casual Leave</option>
          <option value="Medical">Medical Leave</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Start Date</label>
        <input
          type="date"
          name="startDate"
          value={formData.startDate}
          onChange={handleChange}
          className="form-input"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">End Date</label>
        <input
          type="date"
          name="endDate"
          value={formData.endDate}
          onChange={handleChange}
          className="form-input"
          required
        />
      </div>

      <div className="form-group">
        <div className="checkbox-group">
          <input
            type="checkbox"
            name="halfDay"
            checked={formData.halfDay}
            onChange={handleChange}
            className="form-checkbox"
            id="halfDayCheckbox"
          />
          <label htmlFor="halfDayCheckbox" className="form-label">Half Day Leave</label>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Reason</label>
        <textarea
          name="reason"
          value={formData.reason}
          onChange={handleChange}
          className="form-textarea"
          rows="4"
          required
        />
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="cancel-button">
          Cancel
        </button>
        <button type="submit" className="submit-button">
          {leave ? "Update Leave" : "Submit Leave Request"}
        </button>
      </div>
    </form>
  )
}

export default StaffLeaveManagement;

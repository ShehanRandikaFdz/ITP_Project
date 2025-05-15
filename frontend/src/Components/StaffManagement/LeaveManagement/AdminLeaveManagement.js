"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { leaveService } from "../../../services/leaveService"
import { useToast } from "../../../hooks/use-toast"
import "../../../styles/leave-management.css"

const AdminLeaveManagement = () => {
  const { toast } = useToast()
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("Pending")
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  })

  useEffect(() => {
    fetchLeaves()
  }, [statusFilter, dateRange])

  const fetchLeaves = async () => {
    try {
      setLoading(true)

      // Build filters
      const filters = {}
      if (statusFilter) {
        filters.status = statusFilter
      }
      if (dateRange.startDate) {
        filters.startDate = dateRange.startDate
      }
      if (dateRange.endDate) {
        filters.endDate = dateRange.endDate
      }

      console.log("Fetching leaves with filters:", filters);
      const response = await leaveService.getAllLeaves(filters);
      console.log("Leaves response:", response);

      if (response.success) {
        setLeaves(response.data || []);
      } else {
        throw new Error("Failed to fetch leaves");
      }
    } catch (error) {
      console.error("Error fetching leaves:", error);
      toast({
        title: "Error",
        description: "Failed to load leave requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const handleProcessLeave = async (leaveId, status) => {
    try {
      // Get the admin ID from localStorage
      const adminId = localStorage.getItem('staffId');
      if (!adminId) {
        throw new Error("Admin ID not found. Please log in again.");
      }

      let rejectionReason = null;
      if (status === "Rejected") {
        rejectionReason = prompt("Please provide a reason for rejection:");
        if (rejectionReason === null) {
          // User cancelled the prompt
          return;
        }
      }

      console.log("Processing leave request:", { leaveId, status, adminId, rejectionReason });
      const response = await leaveService.processLeave(leaveId, status, adminId, rejectionReason);
      console.log("Process leave response:", response);

      if (response.success) {
        toast({
          title: "Success",
          description: `Leave request ${status.toLowerCase()} successfully`,
          variant: "success",
        });

        // Refresh the leave list
        await fetchLeaves();
      } else {
        throw new Error(response.message || "Failed to process leave request");
      }
    } catch (error) {
      console.error("Error processing leave:", error);
      toast({
        title: "Error",
        description: error.message || `Failed to ${status.toLowerCase()} leave request`,
        variant: "destructive",
      });
    }
  }

  const handleDateChange = (e) => {
    const { name, value } = e.target
    setDateRange({
      ...dateRange,
      [name]: value,
    })
  }

  const clearFilters = () => {
    setStatusFilter("")
    setDateRange({
      startDate: "",
      endDate: "",
    })
  }

  return (
    <div className="admin-leave-container">
      <div className="leave-header">
        <div>
          <h1 className="leave-title">Leave Management</h1>
          <p className="leave-subtitle">Manage staff leave requests</p>
        </div>
        <div className="header-actions">
          <Link to="/leave-reports" className="reports-button">
            Generate Reports
          </Link>
        </div>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <label className="filter-label">Status</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Start Date</label>
          <input
            type="date"
            name="startDate"
            value={dateRange.startDate}
            onChange={handleDateChange}
            className="filter-input"
          />
        </div>

        <div className="filter-group">
          <label className="filter-label">End Date</label>
          <input
            type="date"
            name="endDate"
            value={dateRange.endDate}
            onChange={handleDateChange}
            className="filter-input"
          />
        </div>

        <button onClick={clearFilters} className="clear-filters-button">
          Clear Filters
        </button>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading leave requests...</div>
      ) : leaves.length === 0 ? (
        <div className="no-results">No leave requests found matching your filters</div>
      ) : (
        <div className="leave-table-container">
          <table className="leave-table">
            <thead>
              <tr>
                <th>Staff</th>
                <th>Leave Type</th>
                <th>Duration</th>
                <th>Dates</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((leave) => (
                <tr key={leave._id}>
                  <td>
                    <div className="staff-cell">
                      <div className="staff-avatar">
                        {leave.staff?.photo ? (
                          <img
                            src={`http://localhost:5000${leave.staff.photo}`}
                            alt={leave.staff?.fullName || "Staff"}
                          />
                        ) : (
                          <span>{leave.staff?.fullName?.charAt(0) || "?"}</span>
                        )}
                      </div>
                      <div className="staff-info">
                        <div className="staff-name">{leave.staff?.fullName || "Unknown Staff"}</div>
                        <div className="staff-designation">{leave.staff?.designation || ""}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`leave-type ${leave.leaveType.toLowerCase()}`}>{leave.leaveType}</span>
                  </td>
                  <td>
                    {leave.duration} {leave.duration === 1 ? "day" : "days"}
                    {leave.halfDay && " (Half day)"}
                  </td>
                  <td>
                    <div className="leave-dates">
                      <div>From: {new Date(leave.startDate).toLocaleDateString()}</div>
                      <div>To: {new Date(leave.endDate).toLocaleDateString()}</div>
                    </div>
                  </td>
                  <td>
                    <div className="leave-reason">{leave.reason}</div>
                  </td>
                  <td>
                    <span className={`status-badge ${leave.status.toLowerCase()}`}>{leave.status}</span>
                  </td>
                  <td>
                    {leave.status === "Pending" ? (
                      <div className="leave-actions">
                        <button onClick={() => handleProcessLeave(leave._id, "Approved")} className="approve-button">
                          Approve
                        </button>
                        <button onClick={() => handleProcessLeave(leave._id, "Rejected")} className="reject-button">
                          Reject
                        </button>
                      </div>
                    ) : (
                      <div className="processed-info">
                        {leave.status === "Approved" ? "Approved" : "Rejected"} on{" "}
                        {leave.approvedDate ? new Date(leave.approvedDate).toLocaleDateString() : "N/A"}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminLeaveManagement

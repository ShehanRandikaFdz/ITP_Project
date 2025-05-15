"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import LoadingSpinner from "../common/LoadingSpinner"
import ErrorMessage from "../common/ErrorMessage"
import "../../styles/staff-dashboard.css"

const AdminDashboard = () => {
  const [staffStats, setStaffStats] = useState({
    totalStaff: 0,
    academicStaff: 0,
    nonAcademicStaff: 0,
    pendingLeaves: 0,
  })
  const [recentActivities, setRecentActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch staff statistics
        const statsResponse = await axios.get("http://localhost:5000/api/staff")

        // Fetch pending leaves
        const leavesResponse = await axios.get("http://localhost:5000/api/leaves")

        // Fetch recent activities
        const activitiesResponse = await axios.get("http://localhost:5000/activity")

        setStaffStats({
          totalStaff: statsResponse.data.counts.total || 0,
          academicStaff: statsResponse.data.counts.academic || 0,
          nonAcademicStaff: statsResponse.data.counts.nonAcademic || 0,
          pendingLeaves: leavesResponse.data.leaves?.filter(leave => leave.status === 'pending')?.length || 0,
        })

        setRecentActivities(activitiesResponse.data.activities || [])
        setLoading(false)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        setError("Failed to load dashboard data. Please try again later.")
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />

  return (
    <div className="admin-dashboard-container">
      <h1 className="dashboard-title">Admin Dashboard</h1>

      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-icon total-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div className="stat-details">
            <h3>Total Staff</h3>
            <p className="stat-value">{staffStats.totalStaff}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon academic-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
            </svg>
          </div>
          <div className="stat-details">
            <h3>Academic Staff</h3>
            <p className="stat-value">{staffStats.academicStaff}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon non-academic-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
          </div>
          <div className="stat-details">
            <h3>Non-Academic</h3>
            <p className="stat-value">{staffStats.nonAcademicStaff}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon pending-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
            </svg>
          </div>
          <div className="stat-details">
            <h3>Pending Leaves</h3>
            <p className="stat-value">{staffStats.pendingLeaves}</p>
          </div>
        </div>
      </div>

      <div className="admin-actions">
        <h2>Quick Actions</h2>
        <div className="action-cards">
          <Link to="/staff" className="action-card">
            <div className="action-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <h3>Staff Profiles</h3>
            <p>View and manage staff profiles</p>
          </Link>

          <Link to="/staff/enrollment" className="action-card">
            <div className="action-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <line x1="20" y1="8" x2="20" y2="14"></line>
                <line x1="23" y1="11" x2="17" y2="11"></line>
              </svg>
            </div>
            <h3>Staff Enrollment</h3>
            <p>Add new staff members</p>
          </Link>

          <Link to="/staff/admin/leave" className="action-card">
            <div className="action-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
            <h3>Leave Management</h3>
            <p>Approve or reject leave requests</p>
          </Link>

          <Link to="/staff/admin/attendance" className="action-card">
            <div className="action-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20z"></path>
                <path d="M12 6v6l4 2"></path>
              </svg>
            </div>
            <h3>Attendance Reports</h3>
            <p>View and generate attendance reports</p>
          </Link>
        </div>
      </div>

      <div className="recent-activities">
        <h2>Recent Activities</h2>
        {recentActivities.length > 0 ? (
          <ul className="activity-list">
            {recentActivities.map((activity, index) => (
              <li key={activity._id || index} className="activity-item">
                <div className="activity-avatar">
                  {activity.staffPhoto ? (
                    <img src={`http://localhost:5000${activity.staffPhoto}`} alt={activity.staffName} />
                  ) : (
                    <span>{activity.staffName?.charAt(0) || "U"}</span>
                  )}
                </div>
                <div className="activity-details">
                  <p className="activity-text">
                    <span className="activity-name">{activity.staffName}</span> {activity.action}
                  </p>
                  <p className="activity-time">{new Date(activity.timestamp).toLocaleString()}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="no-activities">No recent activities</div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard

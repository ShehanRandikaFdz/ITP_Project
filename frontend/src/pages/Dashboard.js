import { Users, UserPlus, Briefcase, DollarSign, AlertCircle, FileText } from "lucide-react"
import { useState, useEffect } from "react"
import { getAllStudents } from "../services/studentService"
import { inventoryApi } from "../services/api"
import LoadingSpinner from "../Components/common/LoadingSpinner"
import ErrorMessage from "../Components/common/ErrorMessage"
import "../styles/dashboard.css"

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalStaff: 0,
    totalAssets: 0,
    totalFund: 0,
    recentActivities: [],
    alerts: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch total students
        const studentsResponse = await getAllStudents()
        const totalStudents = studentsResponse.length

        // Calculate total staff (assuming staff data is available in students response)
        const totalStaff = studentsResponse.filter(student => student.role === 'staff').length

        // Fetch total assets from inventory
        const inventoryResponse = await inventoryApi.getAllItems()
        const totalAssets = inventoryResponse.data.length

        // Sample data for activities and alerts
        const recentActivities = [
          {
            type: 'registration',
            title: 'New student registration completed',
            time: new Date().toLocaleString()
          },
          {
            type: 'payment',
            title: 'Fee payment received',
            time: new Date(Date.now() - 3600000).toLocaleString() // 1 hour ago
          }
        ]

        const alerts = [
          {
            type: 'payment',
            content: 'Fee payment pending for 5 students'
          },
          {
            type: 'maintenance',
            content: '3 assets require maintenance'
          }
        ]

        // TODO: Replace with actual API call for fund data
        // For now, we'll use placeholder value
        const totalFund = 0 // Replace with actual API call

        setStats({
          totalStudents,
          totalStaff,
          totalAssets,
          totalFund,
          recentActivities,
          alerts
        })
        setLoading(false)
      } catch (err) {
        setError('Failed to fetch dashboard data')
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
        <div className="dashboard-search">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input type="text" placeholder="Search..." />
        </div>
        <div className="dashboard-actions">
          <div className="dashboard-action">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          </div>
          <div className="dashboard-action">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 8v4"></path>
              <path d="M12 16h.01"></path>
            </svg>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-title">Total Students</div>
            <div className="stat-icon">
              <Users size={20} />
            </div>
          </div>
          <div className="stat-value">{stats.totalStudents}</div>
          <div className="stat-change">Active students</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-title">Total Staff</div>
            <div className="stat-icon">
              <Briefcase size={20} />
            </div>
          </div>
          <div className="stat-value">{stats.totalStaff}</div>
          <div className="stat-change">Active staff members</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-title">Total Assets</div>
            <div className="stat-icon">
              <FileText size={20} />
            </div>
          </div>
          <div className="stat-value">{stats.totalAssets}</div>
          <div className="stat-change">School assets</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-title">Total Fund</div>
            <div className="stat-icon">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="stat-value">${stats.totalFund.toLocaleString()}</div>
          <div className="stat-change">Available funds</div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="content-grid">
        {/* Recent Activities */}
        <div className="content-card">
          <h2 className="content-header">Recent Activities</h2>
          <div className="activity-list">
            {stats.recentActivities.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-icon">
                  <UserPlus size={20} />
                </div>
                <div className="activity-content">
                  <div className="activity-title">{activity.title}</div>
                  <div className="activity-time">{activity.time}</div>
                </div>
              </div>
            ))}
            {stats.recentActivities.length === 0 && (
              <div className="activity-item">
                <div className="activity-content">
                  <div className="activity-title">No recent activities</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Alerts */}
        <div className="content-card">
          <h2 className="content-header">Alerts</h2>
          <div className="alert-list">
            {stats.alerts.map((alert, index) => (
              <div key={index} className="alert-item">
                <div className="alert-icon">
                  <AlertCircle size={16} />
                </div>
                <div className="alert-content">{alert.content}</div>
              </div>
            ))}
            {stats.alerts.length === 0 && (
              <div className="alert-item">
                <div className="alert-content">No alerts at this time</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

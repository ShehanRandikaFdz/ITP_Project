"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { leaveService } from "../../../services/leaveService"
import { useToast } from "../../../hooks/use-toast"
import "../../../styles/leave-reports.css"

const LeaveReports = () => {
  const { toast } = useToast()
  const [filters, setFilters] = useState({
    month: "",
    year: new Date().getFullYear().toString(),
    staffId: "",
  })
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [predictionData, setPredictionData] = useState(null)
  const [selectedStaffId, setSelectedStaffId] = useState("")

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters({
      ...filters,
      [name]: value,
    })
  }

  const generateReport = async () => {
    try {
      setLoading(true)
      const reportData = await leaveService.generateLeaveReport(filters)
      setReport(reportData)
      setLoading(false)
    } catch (error) {
      console.error("Error generating report:", error)
      toast({
        title: "Error",
        description: "Failed to generate leave report",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  const getPrediction = async () => {
    if (!selectedStaffId) {
      toast({
        title: "Error",
        description: "Please select a staff member",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      const prediction = await leaveService.predictLeavesTrend(selectedStaffId)
      setPredictionData(prediction)
      setLoading(false)
    } catch (error) {
      console.error("Error getting prediction:", error)
      toast({
        title: "Error",
        description: "Failed to get leave prediction",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  const exportToPDF = () => {
    // In a real application, you would implement PDF export functionality
    toast({
      title: "Info",
      description: "PDF export functionality would be implemented here",
      variant: "info",
    })
  }

  const exportToExcel = () => {
    // In a real application, you would implement Excel export functionality
    toast({
      title: "Info",
      description: "Excel export functionality would be implemented here",
      variant: "info",
    })
  }

  return (
    <div className="leave-reports-container">
      <div className="reports-header">
        <div>
          <h1 className="reports-title">Leave Reports</h1>
          <p className="reports-subtitle">Generate and analyze leave reports</p>
        </div>
        <Link to="/admin-leave-management" className="back-button">
          ← Back to Leave Management
        </Link>
      </div>

      <div className="reports-content">
        <div className="report-generator">
          <h2 className="section-title">Generate Leave Report</h2>

          <div className="filters-section">
            <div className="filter-group">
              <label className="filter-label">Month</label>
              <select name="month" value={filters.month} onChange={handleFilterChange} className="filter-select">
                <option value="">All Months</option>
                <option value="01">January</option>
                <option value="02">February</option>
                <option value="03">March</option>
                <option value="04">April</option>
                <option value="05">May</option>
                <option value="06">June</option>
                <option value="07">July</option>
                <option value="08">August</option>
                <option value="09">September</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Year</label>
              <input
                type="number"
                name="year"
                value={filters.year}
                onChange={handleFilterChange}
                className="filter-input"
                min="2000"
                max="2100"
              />
            </div>

            <div className="filter-group">
              <label className="filter-label">Staff ID (Optional)</label>
              <input
                type="text"
                name="staffId"
                value={filters.staffId}
                onChange={handleFilterChange}
                className="filter-input"
                placeholder="Enter Staff ID"
              />
            </div>

            <button onClick={generateReport} className="generate-button" disabled={loading}>
              {loading ? "Generating..." : "Generate Report"}
            </button>
          </div>
        </div>

        {report && (
          <div className="report-results">
            <div className="report-header">
              <h3 className="report-title">
                Leave Report - {filters.month ? `Month: ${filters.month}, ` : ""}
                Year: {filters.year}
                {filters.staffId ? `, Staff ID: ${filters.staffId}` : ""}
              </h3>

              <div className="export-buttons">
                <button onClick={exportToPDF} className="export-button pdf">
                  Export to PDF
                </button>
                <button onClick={exportToExcel} className="export-button excel">
                  Export to Excel
                </button>
              </div>
            </div>

            {!report.report || report.report.length === 0 ? (
              <div className="no-data">No leave data found for the selected filters</div>
            ) : (
              <div className="report-table-container">
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Staff Name</th>
                      <th>Staff Type</th>
                      <th>Leave Type</th>
                      <th>Duration</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.report.map((leave) => (
                      <tr key={leave._id}>
                        <td>{leave.staffName}</td>
                        <td>{leave.staffType}</td>
                        <td>
                          <span className={`leave-type ${leave.leaveType.toLowerCase()}`}>{leave.leaveType}</span>
                        </td>
                        <td>
                          {leave.duration} {leave.duration === 1 ? "day" : "days"}
                          {leave.halfDay && " (Half day)"}
                        </td>
                        <td>{new Date(leave.startDate).toLocaleDateString()}</td>
                        <td>{new Date(leave.endDate).toLocaleDateString()}</td>
                        <td>
                          <span className={`status-badge ${leave.status.toLowerCase()}`}>{leave.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        <div className="prediction-section">
          <h2 className="section-title">Leave Prediction</h2>

          <div className="prediction-controls">
            <div className="filter-group">
              <label className="filter-label">Staff ID</label>
              <input
                type="text"
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                className="filter-input"
                placeholder="Enter Staff ID"
              />
            </div>

            <button onClick={getPrediction} className="predict-button" disabled={loading}>
              {loading ? "Loading..." : "Get Prediction"}
            </button>
          </div>

          {predictionData && (
            <div className="prediction-results">
              <h3 className="prediction-title">Leave Prediction for {predictionData.nextYear}</h3>

              <div className="prediction-chart">
                <div className="chart-bars">
                  {predictionData.predictions.map((value, index) => (
                    <div key={index} className="prediction-bar-container">
                      <div className="prediction-bar" style={{ height: `${value * 10}px` }}>
                        <span className="bar-value">{value}</span>
                      </div>
                      <span className="month-label">
                        {new Date(2023, index).toLocaleString("default", { month: "short" })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="prediction-summary">
                <p>
                  Based on historical patterns, we predict that this staff member will take approximately{" "}
                  {predictionData.predictions.reduce((a, b) => a + b, 0).toFixed(1)} days of leave in{" "}
                  {predictionData.nextYear}.
                </p>
                <p>
                  The prediction shows higher leave usage in
                  {predictionData.predictions.indexOf(Math.max(...predictionData.predictions)) !== -1
                    ? ` ${new Date(2023, predictionData.predictions.indexOf(Math.max(...predictionData.predictions))).toLocaleString("default", { month: "long" })}`
                    : " certain months"}
                  , which may help with resource planning.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LeaveReports

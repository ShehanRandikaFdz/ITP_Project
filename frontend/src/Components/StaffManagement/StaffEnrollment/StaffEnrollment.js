"use client"

import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { staffService } from '../../../services/staffService'
import { useToast } from '../../../hooks/use-toast'
import '../../../styles/staff-enrollment.css'
import axios from 'axios'

const StaffEnrollment = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [staffStats, setStaffStats] = useState({
    totalStaff: 0,
    academicStaff: 0,
    nonAcademicStaff: 0,
  })
  const [formData, setFormData] = useState({
    fullName: '',
    nic: '',
    email: '',
    phoneNumber: '',
    address: '',
    staffType: 'Academic',
    designation: '',
  })

  useEffect(() => {
    const fetchStaffStats = async () => {
      try {
        const stats = await staffService.getStaffStats()
        setStaffStats(stats)
      } catch (error) {
        console.error("Error fetching staff stats:", error)
        toast({
          title: "Error",
          description: "Failed to load staff statistics",
          variant: "destructive",
        })
      }
    }

    fetchStaffStats()
  }, [toast])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post('http://localhost:5000/api/staff', formData)
      toast({
        title: "Success",
        description: "Staff member added successfully!",
        variant: "success",
      })
      navigate('/staff')
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || 'Failed to add staff member',
        variant: "destructive",
      })
    }
  }

  return (
    <div className="staff-enrollment-container">
      <div className="enrollment-header">
        <h2>Add New Staff Member</h2>
        <button 
          className="back-button"
          onClick={() => navigate('/staff')}
        >
          Back to Staff Management
        </button>
      </div>

      <form onSubmit={handleSubmit} className="staff-enrollment-form">
        <div className="form-group">
          <label htmlFor="fullName">Full Name</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="nic">NIC</label>
          <input
            type="text"
            id="nic"
            name="nic"
            value={formData.nic}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="phoneNumber">Phone Number</label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="address">Address</label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="staffType">Staff Type</label>
          <select
            id="staffType"
            name="staffType"
            value={formData.staffType}
            onChange={handleChange}
            required
          >
            <option value="Academic">Academic</option>
            <option value="Non-Academic">Non-Academic</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="designation">Designation</label>
          <input
            type="text"
            id="designation"
            name="designation"
            value={formData.designation}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/staff')} className="cancel-btn">
            Cancel
          </button>
          <button type="submit" className="submit-btn">
            Add Staff Member
          </button>
        </div>
      </form>
    </div>
  )
}

const StaffList = () => {
  const { toast } = useToast()
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("")

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true)
        const staffData = await staffService.getAllStaff()
        setStaff(staffData)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching staff:", error)
        toast({
          title: "Error",
          description: "Failed to load staff members",
          variant: "destructive",
        })
        setLoading(false)
      }
    }

    fetchStaff()
  }, [toast])

  const handleDeleteStaff = async (staffId) => {
    if (window.confirm("Are you sure you want to delete this staff member?")) {
      try {
        await staffService.deleteStaff(staffId)
        setStaff(staff.filter((s) => s._id !== staffId))
        toast({
          title: "Success",
          description: "Staff member deleted successfully",
          variant: "success",
        })
      } catch (error) {
        console.error("Error deleting staff:", error)
        toast({
          title: "Error",
          description: "Failed to delete staff member",
          variant: "destructive",
        })
      }
    }
  }

  // Filter staff based on search term and staff type
  const filteredStaff = staff.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s._id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = filterType === "" || s.staffType === filterType

    return matchesSearch && matchesType
  })

  return (
    <div className="staff-list-container">
      <div className="list-header">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-container">
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="filter-select">
            <option value="">All Staff Types</option>
            <option value="Academic">Academic</option>
            <option value="Non-Academic">Non-Academic</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading staff members...</div>
      ) : filteredStaff.length === 0 ? (
        <div className="no-results">No staff members found</div>
      ) : (
        <div className="staff-table-container">
          <table className="staff-table">
            <thead>
              <tr>
                <th>Staff ID</th>
                <th>Name</th>
                <th>Type</th>
                <th>Designation</th>
                <th>Contact</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map((staffMember) => (
                <tr key={staffMember._id}>
                  <td>{staffMember._id}</td>
                  <td>
                    <div className="staff-name-cell">
                      <div className="staff-avatar">
                        {staffMember.photo ? (
                          <img src={`http://localhost:5000${staffMember.photo}`} alt={staffMember.fullName} />
                        ) : (
                          <span>{staffMember.fullName.charAt(0)}</span>
                        )}
                      </div>
                      <span>{staffMember.fullName}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`staff-type ${staffMember.staffType.toLowerCase()}`}>{staffMember.staffType}</span>
                  </td>
                  <td>{staffMember.designation}</td>
                  <td>{staffMember.phoneNumber}</td>
                  <td>
                    <div className="action-buttons">
                      <Link to={`/staff-profile/${staffMember._id}`} className="view-button">
                        View
                      </Link>
                      <Link to={`/staff-enrollment/edit/${staffMember._id}`} className="edit-button">
                        Edit
                      </Link>
                      <button className="delete-button" onClick={() => handleDeleteStaff(staffMember._id)}>
                        Delete
                      </button>
                    </div>
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

export default StaffEnrollment

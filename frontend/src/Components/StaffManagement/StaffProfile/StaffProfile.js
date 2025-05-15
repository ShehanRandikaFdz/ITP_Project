"use client"

import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { staffService } from "../../../services/staffService"
import { useToast } from "../../../hooks/use-toast"
import "../../../styles/staff-profile.css"

const StaffProfile = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [staff, setStaff] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        const staffData = await staffService.getStaffById(id)
        setStaff(staffData)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching staff data:", error)
        toast({
          title: "Error",
          description: "Failed to load staff profile",
          variant: "destructive",
        })
        navigate("/staff-enrollment")
      }
    }

    fetchStaffData()
  }, [id, navigate, toast])

  const handleDeleteStaff = async () => {
    try {
      await staffService.deleteStaff(id)
      toast({
        title: "Success",
        description: "Staff member deleted successfully",
        variant: "success",
      })
      navigate("/staff-enrollment")
    } catch (error) {
      console.error("Error deleting staff:", error)
      toast({
        title: "Error",
        description: "Failed to delete staff member",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div className="loading">Loading staff profile...</div>
  }

  if (!staff) {
    return <div className="error">Staff member not found</div>
  }

  return (
    <div className="staff-profile-container">
      <div className="profile-header">
        <div className="header-content">
          <h1 className="profile-title">Staff Profile</h1>
          <div className="header-actions">
            <Link to="/staff-enrollment" className="back-button">
              ← Back to Staff List
            </Link>
            <div className="action-buttons">
              <Link to={`/staff-enrollment/edit/${id}`} className="edit-button">
                Edit Profile
              </Link>
              <button className="delete-button" onClick={() => setShowDeleteModal(true)}>
                Delete Staff
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-sidebar">
          <div className="profile-photo">
            {staff.photo ? (
              <img src={`http://localhost:5000${staff.photo}`} alt={staff.fullName} />
            ) : (
              <div className="photo-placeholder">{staff.fullName.charAt(0)}</div>
            )}
          </div>

          <div className="profile-basic-info">
            <h2 className="staff-name">{staff.fullName}</h2>
            <p className="staff-id">{staff.staffId}</p>
            <p className="staff-designation">{staff.designation}</p>
            <span className={`staff-type-badge ${staff.staffType.toLowerCase()}`}>{staff.staffType}</span>
          </div>

          <div className="profile-contact">
            <div className="contact-item">
              <span className="contact-icon">📧</span>
              <span className="contact-text">{staff.email}</span>
            </div>
            <div className="contact-item">
              <span className="contact-icon">📱</span>
              <span className="contact-text">{staff.phoneNumber}</span>
            </div>
            <div className="contact-item">
              <span className="contact-icon">🏠</span>
              <span className="contact-text">{staff.address}</span>
            </div>
          </div>
        </div>

        <div className="profile-details">
          <div className="details-card">
            <h3 className="card-title">Personal Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Full Name</span>
                <span className="info-value">{staff.fullName}</span>
              </div>
              <div className="info-item">
                <span className="info-label">NIC</span>
                <span className="info-value">{staff.nic}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Staff ID</span>
                <span className="info-value">{staff.staffId}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Staff Type</span>
                <span className="info-value">{staff.staffType}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Designation</span>
                <span className="info-value">{staff.designation}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Joined Date</span>
                <span className="info-value">{new Date(staff.joinedDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="details-card">
            <h3 className="card-title">Contact Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Email</span>
                <span className="info-value">{staff.email}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Phone Number</span>
                <span className="info-value">{staff.phoneNumber}</span>
              </div>
              <div className="info-item col-span-2">
                <span className="info-label">Address</span>
                <span className="info-value">{staff.address}</span>
              </div>
            </div>
          </div>

          <div className="details-card">
            <h3 className="card-title">Leave Balance</h3>
            <div className="leave-balance">
              <div className="leave-item">
                <div className="leave-progress">
                  <div
                    className="progress-fill annual"
                    style={{ width: `${(staff.leaveBalance.annual / 14) * 100}%` }}
                  ></div>
                </div>
                <div className="leave-details">
                  <span className="leave-type">Annual Leave</span>
                  <span className="leave-count">{staff.leaveBalance.annual} / 14 days</span>
                </div>
              </div>

              <div className="leave-item">
                <div className="leave-progress">
                  <div
                    className="progress-fill casual"
                    style={{ width: `${(staff.leaveBalance.casual / 7) * 100}%` }}
                  ></div>
                </div>
                <div className="leave-details">
                  <span className="leave-type">Casual Leave</span>
                  <span className="leave-count">{staff.leaveBalance.casual} / 7 days</span>
                </div>
              </div>

              <div className="leave-item">
                <div className="leave-progress">
                  <div
                    className="progress-fill medical"
                    style={{ width: `${(staff.leaveBalance.medical / 21) * 100}%` }}
                  ></div>
                </div>
                <div className="leave-details">
                  <span className="leave-type">Medical Leave</span>
                  <span className="leave-count">{staff.leaveBalance.medical} / 21 days</span>
                </div>
              </div>

              <div className="leave-item">
                <div className="leave-progress">
                  <div
                    className="progress-fill total"
                    style={{ width: `${(staff.leaveBalance.remaining / 42) * 100}%` }}
                  ></div>
                </div>
                <div className="leave-details">
                  <span className="leave-type">Total Remaining</span>
                  <span className="leave-count">{staff.leaveBalance.remaining} / 42 days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="delete-modal">
          <div className="modal-content">
            <h2 className="modal-title">Delete Staff Member</h2>
            <p className="modal-message">
              Are you sure you want to delete {staff.fullName}? This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="cancel-button" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button className="confirm-button" onClick={handleDeleteStaff}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StaffProfile

"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { staffService } from "../../../services/staffService"
import { useToast } from "../../../hooks/use-toast"
import "../../../styles/staff-enrollment.css"

const EditStaff = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    fullName: "",
    nic: "",
    email: "",
    phoneNumber: "",
    address: "",
    staffType: "",
    designation: "",
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        const staffData = await staffService.getStaffById(id)
        setFormData({
          fullName: staffData.fullName || "",
          nic: staffData.nic || "",
          email: staffData.email || "",
          phoneNumber: staffData.phoneNumber || "",
          address: staffData.address || "",
          staffType: staffData.staffType || "",
          designation: staffData.designation || "",
        })
        setLoading(false)
      } catch (error) {
        console.error("Error fetching staff data:", error)
        toast({
          title: "Error",
          description: "Failed to load staff data",
          variant: "destructive",
        })
        navigate("/staff-enrollment")
      }
    }

    fetchStaffData()
  }, [id, navigate, toast])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setSaving(true)
      await staffService.updateStaff(id, formData)

      toast({
        title: "Success",
        description: "Staff information updated successfully!",
        variant: "success",
      })

      navigate("/staff-enrollment")
    } catch (error) {
      console.error("Error updating staff:", error)
      toast({
        title: "Error",
        description: "Failed to update staff information",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading staff data...</div>
  }

  return (
    <div className="edit-staff-container">
      <div className="form-header">
        <h1 className="form-title">Edit Staff Member</h1>
        <p className="form-subtitle">Update staff information</p>
      </div>

      <form onSubmit={handleSubmit} className="staff-form">
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">
              Full Name <span className="required">*</span>
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              NIC <span className="required">*</span>
            </label>
            <input
              type="text"
              name="nic"
              value={formData.nic}
              onChange={handleChange}
              required
              className="form-input"
              readOnly // NIC should not be editable
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Email <span className="required">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Phone Number <span className="required">*</span>
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group col-span-2">
            <label className="form-label">
              Address <span className="required">*</span>
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Staff Type <span className="required">*</span>
            </label>
            <select
              name="staffType"
              value={formData.staffType}
              onChange={handleChange}
              required
              className="form-select"
            >
              <option value="">Select Staff Type</option>
              <option value="Academic">Academic</option>
              <option value="Non-Academic">Non-Academic</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              Designation <span className="required">*</span>
            </label>
            <input
              type="text"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate("/staff-enrollment")} className="cancel-button">
            Cancel
          </button>
          <button type="submit" className="submit-button" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditStaff

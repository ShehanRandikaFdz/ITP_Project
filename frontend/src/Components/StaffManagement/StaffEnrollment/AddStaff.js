"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { staffService } from "../../../services/staffService"
import { useToast } from "../../../hooks/use-toast"
import "../../../styles/staff-enrollment.css"

const AddStaff = () => {
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
    photo: null,
  })

  const [photoPreview, setPhotoPreview] = useState(null)
  const [fileName, setFileName] = useState("No file chosen")
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData({ ...formData, photo: file })
      setFileName(file.name)

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required"
    }
    
    if (!formData.nic.trim()) {
      newErrors.nic = "NIC is required"
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }
    
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required"
    } else if (!/^[0-9]{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid 10-digit phone number"
    }
    
    if (!formData.address.trim()) {
      newErrors.address = "Address is required"
    }
    
    if (!formData.staffType) {
      newErrors.staffType = "Staff type is required"
    }
    
    if (!formData.designation.trim()) {
      newErrors.designation = "Designation is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      const formDataToSend = new FormData()
      
      // Append all form data to FormData object
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null) {
          formDataToSend.append(key, formData[key])
        }
      })

      // Log the form data for debugging
      console.log("Submitting form data:", Object.fromEntries(formDataToSend))

      const response = await staffService.createStaff(formDataToSend)

      if (response.success) {
        toast({
          title: "Success",
          description: "Staff member enrolled successfully!",
          variant: "success",
        })

        // Show the generated password to the admin
        if (response.password) {
          alert(
            `Staff member created successfully!\n\nTemporary Password: ${response.password}\n\nPlease share this password with the staff member.`,
          )
        }

        navigate("/staff-enrollment")
      } else {
        throw new Error(response.message || "Failed to enroll staff member")
      }
    } catch (error) {
      console.error("Error enrolling staff:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to enroll staff member. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="add-staff-container">
      <div className="form-header">
        <h1 className="form-title">Add New Staff Member</h1>
        <p className="form-subtitle">Enter staff details to enroll them in the system</p>
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
              className={`form-input ${errors.fullName ? "error" : ""}`}
              placeholder="Enter full name"
            />
            {errors.fullName && <span className="error-message">{errors.fullName}</span>}
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
              className={`form-input ${errors.nic ? "error" : ""}`}
              placeholder="Enter NIC number"
            />
            {errors.nic && <span className="error-message">{errors.nic}</span>}
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
              className={`form-input ${errors.email ? "error" : ""}`}
              placeholder="Enter email address"
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
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
              className={`form-input ${errors.phoneNumber ? "error" : ""}`}
              placeholder="Enter phone number"
            />
            {errors.phoneNumber && <span className="error-message">{errors.phoneNumber}</span>}
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
              className={`form-input ${errors.address ? "error" : ""}`}
              placeholder="Enter address"
            />
            {errors.address && <span className="error-message">{errors.address}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">
              Staff Type <span className="required">*</span>
            </label>
            <select
              name="staffType"
              value={formData.staffType}
              onChange={handleChange}
              className={`form-select ${errors.staffType ? "error" : ""}`}
            >
              <option value="">Select Staff Type</option>
              <option value="academic">Academic</option>
              <option value="non-academic">Non-Academic</option>
            </select>
            {errors.staffType && <span className="error-message">{errors.staffType}</span>}
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
              className={`form-input ${errors.designation ? "error" : ""}`}
              placeholder="Enter designation"
            />
            {errors.designation && <span className="error-message">{errors.designation}</span>}
          </div>
        </div>

        <div className="photo-section">
          <label className="form-label">Staff Photo</label>
          <div className="photo-container">
            <div className="photo-preview">
              {photoPreview ? (
                <img src={photoPreview} alt="Staff preview" />
              ) : (
                <div className="photo-placeholder">
                  <span>📷</span>
                </div>
              )}
            </div>
            <div className="photo-upload">
              <button
                type="button"
                onClick={() => document.getElementById("photo").click()}
                className="upload-button"
              >
                Choose File
              </button>
              <input
                type="file"
                id="photo"
                name="photo"
                onChange={handleFileChange}
                accept="image/*"
                className="file-input"
              />
              <p className="file-name">{fileName}</p>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate("/staff-enrollment")} className="cancel-button">
            Cancel
          </button>
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Enrolling..." : "Enroll Staff"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddStaff

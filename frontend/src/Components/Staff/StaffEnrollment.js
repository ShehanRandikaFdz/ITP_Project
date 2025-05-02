import React, { useState } from 'react';
import { Container, Form, Button, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faEnvelope, 
  faPhone, 
  faMapMarkerAlt, 
  faUserTie, 
  faCalendarAlt,
  faIdCard
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const StaffEnrollment = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    nic: '',
    email: '',
    phoneNumber: '',
    address: '',
    staffType: '',
    designation: '',
    joiningDate: '',
    photo: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      photo: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.fullName || !formData.nic || !formData.email || !formData.phoneNumber || 
        !formData.address || !formData.staffType || !formData.designation || !formData.joiningDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'photo' && formData[key]) {
          formDataToSend.append('photo', formData[key]);
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      const response = await axios.post('http://localhost:5000/api/staff', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        toast.success('Staff member enrolled successfully!');
        navigate('/staff/profiles');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to enroll staff member');
    }
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Staff Enrollment</h2>
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>
                <FontAwesomeIcon icon={faUser} className="me-2" />
                Full Name *
              </Form.Label>
              <Form.Control
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>
                <FontAwesomeIcon icon={faIdCard} className="me-2" />
                NIC *
              </Form.Label>
              <Form.Control
                type="text"
                name="nic"
                value={formData.nic}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>
                <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                Email *
              </Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>
                <FontAwesomeIcon icon={faPhone} className="me-2" />
                Phone Number *
              </Form.Label>
              <Form.Control
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label>
            <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
            Address *
          </Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>
                <FontAwesomeIcon icon={faUserTie} className="me-2" />
                Staff Type *
              </Form.Label>
              <Form.Select
                name="staffType"
                value={formData.staffType}
                onChange={handleChange}
                required
              >
                <option value="">Select Staff Type</option>
                <option value="Academic">Academic</option>
                <option value="Non-Academic">Non-Academic</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>
                <FontAwesomeIcon icon={faUserTie} className="me-2" />
                Designation *
              </Form.Label>
              <Form.Control
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>
                <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                Joining Date *
              </Form.Label>
              <Form.Control
                type="date"
                name="joiningDate"
                value={formData.joiningDate}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>
                <FontAwesomeIcon icon={faUser} className="me-2" />
                Photo
              </Form.Label>
              <Form.Control
                type="file"
                name="photo"
                onChange={handleFileChange}
                accept="image/*"
              />
            </Form.Group>
          </Col>
        </Row>

        <div className="d-flex justify-content-end">
          <Button variant="primary" type="submit">
            Enroll Staff Member
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default StaffEnrollment; 
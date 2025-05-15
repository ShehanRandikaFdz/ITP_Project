import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserTie, faUser, faLock } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { toast } from 'react-toastify';

const StaffLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'staff' // Default role
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/staff/login', {
        email: formData.email,
        password: formData.password,
        role: formData.role
      });
      
      if (response.data.success) {
        // Store user data in localStorage
        localStorage.setItem('staffToken', response.data.token);
        localStorage.setItem('staffRole', response.data.data.role);
        localStorage.setItem('staffName', response.data.data.fullName);
        localStorage.setItem('staffId', response.data.data._id);

        toast.success('Login successful!');
        
        // Redirect based on role
        if (response.data.data.role === 'admin') {
          navigate('/staff/admin');
        } else {
          navigate(`/staff/user/${response.data.data._id}`);
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed. Please check your credentials.');
      toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="shadow">
            <Card.Body>
              <div className="text-center mb-4">
                <h2>Staff Login</h2>
                <p className="text-muted">Please login to access your dashboard</p>
              </div>

              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FontAwesomeIcon icon={faUser} className="me-2" />
                    Email
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter your email"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    <FontAwesomeIcon icon={faLock} className="me-2" />
                    Password
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Enter your password"
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>
                    <FontAwesomeIcon icon={faUserTie} className="me-2" />
                    Login As
                  </Form.Label>
                  <Form.Select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                  >
                    <option value="staff">Staff Member</option>
                    <option value="admin">Admin</option>
                  </Form.Select>
                </Form.Group>

                <div className="d-grid">
                  <Button variant="primary" type="submit" size="lg">
                    Login
                  </Button>
                </div>
              </Form>

              <div className="mt-4 text-center">
                <p className="text-muted">
                  {formData.role === 'staff' 
                    ? 'Staff members can access their personal dashboard, leave management, and attendance records.'
                    : 'Admins can manage staff, handle leave requests, and view attendance reports.'}
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default StaffLogin; 
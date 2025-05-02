"use client"

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faCalendarAlt, faClock, faChartLine } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { toast } from 'react-toastify';
import "../../styles/staff-dashboard.css"

const StaffDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  // Get staff ID from params or localStorage
  const staffId = id || localStorage.getItem('staffId');
  const [staffData, setStaffData] = useState(null);
  const [leaveBalance, setLeaveBalance] = useState({
    annual: 0,
    sick: 0,
    casual: 0,
  })
  const [attendanceStats, setAttendanceStats] = useState({
    present: 0,
    absent: 0,
    late: 0,
    percentage: 0,
  })
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!staffId) {
        setError('Staff ID not found');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`http://localhost:5000/api/staff/dashboard/staff/${staffId}`);
        setStaffData(response.data.data.staff);
        setLeaveBalance({
          annual: response.data.data.staff.leaveBalance?.annual || 21,
          sick: response.data.data.staff.leaveBalance?.medical || 14,
          casual: response.data.data.staff.leaveBalance?.casual || 7
        });
        setAttendanceStats({
          present: 0,
          absent: 0,
          late: 0,
          percentage: 0
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching staff dashboard data:', error);
        setError('Failed to load dashboard data');
        setLoading(false);
        toast.error('Failed to load dashboard data');
      }
    };

    fetchData();
  }, [staffId]);

  // Handler functions for buttons
  const handleViewProfile = () => {
    navigate('/staff/user/account');
  };

  const handleApplyForLeave = () => {
    navigate('/staff/user/leave');
  };

  const handleViewAttendance = () => {
    navigate('/staff/user/attendance');
  };

  if (loading) {
    return (
      <Container className="mt-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </Container>
    );
  }

  if (!staffData) {
    return (
      <Container className="mt-5">
        <div className="alert alert-warning" role="alert">
          No staff data found
        </div>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row>
        <Col md={4}>
          <Card className="mb-4">
            <Card.Body>
              <div className="text-center mb-4">
                <FontAwesomeIcon icon={faUser} size="3x" className="text-primary" />
                <h3 className="mt-3">{staffData.fullName}</h3>
                <p className="text-muted">{staffData.designation}</p>
              </div>
              <div className="staff-info">
                <p><strong>Staff ID:</strong> {staffData.staffId}</p>
                <p><strong>Email:</strong> {staffData.email}</p>
                <p><strong>Phone:</strong> {staffData.phoneNumber}</p>
                <p><strong>Staff Type:</strong> {staffData.staffType}</p>
                <p><strong>Address:</strong> {staffData.address}</p>
              </div>
              <Button 
                variant="primary" 
                className="w-100 mt-3"
                onClick={handleViewProfile}
              >
                View Full Profile
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={8}>
          <Row>
            <Col md={6}>
              <Card className="mb-4">
                <Card.Body>
                  <h5 className="card-title">
                    <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                    Leave Balance
                  </h5>
                  <div className="leave-balance">
                    <div className="balance-item">
                      <span>Annual Leave</span>
                      <strong>{leaveBalance.annual} days</strong>
                    </div>
                    <div className="balance-item">
                      <span>Medical Leave</span>
                      <strong>{leaveBalance.sick} days</strong>
                    </div>
                    <div className="balance-item">
                      <span>Casual Leave</span>
                      <strong>{leaveBalance.casual} days</strong>
                    </div>
                  </div>
                  <Button 
                    variant="success" 
                    className="w-100 mt-3"
                    onClick={handleApplyForLeave}
                  >
                    Apply for Leave
                  </Button>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6}>
              <Card className="mb-4">
                <Card.Body>
                  <h5 className="card-title">
                    <FontAwesomeIcon icon={faClock} className="me-2" />
                    Attendance Summary
                  </h5>
                  <div className="attendance-stats">
                    <div className="stat-item">
                      <span>Present</span>
                      <strong>{attendanceStats.present}</strong>
                    </div>
                    <div className="stat-item">
                      <span>Absent</span>
                      <strong>{attendanceStats.absent}</strong>
                    </div>
                    <div className="stat-item">
                      <span>Late</span>
                      <strong>{attendanceStats.late}</strong>
                    </div>
                    <div className="stat-item">
                      <span>Attendance %</span>
                      <strong>{attendanceStats.percentage}%</strong>
                    </div>
                  </div>
                  <Button 
                    variant="info" 
                    className="w-100 mt-3"
                    onClick={handleViewAttendance}
                  >
                    View Attendance
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card>
            <Card.Body>
              <h5 className="card-title">
                <FontAwesomeIcon icon={faChartLine} className="me-2" />
                Recent Activities
              </h5>
              <div className="recent-activities">
                <p className="text-muted">No recent activities to display</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default StaffDashboard;

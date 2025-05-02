import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUserTie, 
  faUser, 
  faCalendarAlt, 
  faClipboardList,
  faUserPlus,
  faFileAlt,
  faChartBar,
  faUserCircle,
  faHistory
} from '@fortawesome/free-solid-svg-icons';

const StaffManagement = () => {
  const navigate = useNavigate();

  const userDashboardItems = [
    {
      title: 'My Account',
      icon: faUserCircle,
      path: '/staff/user/account',
      description: 'View your personal details and profile information'
    },
    {
      title: 'Leave Management',
      icon: faCalendarAlt,
      path: '/staff/user/leave',
      description: 'Apply for leave, check leave balance, and view leave history'
    },
    {
      title: 'Attendance',
      icon: faClipboardList,
      path: '/staff/user/attendance',
      description: 'Mark attendance and view your attendance profile'
    }
  ];

  const adminDashboardItems = [
    {
      title: 'Staff Profiles',
      icon: faUserTie,
      path: '/staff',
      description: 'View and manage all staff profiles'
    },
    {
      title: 'Staff Enrollment',
      icon: faUserPlus,
      path: '/staff/enrollment',
      description: 'Add new staff members (Academic / Non-Academic)'
    },
    {
      title: 'Leave Management',
      icon: faCalendarAlt,
      path: '/staff/admin/leave',
      description: 'Approve or reject leave requests and generate reports'
    },
    {
      title: 'Attendance',
      icon: faChartBar,
      path: '/staff/admin/attendance',
      description: 'View attendance reports and analyze attendance trends'
    }
  ];

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Staff Management</h2>
      
      {/* User Dashboard Section */}
      <div className="mb-5">
        <h3 className="mb-4">Staff Member Dashboard</h3>
        <Row>
          {userDashboardItems.map((item, index) => (
            <Col key={index} md={4} className="mb-4">
              <Card className="h-100">
                <Card.Body className="text-center">
                  <FontAwesomeIcon 
                    icon={item.icon} 
                    size="3x" 
                    className="mb-3 text-primary" 
                  />
                  <Card.Title>{item.title}</Card.Title>
                  <Card.Text>{item.description}</Card.Text>
                  <Button 
                    variant="primary" 
                    onClick={() => navigate(item.path)}
                  >
                    Go to {item.title}
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Admin Dashboard Section */}
      <div className="mb-5">
        <h3 className="mb-4">Admin Dashboard</h3>
        <Row>
          {adminDashboardItems.map((item, index) => (
            <Col key={index} md={4} className="mb-4">
              <Card className="h-100">
                <Card.Body className="text-center">
                  <FontAwesomeIcon 
                    icon={item.icon} 
                    size="3x" 
                    className="mb-3 text-primary" 
                  />
                  <Card.Title>{item.title}</Card.Title>
                  <Card.Text>{item.description}</Card.Text>
                  <Button 
                    variant="primary" 
                    onClick={() => navigate(item.path)}
                  >
                    Go to {item.title}
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </Container>
  );
};

export default StaffManagement;

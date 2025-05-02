import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faUser, 
  faEnvelope, 
  faPhone, 
  faMapMarkerAlt, 
  faUserTie,
  faChalkboardTeacher,
  faUserShield,
  faIdCard,
  faCalendarAlt,
  faFilter,
  faEye,
  faFileExport,
  faFileDownload
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';

const StaffProfiles = () => {
  const [staffMembers, setStaffMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchStaffMembers();
  }, []);

  const fetchStaffMembers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/staff');
      setStaffMembers(response.data.data || []);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch staff members');
      setLoading(false);
    }
  };

  const filteredStaff = staffMembers.filter(staff => {
    const matchesSearch = (staff.fullName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || (staff.staffType || '').toLowerCase() === selectedType.toLowerCase();
    return matchesSearch && matchesType;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getStaffTypeIcon = (staffType) => {
    switch (staffType?.toLowerCase()) {
      case 'academic':
        return faChalkboardTeacher;
      case 'non-academic':
        return faUserShield;
      default:
        return faUser;
    }
  };

  const handleViewDetails = (staff) => {
    setSelectedStaff(staff);
    setShowDetails(true);
  };

  const handleExportAll = () => {
    const exportData = filteredStaff.map(staff => ({
      'Full Name': staff.fullName || 'N/A',
      'Staff Type': staff.staffType || 'N/A',
      'Designation': staff.designation || 'N/A',
      'Email': staff.email || 'N/A',
      'Phone': staff.phoneNumber || 'N/A',
      'Address': staff.address || 'N/A',
      'Joining Date': formatDate(staff.joiningDate)
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Staff Members');
    XLSX.writeFile(wb, 'staff_members.xlsx');
  };

  const handleExportDetails = (staff) => {
    const exportData = {
      'Full Name': staff.fullName || 'N/A',
      'NIC': staff.nic || 'N/A',
      'Staff Type': staff.staffType || 'N/A',
      'Designation': staff.designation || 'N/A',
      'Email': staff.email || 'N/A',
      'Phone': staff.phoneNumber || 'N/A',
      'Address': staff.address || 'N/A',
      'Joining Date': formatDate(staff.joiningDate)
    };

    const ws = XLSX.utils.json_to_sheet([exportData]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Staff Details');
    XLSX.writeFile(wb, `${staff.fullName || 'staff'}_details.xlsx`);
  };

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Staff Profiles</h2>
        <Button variant="success" onClick={handleExportAll}>
          <FontAwesomeIcon icon={faFileExport} className="me-2" />
          Export All
        </Button>
      </div>
      
      {/* Search and Filter Bar */}
      <div className="d-flex flex-column flex-md-row gap-3 mb-4">
        <Form.Group className="flex-grow-1">
          <div className="input-group">
            <Form.Control
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button variant="primary">
              <FontAwesomeIcon icon={faSearch} />
            </Button>
          </div>
        </Form.Group>

        <Form.Group style={{ minWidth: '200px' }}>
          <div className="input-group">
            <span className="input-group-text">
              <FontAwesomeIcon icon={faFilter} />
            </span>
            <Form.Select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="all">All Staff Types</option>
              <option value="Academic">Academic Staff</option>
              <option value="Non-Academic">Non-Academic Staff</option>
            </Form.Select>
          </div>
        </Form.Group>
      </div>

      {/* Staff Table */}
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Name</th>
            <th>Staff Type</th>
            <th>Designation</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="4" className="text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </td>
            </tr>
          ) : filteredStaff.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center">No staff members found</td>
            </tr>
          ) : (
            filteredStaff.map((staff) => (
              <tr key={staff._id}>
                <td>{staff.fullName || 'Unnamed Staff'}</td>
                <td>{staff.staffType || 'Not Specified'}</td>
                <td>{staff.designation || 'N/A'}</td>
                <td>
                  <div className="d-flex gap-2">
                    <Button 
                      variant="info" 
                      size="sm"
                      onClick={() => handleViewDetails(staff)}
                    >
                      <FontAwesomeIcon icon={faEye} className="me-2" />
                      View
                    </Button>
                    <Button 
                      variant="success" 
                      size="sm"
                      onClick={() => handleExportDetails(staff)}
                    >
                      <FontAwesomeIcon icon={faFileDownload} className="me-2" />
                      Export
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* Details Modal */}
      <Modal show={showDetails} onHide={() => setShowDetails(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Staff Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedStaff && (
            <div className="row">
              <div className="col-md-4 text-center mb-3">
                {selectedStaff.photo ? (
                  <img
                    src={selectedStaff.photo}
                    alt={selectedStaff.fullName}
                    className="rounded-circle"
                    style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                  />
                ) : (
                  <FontAwesomeIcon 
                    icon={getStaffTypeIcon(selectedStaff.staffType)} 
                    size="5x" 
                    className="text-primary" 
                  />
                )}
              </div>
              <div className="col-md-8">
                <h4 className="mb-3">{selectedStaff.fullName}</h4>
                <div className="staff-details">
                  <p><FontAwesomeIcon icon={faIdCard} className="me-2" /> NIC: {selectedStaff.nic || 'N/A'}</p>
                  <p><FontAwesomeIcon icon={faUserTie} className="me-2" /> Designation: {selectedStaff.designation || 'N/A'}</p>
                  <p><FontAwesomeIcon icon={faEnvelope} className="me-2" /> Email: {selectedStaff.email || 'N/A'}</p>
                  <p><FontAwesomeIcon icon={faPhone} className="me-2" /> Phone: {selectedStaff.phoneNumber || 'N/A'}</p>
                  <p><FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" /> Address: {selectedStaff.address || 'N/A'}</p>
                  <p><FontAwesomeIcon icon={faCalendarAlt} className="me-2" /> Joined: {formatDate(selectedStaff.joiningDate)}</p>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetails(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default StaffProfiles; 
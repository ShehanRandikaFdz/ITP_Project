"use client"

import { Routes, Route, Navigate } from "react-router-dom"
import { ToastProvider, useToast } from "./hooks/use-toast"
import ToastContainer from "./Components/ui/ToastContainer"

// Layout components
import Nav from "./Components/Nav/Nav"

// Student Management Pages
import StudentManagement from "./Components/StudentManagement/StudentManagement"
import StudentEnrollment from "./Components/StudentEnrollment/StudentEnroll"
import StudentProfile from "./Components/StudentProfile/StudentProfile"
import StudentList from "./Components/StudentList/StudentList"
import ClassAttendance from "./Components/Attendance/ClassAttendance"
import ExamResults from "./Components/ExamResults/ExamResults"
import AddExamResult from "./Components/ExamResults/AddExamResult"
import EditExamResult from "./Components/ExamResults/EditExamResult"

// Inventory Management Pages
import InventoryDashboard from "./pages/InventoryDashboard"
import InventoryList from "./pages/InventoryList"
import AddItem from "./pages/AddItems"
import EditItem from "./pages/EditItem"
import ItemDetails from "./pages/ItemDetails"
import StockReport from "./Components/StockReport"

// Staff Management Pages
import StaffManagement from "./Components/StaffManagement/StaffManagement"
import StaffLogin from "./Components/StaffManagement/StaffLogin"
import StaffEnrollment from "./Components/StaffManagement/StaffEnrollment/StaffEnrollment"
import StaffProfile from "./Components/StaffManagement/StaffProfile/StaffProfile"
import AdminLeaveManagement from "./Components/StaffManagement/LeaveManagement/AdminLeaveManagement"
import StaffLeaveManagement from "./Components/StaffManagement/LeaveManagement/StaffLeaveManagement"
import StaffAttendance from "./Components/StaffManagement/Attendance/StaffAttendance"
import AdminAttendance from "./Components/StaffManagement/Attendance/AdminAttendance"
import AdminDashboard from "./Components/StaffManagement/AdminDashboard"
import StaffDashboard from "./Components/StaffManagement/StaffDashboard"
import StaffProfiles from "./Components/Staff/StaffProfiles"

// Event Management Pages
import CalendarPage from "./Components/EventManagement/Calendar"
import AddEventForm from './Components/EventManagement/AddEventForm';
import MyEvents from './Components/EventManagement/MyEvents';
import EventRequests from './Components/EventManagement/EventRequests';
import EditEventForm from './Components/EventManagement/EditEventForm';



// Dashboard
import Dashboard from "./pages/Dashboard"

// Add the import for UpdateStudent
import UpdateStudent from "./Components/StudentEnrollment/UpdateStudent"

// Toast wrapper component to access context
const ToastWrapper = () => {
  const { toasts, dismiss } = useToast()
  return <ToastContainer toasts={toasts} onClose={dismiss} />
}
// Protected Route component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const staffRole = localStorage.getItem('staffRole');
  const staffToken = localStorage.getItem('staffToken');

  if (!staffToken) {
    return <Navigate to="/staff/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(staffRole)) {
    return <Navigate to="/staff/login" replace />;
  }

  return children;
};
function App() {
  return (
    <ToastProvider>
      <div className="bg-gray-50 min-h-screen">
        <Nav />
        <div className="main-content">
          <main className="p-4">
            <Routes>
              {/* Dashboard Route */}
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Student Management Routes */}
              <Route path="/" element={<StudentManagement />} />
              <Route path="/student-enrollment" element={<StudentEnrollment />} />
              <Route path="/student-profiles" element={<StudentList />} />
              <Route path="/student-profiles/:studentId" element={<StudentProfile />} />
              <Route path="/student-profiles/edit/:studentId" element={<UpdateStudent />} />
              <Route path="/attendance" element={<ClassAttendance />} />
              <Route path="/exam-results/:studentId" element={<ExamResults />} />
              <Route path="/exam-results/:studentId/add" element={<AddExamResult />} />
              <Route path="/exam-results/:studentId/edit/:resultId" element={<EditExamResult />} />

              {/* Inventory Management Routes */}
              <Route path="/inventory" element={<InventoryDashboard />} />
              <Route path="/inventory/list" element={<InventoryList />} />
              <Route path="/inventory/add" element={<AddItem />} />
              <Route path="/inventory/edit/:id" element={<EditItem />} />
              <Route path="/inventory/reports/stock" element={<StockReport />} />
              <Route path="/inventory/:id" element={<ItemDetails />} />

              {/* Event Management Routes */}
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/add-event" element={<AddEventForm />} />
              <Route path="/my-events" element={<MyEvents />} />
              <Route path="/event-requests" element={<EventRequests />} />
              <Route path="/edit-event/:id" element={<EditEventForm />} />

                {/* Staff Management Routes */}
                <Route path="/staff" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <StaffProfiles />
                </ProtectedRoute>
              } />
              <Route path="/staff/login" element={<StaffLogin />} />
              
              {/* Protected Admin Routes */}
              <Route path="/staff/admin" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/staff/enrollment" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <StaffEnrollment />
                </ProtectedRoute>
              } />
              <Route path="/staff/profiles" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <StaffProfiles />
                </ProtectedRoute>
              } />
              <Route path="/staff/admin/leave" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLeaveManagement />
                </ProtectedRoute>
              } />
              <Route path="/staff/admin/attendance" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminAttendance />
                </ProtectedRoute>
              } />

              {/* Protected Staff User Routes */}
              <Route path="/staff/user" element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <StaffDashboard />
                </ProtectedRoute>
              } />
              <Route path="/staff/user/:id" element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <StaffDashboard />
                </ProtectedRoute>
              } />
              <Route path="/staff/user/account" element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <StaffProfile />
                </ProtectedRoute>
              } />
              <Route path="/staff/user/leave" element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <StaffLeaveManagement />
                </ProtectedRoute>
              } />
              <Route path="/staff/user/attendance" element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <StaffAttendance />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
        </div>
        <ToastWrapper />
      </div>
    </ToastProvider>
  )
}

export default App
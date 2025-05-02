"use client"

import { Routes, Route } from "react-router-dom"
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


            </Routes>
          </main>
        </div>
        <ToastWrapper />
      </div>
    </ToastProvider>
  )
}

export default App

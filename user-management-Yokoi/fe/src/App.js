import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './components/Login/LoginPage';
import TopPage from './components/Top/TopPage';
import ProtectedRoute from './ProtectedRoute';
import { AuthProvider } from './AuthContext';
import AttendanceTablePage from './components/Attendance/AttendanceTable';
import NewAccountPage from './components/NewAccount/NewAccountPage';
import NewAccountAfter from './components/NewAccount/NewAccountAfter';
import Member from './components/Member/Member';
import MemberData from './components/Member/MemberData';
import MemberAttendanceTable from './components/Member/MemberAttendanceTable';
import ExpensesPage from './components/Expenses/Expenses';
import HolidayPage from './components/holiday/holiday';
import PassPage from './components/Pass/PassPage';
import CostPage from './components/Cost/CostPage';
import MemberCost from './components/Member/MemberCost';
import 'bootstrap/dist/css/bootstrap.min.css';

const AppContent = () => {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProtectedRoute component={TopPage} />} />
        <Route path="/attendance_table" element={<ProtectedRoute component={AttendanceTablePage} />} />
        <Route path="/pass" element={<ProtectedRoute component={PassPage} />} />
        <Route path="/expenses" element={<ProtectedRoute component={ExpensesPage} />} />
        <Route path="/holiday" element={<ProtectedRoute component={HolidayPage} />} />
        <Route path="/new_account" element={<NewAccountPage />} />
        <Route path="/new_account_after/:id" element={<NewAccountAfter />} />
        <Route path="/member" element={<ProtectedRoute component={Member} />} />
        <Route path="/user/:id" element={<ProtectedRoute component={MemberData} />} />
        <Route path="/attendance/:id" element={<ProtectedRoute component={MemberAttendanceTable} />} />
        <Route path="/cost" element={<ProtectedRoute component={CostPage} />} />
        <Route path="/cost/:id" element={<ProtectedRoute component={MemberCost} />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;

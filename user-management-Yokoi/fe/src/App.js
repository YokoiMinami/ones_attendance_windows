import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import LoginPage from './components/Login/LoginPage';
import TopPage from './components/Top/TopPage';
import Account from './components/Account';
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

const AppContent = () => {
  
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/account" element={<Account />} />
        <Route path="/" element={<ProtectedRoute component={TopPage} />} />
        <Route path="/attendance_table" element={<AttendanceTablePage />} />
        <Route path="/expenses" element={<ExpensesPage />} />
        <Route path="/holiday" element={<HolidayPage />} />
        <Route path="/new_account" element={<NewAccountPage />} />
        <Route path="/new_account_after/:id" element={<NewAccountAfter />} />
        <Route path="/member" element={<Member />} />
        <Route path="/user/:id" element={<MemberData />} />
        <Route path="/attendance/:id" element={<MemberAttendanceTable />} />
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
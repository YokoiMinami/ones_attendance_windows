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

const AppContent = () => {
  
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/account" element={<Account />} />
        <Route path="/" element={<ProtectedRoute component={TopPage} />} />
        <Route path="/attendance_table" element={<AttendanceTablePage />} />
        <Route path="/new_account" element={<NewAccountPage />} />
        <Route path="/new_account_after/:id" element={<NewAccountAfter />} />
        <Route path="/member" element={<Member />} />
        <Route path="/user/:id" element={<MemberData />} />
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
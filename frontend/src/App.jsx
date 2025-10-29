// App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NavbarActionProvider } from './context/NavbarActionContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import StaffManagement from './pages/StaffManagement';
import StaffDetails from './pages/StaffDetails';
import IPRPage from './pages/IPRPage';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import './App.css';

const ProtectedRoute = ({ children, adminOnly = false, managerGroup = null }) => {
  const { user, loading, isAdmin, isManager } = useAuth();

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  // New check for manager role
  if (managerGroup && !isAdmin()) {
    if (!isManager || user.management_group !== managerGroup)
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const Layout = ({ children }) => {
  return (
    <div className="app-layout">
      <NavbarActionProvider>
        <Navbar />
        <div className="app-container">
          <Sidebar />
          <main className="app-content">{children}</main>
        </div>
      </NavbarActionProvider>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/students"
            element={
              <ProtectedRoute>
                <Layout>
                  <Students />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/staff-details"
            element={
              <ProtectedRoute>
                <Layout>
                  <StaffDetails />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/ipr"
            element={
              <ProtectedRoute>
                <Layout>
                  <IPRPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/staff-management/rd"
            element={
              <ProtectedRoute managerGroup="rd">
                <Layout>
                  <StaffManagement group="rd" />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff-management/ipr"
            element={
              <ProtectedRoute managerGroup="ipr">
                <Layout>
                  <StaffManagement group="ipr" />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { Crown } from 'lucide-react';

// Components
import Sidebar from './components/Sidebar';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Menu from './pages/Menu';
import Tables from './pages/Tables';
import Orders from './pages/Orders';
import Kitchen from './pages/Kitchen';
import Billing from './pages/Billing';
import QRMenu from './pages/QRMenu';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0D0A08' }}>
      <div className="text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
          style={{ background: 'linear-gradient(135deg, #D4956A, #B87333)', boxShadow: '0 8px 32px rgba(184,115,51,0.35)' }}>
          <Crown size={26} className="text-white" />
        </div>
        <div className="w-8 h-8 border-2 rounded-full animate-spin mx-auto"
          style={{ borderColor: 'rgba(184,115,51,0.3)', borderTopColor: '#B87333' }} />
        <p className="text-sm font-light" style={{ color: 'rgba(245,237,216,0.35)' }}>Loading...</p>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
};

const MainLayout = ({ children }) => {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0D0A08' }}>
      <Sidebar />
      <main className="flex-1 overflow-y-auto relative">
        {/* Warm ambient top glow */}
        <div className="fixed top-0 left-64 right-0 h-px pointer-events-none z-10"
          style={{ background: 'linear-gradient(90deg, rgba(184,115,51,0.3), transparent)' }} />
        {/* Grid pattern content area */}
        <div className="min-h-full grid-pattern">
          <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: '#1E1510',
                color: '#F5EDD8',
                border: '1px solid rgba(184,115,51,0.2)',
                borderRadius: '14px',
                fontSize: '14px',
                fontWeight: '500',
                boxShadow: '0 20px 50px rgba(0,0,0,0.6), 0 0 0 1px rgba(184,115,51,0.08)',
                fontFamily: 'DM Sans, sans-serif',
              },
              success: {
                iconTheme: { primary: '#B87333', secondary: '#1E1510' },
              },
              error: {
                iconTheme: { primary: '#FCA5A5', secondary: '#1E1510' },
              },
            }}
          />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/public/menu/:tableId" element={<QRMenu />} />

            <Route path="/" element={
              <ProtectedRoute>
                <MainLayout><Dashboard /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/menu" element={
              <ProtectedRoute roles={['Admin', 'Waiter', 'Chef']}>
                <MainLayout><Menu /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/tables" element={
              <ProtectedRoute roles={['Admin', 'Waiter']}>
                <MainLayout><Tables /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute roles={['Admin', 'Waiter']}>
                <MainLayout><Orders /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/kitchen" element={
              <ProtectedRoute roles={['Admin', 'Chef']}>
                <MainLayout><Kitchen /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/bills" element={
              <ProtectedRoute roles={['Admin', 'Waiter']}>
                <MainLayout><Billing /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;

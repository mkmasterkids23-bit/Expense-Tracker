import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import OTPVerification from './pages/OTPVerification';
import ComingSoon from './pages/ComingSoon';
import Dashboard from './pages/Dashboard';
import { motion, AnimatePresence } from 'motion/react';

function ProtectedRoute({ children, redirectTo = "/login" }: { children: React.ReactNode, redirectTo?: string }) {
  const { user, loading } = useAuth();
  
  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-slate-50">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"
      />
    </div>
  );

  if (!user) return <Navigate to={redirectTo} replace />;
  
  return <>{children}</>;
}

function AppContent() {
  const { user } = useAuth();
  
  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/login" element={
            user ? <Navigate to="/dashboard" replace /> : <Login />
          } />
          <Route path="/signup" element={
            user ? <Navigate to="/dashboard" replace /> : <SignUp />
          } />
          <Route path="/otp" element={<OTPVerification />} />
          
          <Route path="/coming-soon" element={
            <ProtectedRoute>
              <ComingSoon />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/" element={
            user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
          } />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AnimatePresence>
    </main>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

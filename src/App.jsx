import React from 'react';
import { Toaster } from "@/components/ui/toaster"
import { base44 } from '@/api/base44Client';
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ProtectedRoute from '@/components/ProtectedRoute';
import Forbidden from '@/components/Forbidden';

import AppLayout from './components/layout/AppLayout';
import { useEffect } from 'react';
import Home from './pages/Home';
import RoleSelect from './pages/RoleSelect';
import Registration from './pages/Registration';
import CandidateRegistration from './pages/CandidateRegistration';
import CompanyRegistration from './pages/CompanyRegistration';
import Pricing from './pages/Pricing';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import Candidates from './pages/Candidates';
import CandidateDetail from './pages/CandidateDetail';
import SavedCandidates from './pages/SavedCandidates';
import EditCandidateProfile from './pages/EditCandidateProfile';
import EditCompanyProfile from './pages/EditCompanyProfile';
import CandidateDashboard from './pages/CandidateDashboard';
import CompanyDashboard from './pages/CompanyDashboard';
import PostJob from './pages/PostJob';
import ManageJobs from './pages/ManageJobs';
import Messages from './pages/Messages';
import AdminDashboard from './pages/AdminDashboard';

// Redirect users to their role-specific dashboard after login
function RoleRedirect() {
  const { isLoadingAuth } = useAuth();
  const [user, setUser] = React.useState(undefined);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  if (isLoadingAuth || user === undefined) return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div>
    </div>
  );
  if (!user) return <Navigate to="/Home" replace />;
  if (user.role === 'admin') return <Navigate to="/AdminDashboard" replace />;
  if (user.role === 'candidate') return <Navigate to="/CandidateDashboard" replace />;
  if (user.role === 'company') return <Navigate to="/CompanyDashboard" replace />;
  return <Navigate to="/RoleSelect" replace />;
}

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<RoleRedirect />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/RoleSelect" element={<RoleSelect />} />
        <Route path="/Registration" element={<Registration />} />
        <Route path="/CandidateRegistration" element={<CandidateRegistration />} />
        <Route path="/CompanyRegistration" element={<CompanyRegistration />} />
        <Route path="/Pricing" element={<Pricing />} />
        <Route path="/Jobs" element={<Jobs />} />
        <Route path="/JobDetail" element={<JobDetail />} />
        <Route path="/Candidates" element={<ProtectedRoute requiredRoles={['company', 'admin']}><Candidates /></ProtectedRoute>} />
        <Route path="/CandidateDetail" element={<ProtectedRoute requiredRoles={['company', 'admin']}><CandidateDetail /></ProtectedRoute>} />
        <Route path="/SavedCandidates" element={<ProtectedRoute requiredRoles={['company']}><SavedCandidates /></ProtectedRoute>} />
        <Route path="/CandidateDashboard" element={<ProtectedRoute requiredRoles={['candidate']}><CandidateDashboard /></ProtectedRoute>} />
        <Route path="/EditCandidateProfile" element={<ProtectedRoute requiredRoles={['candidate']}><EditCandidateProfile /></ProtectedRoute>} />
        <Route path="/CompanyDashboard" element={<ProtectedRoute requiredRoles={['company']}><CompanyDashboard /></ProtectedRoute>} />
        <Route path="/EditCompanyProfile" element={<ProtectedRoute requiredRoles={['company']}><EditCompanyProfile /></ProtectedRoute>} />
        <Route path="/PostJob" element={<ProtectedRoute requiredRoles={['company']}><PostJob /></ProtectedRoute>} />
        <Route path="/ManageJobs" element={<ProtectedRoute requiredRoles={['company']}><ManageJobs /></ProtectedRoute>} />
        <Route path="/AdminDashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/forbidden" element={<Forbidden />} />
        <Route path="*" element={<PageNotFound />} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
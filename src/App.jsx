import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ProtectedRoute from '@/components/ProtectedRoute';
import Forbidden from '@/components/Forbidden';

import AppLayout from './components/layout/AppLayout';
import Home from './pages/Home';
import RoleSelect from './pages/RoleSelect';
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
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/RoleSelect" element={<RoleSelect />} />
        <Route path="/Pricing" element={<Pricing />} />
        <Route path="/Jobs" element={<Jobs />} />
        <Route path="/JobDetail" element={<JobDetail />} />
        <Route path="/Candidates" element={<Candidates />} />
        <Route path="/CandidateDetail" element={<CandidateDetail />} />
        <Route path="/SavedCandidates" element={<SavedCandidates />} />
        <Route path="/EditCandidateProfile" element={<EditCandidateProfile />} />
        <Route path="/EditCompanyProfile" element={<EditCompanyProfile />} />
        <Route path="/CandidateDashboard" element={<CandidateDashboard />} />
        <Route path="/CompanyDashboard" element={<CompanyDashboard />} />
        <Route path="/PostJob" element={<PostJob />} />
        <Route path="/ManageJobs" element={<ManageJobs />} />
        <Route path="/Messages" element={<ProtectedRoute requiredRoles={['candidate', 'company', 'super_admin']}><Messages /></ProtectedRoute>} />
        <Route path="/AdminDashboard" element={<ProtectedRoute requiredRole="super_admin"><AdminDashboard /></ProtectedRoute>} />
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
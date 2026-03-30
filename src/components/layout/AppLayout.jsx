import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import Navbar from './Navbar';

const EXEMPT_PATHS = ['/Home', '/RoleSelect', '/EditCandidateProfile', '/EditCompanyProfile', '/Pricing'];

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me().catch(() => null),
  });

  useEffect(() => {
    if (isLoading || !user) return;
    const path = location.pathname;
    if (EXEMPT_PATHS.includes(path)) return;

    if (!user.role || user.role === 'user') {
      navigate('/RoleSelect');
      return;
    }

    if (!user.profile_setup_complete) {
      if (user.role === 'candidate') {
        navigate('/EditCandidateProfile');
      } else if (user.role === 'company') {
        navigate('/EditCompanyProfile');
      }
    }
  }, [user, isLoading, location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar user={user} />
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
}
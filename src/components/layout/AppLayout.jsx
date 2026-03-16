import React from 'react';
import { Outlet } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import Navbar from './Navbar';

export default function AppLayout() {
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me().catch(() => null),
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar user={user} />
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
}
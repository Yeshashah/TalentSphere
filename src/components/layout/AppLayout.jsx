import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import Navbar from './Navbar';
import StarField from '../ui/StarField';

export default function AppLayout() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen relative">
      <StarField />
      <div className="relative z-10">
        <Navbar user={user} />
        <main className="pt-16">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
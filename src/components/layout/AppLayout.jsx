import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function AppLayout({ user }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar user={user} />
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
}
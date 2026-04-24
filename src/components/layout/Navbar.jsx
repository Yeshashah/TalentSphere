import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Briefcase, Users, LogOut, LayoutDashboard, MessageSquare } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import NotificationBell from '@/components/shared/NotificationBell';

export default function Navbar({ user }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const role = user?.role;

  const publicLinks = [
    { to: '/Home', label: 'Home' },
    { to: '/Jobs', label: 'Jobs' },
    { to: '/Candidates', label: 'Talent' },
    { to: '/Pricing', label: 'Pricing' },
  ];

  const candidateLinks = [
    { to: '/CandidateDashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/Jobs', label: 'Find Jobs', icon: Briefcase },
    { to: '/Messages', label: 'Messages', icon: MessageSquare },
  ];

  const companyLinks = [
    { to: '/CompanyDashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/ManageJobs', label: 'My Jobs', icon: Briefcase },
    { to: '/PostJob', label: 'Post Job', icon: Briefcase },
    { to: '/Candidates', label: 'Find Talent', icon: Users },
    { to: '/SavedCandidates', label: 'Saved', icon: Users },
    { to: '/Messages', label: 'Messages', icon: MessageSquare },
  ];

  const adminLinks = [
    { to: '/AdminDashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/Candidates', label: 'Candidates', icon: Users },
  ];

  const roleLinks = role === 'company' ? companyLinks : role === 'admin' ? adminLinks : candidateLinks;
  const navLinks = user ? roleLinks : publicLinks;

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/Home" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900 tracking-tight">TalentHub</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive(link.to)
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {link.icon && <link.icon className="w-4 h-4" />}
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-2">
            {user && <NotificationBell userEmail={user.email} />}
            {user ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-slate-500 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            ) : (
              <Button size="sm" onClick={() => navigate('/login')} className="bg-slate-900 text-white hover:bg-indigo-600 rounded-xl transition-all shadow-md">
                Get Started
              </Button>
            )}
          </div>

          {/* Mobile */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="flex flex-col gap-2 mt-8">
                {navLinks.map(link => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setOpen(false)}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                      isActive(link.to) ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {link.icon && <link.icon className="w-4 h-4" />}
                    {link.label}
                  </Link>
                ))}
                <div className="border-t my-2" />
                {user ? (
                  <Button variant="ghost" onClick={() => { logout(); setOpen(false); }}>
                    <LogOut className="w-4 h-4 mr-2" /> Sign Out
                  </Button>
                ) : (
                  <Button onClick={() => { navigate('/login'); setOpen(false); }}>
                    Get Started
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
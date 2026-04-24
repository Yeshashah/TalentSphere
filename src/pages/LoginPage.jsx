import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Briefcase, LogIn } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  // If already logged in, send them home
  if (user) {
    if (user.role === 'candidate') return navigate('/Jobs');
    if (user.role === 'company')   return navigate('/CompanyDashboard');
    if (user.role === 'admin')     return navigate('/AdminDashboard');
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Please enter email and password'); return; }
    setLoading(true);
    setError('');
    try {
      const loggedIn = await login(email, password);
      // Redirect based on role
      if (loggedIn.role === 'candidate') navigate('/Jobs');
      else if (loggedIn.role === 'company')   navigate('/CompanyDashboard');
      else if (loggedIn.role === 'admin')     navigate('/AdminDashboard');
      else                                    navigate('/RoleSelect');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-orange-50/30 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-200 mb-4">
            <Briefcase className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">TalentHub</h1>
          <p className="text-slate-500 mt-1 text-sm">Sign in to your account</p>
        </div>

        <Card className="p-8 shadow-xl shadow-slate-200/60 border-slate-100">
          {error && (
            <div className="mb-5 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <Input
                id="login-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <Input
                id="login-password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            <Button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg gap-2"
            >
              <LogIn className="w-4 h-4" />
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/Registration" className="text-indigo-600 font-medium hover:underline">
              Register here
            </Link>
          </div>

          {/* Demo credentials hint */}
          <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-500 space-y-1">
            <p className="font-semibold text-slate-600 mb-1">Demo accounts</p>
            <p>🧑‍💼 Candidate — <span className="font-mono">candidate@example.com</span> / <span className="font-mono">pass123</span></p>
            <p>🏢 Company &nbsp;— <span className="font-mono">company@example.com</span> / <span className="font-mono">pass123</span></p>
            <p>🛡 Admin &nbsp;&nbsp;&nbsp;&nbsp;— <span className="font-mono">admin@talentsphere.com</span> / <span className="font-mono">admin123</span></p>
          </div>
        </Card>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Briefcase, LogIn, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // If already logged in, send them home
  if (user) {
    if (user.role === 'candidate') return navigate('/Jobs');
    if (user.role === 'company') return navigate('/CompanyDashboard');
    if (user.role === 'admin') return navigate('/AdminDashboard');
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
      else if (loggedIn.role === 'company') navigate('/CompanyDashboard');
      else if (loggedIn.role === 'admin') navigate('/AdminDashboard');
      else navigate('/RoleSelect');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-4">
            <Briefcase className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">TalentSphere</h1>
          <p className="text-slate-400 mt-1 text-sm">Sign in to your account</p>
        </div>

        <Card className="p-8 bg-white/5 border-white/10 backdrop-blur-xl shadow-2xl shadow-black/50">
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-800 flex items-center gap-3 shadow-sm shadow-rose-100"
            >
              <div className="shrink-0 w-8 h-8 rounded-full bg-rose-100/50 flex items-center justify-center">
                <span className="text-lg font-bold">!</span>
              </div>
              <div className="flex-1 text-sm font-medium">
                {error}
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <Input
                id="login-email"
                type="email"
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-600"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="pr-10 bg-white/5 border-white/10 text-white placeholder:text-slate-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg gap-2 bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              <LogIn className="w-4 h-4" />
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-400">
            Don't have an account?{' '}
            <Link to="/Registration" className="text-indigo-400 font-medium hover:underline">
              Register here
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

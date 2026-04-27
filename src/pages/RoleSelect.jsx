import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 as localClient } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Users, Building2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RoleSelect() {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleContinue = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      const me = await localClient.auth.me();
      if (me?.role === 'admin') {
        navigate('/AdminDashboard');
        return;
      }
      await localClient.auth.updateMe({ role: selected });
      if (selected === 'candidate') {
        navigate('/EditCandidateProfile');
      } else if (selected === 'company') {
        navigate('/EditCompanyProfile');
      }
    } catch (error) {
      console.error('Error setting role:', error);
      setLoading(false);
    }
  };

  const roles = [
    {
      id: 'candidate',
      icon: Users,
      title: "I'm a Candidate",
      desc: 'Create your profile, discover jobs, and connect with companies.',
    },
    {
      id: 'company',
      icon: Building2,
      title: "I'm a Company",
      desc: 'Post jobs, discover talent, and build your team.',
    },
  ];

  const getRoleRedirect = (role) => {
    switch (role) {
      case 'candidate':
        return '/Jobs';
      case 'company':
        return '/Candidates';
      case 'super_admin':
        return '/AdminDashboard';
      default:
        return '/Home';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-orange-50/30 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Welcome to TalentSphere</h1>
          <p className="text-slate-500 mt-2">Tell us how you'd like to use the platform</p>
        </div>

        <div className="space-y-4">
          {roles.map((role) => (
            <Card
              key={role.id}
              onClick={() => setSelected(role.id)}
              className={`p-6 cursor-pointer transition-all duration-200 ${selected === role.id
                  ? 'ring-2 ring-indigo-500 border-indigo-200 bg-indigo-50/50'
                  : 'hover:border-slate-300 hover:shadow-md'
                }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selected === role.id ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                  <role.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{role.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">{role.desc}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Button
          onClick={handleContinue}
          disabled={!selected || loading}
          className="w-full mt-6 h-12 rounded-xl gap-2"
        >
          {loading ? 'Setting up...' : 'Continue'} <ArrowRight className="w-4 h-4" />
        </Button>
      </motion.div>
    </div>
  );
}
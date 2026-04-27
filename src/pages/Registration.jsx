import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Users, Building2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Registration() {
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  const roles = [
    {
      id: 'candidate',
      icon: Users,
      title: 'Register as Candidate',
      desc: 'Create your profile and find your next opportunity.',
    },
    {
      id: 'company',
      icon: Building2,
      title: 'Register as Company',
      desc: 'Post jobs and discover top talent.',
    },
  ];

  const handleContinue = () => {
    if (selected === 'candidate') {
      navigate('/CandidateRegistration');
    } else if (selected === 'company') {
      navigate('/CompanyRegistration');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Join TalentSphere</h1>
          <p className="text-slate-400 mt-2">Choose your account type to get started</p>
        </div>

        <div className="space-y-4">
          {roles.map((role) => (
            <Card
              key={role.id}
              onClick={() => setSelected(role.id)}
              className={`p-6 cursor-pointer transition-all duration-200 bg-white/5 backdrop-blur-md border-white/10 ${selected === role.id
                  ? 'ring-2 ring-indigo-500 border-indigo-400 bg-indigo-500/10'
                  : 'hover:bg-white/10 hover:border-white/20'
                }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selected === role.id ? 'bg-indigo-500 text-white' : 'bg-white/10 text-slate-400'
                  }`}>
                  <role.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{role.title}</h3>
                  <p className="text-sm text-slate-400 mt-1">{role.desc}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Button
          onClick={handleContinue}
          disabled={!selected}
          className="w-full mt-6 h-12 rounded-xl gap-2"
        >
          Continue <ArrowRight className="w-4 h-4" />
        </Button>

        <p className="text-center text-sm text-slate-400 mt-4">
          Already have an account?{' '}
          <button onClick={() => navigate('/login')} className="text-indigo-400 hover:underline font-medium">
            Sign In
          </button>
        </p>
      </motion.div>
    </div>
  );
}
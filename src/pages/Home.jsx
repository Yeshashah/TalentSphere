import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Search, Users, Briefcase, ArrowRight, Zap, Shield, Globe, Star } from 'lucide-react';

const stats = [
  { label: 'Active Candidates', value: '10,000+' },
  { label: 'Companies Hiring', value: '500+' },
  { label: 'Jobs Posted', value: '2,500+' },
  { label: 'Placements Made', value: '1,200+' },
];

const features = [
  { icon: Search, title: 'Smart Discovery', desc: 'AI-powered matching connects the right talent with the right opportunities.' },
  { icon: Shield, title: 'Privacy Controls', desc: 'Candidates choose who sees their profile — public, companies only, or private.' },
  { icon: Zap, title: 'Instant Apply', desc: 'One-click applications with saved resumes and cover letters.' },
  { icon: Globe, title: 'Global Reach', desc: 'Access talent and opportunities from around the world, remote-first.' },
];

export default function Home() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleFindJobs = () => {
    navigate('/Jobs');
  };

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-orange-50/30" />
        <div className="absolute top-20 right-20 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-orange-200/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-medium mb-8">
              <Star className="w-4 h-4" />
              The future of talent discovery
            </div>
            <h1 className="text-5xl sm:text-7xl font-bold text-slate-900 leading-tight tracking-tight">
              Where talent
              <br />
              meets <span className="text-indigo-500">opportunity</span>
            </h1>
            <p className="text-xl text-slate-500 mt-6 max-w-xl leading-relaxed">
              A two-sided marketplace connecting exceptional candidates with innovative companies. Discover, connect, and hire — all in one place.
            </p>
            <div className="flex flex-wrap gap-4 mt-10">
              <Button onClick={handleFindJobs} disabled={loading} size="lg" className="gap-2 h-12 px-8 text-base rounded-xl">
                <Briefcase className="w-5 h-5" /> {loading ? 'Loading...' : 'Find Jobs'}
              </Button>
              <Link to="/Candidates">
                <Button variant="outline" size="lg" className="gap-2 h-12 px-8 text-base rounded-xl">
                  <Users className="w-5 h-5" /> Find Talent
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <p className="text-3xl sm:text-4xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">Built for the modern workforce</h2>
            <p className="text-slate-500 mt-3 max-w-lg mx-auto">
              Everything you need to connect talent with opportunities, powered by AI.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 border border-slate-100 hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-50 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6 text-indigo-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="relative rounded-3xl bg-gradient-to-br from-indigo-500 to-indigo-700 p-12 sm:p-16 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative max-w-xl">
              <h2 className="text-3xl sm:text-4xl font-bold text-white">Ready to get started?</h2>
              <p className="text-indigo-100 mt-4 text-lg leading-relaxed">
                Join thousands of candidates and companies already using TalentHub to find their perfect match.
              </p>
              <div className="flex flex-wrap gap-4 mt-8">
                <Link to="/RoleSelect">
                  <Button size="lg" className="bg-white text-indigo-700 hover:bg-indigo-50 gap-2 h-12 px-8 rounded-xl">
                    Create Account <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sm text-slate-400">© 2026 TalentHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
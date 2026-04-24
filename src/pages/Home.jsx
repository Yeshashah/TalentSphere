import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';
import { motion } from 'framer-motion';
import { Search, Users, Briefcase, ArrowRight, Zap, Shield, Globe, Star } from 'lucide-react';

const stats = [
  { label: 'Elite Professionals', value: '10,000+' },
  { label: 'Partner Enterprises', value: '500+' },
  { label: 'Curated Opportunities', value: '2,500+' },
  { label: 'Successful Hires', value: '1,200+' },
];

const features = [
  { icon: Search, title: 'AI-Driven Matchmaking', desc: 'Our proprietary algorithms instantly connect top-tier talent with precision-matched roles.' },
  { icon: Shield, title: 'Enterprise-Grade Privacy', desc: 'Granular visibility controls. You maintain complete ownership over who sees your credentials.' },
  { icon: Zap, title: 'Frictionless Applications', desc: 'Apply to premium roles with a single click using securely stored, dynamic profiles.' },
  { icon: Globe, title: 'Borderless Opportunities', desc: 'Access highly competitive, remote-first positions from industry-leading global organizations.' },
];

export default function Home() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleFindJobs = () => {
    navigate('/CandidateRegistration');
  };

  const handleFindTalent = async () => {
    setLoading(true);
    navigate('/Candidates');
  };

  return (
    <div className="overflow-hidden bg-slate-50 relative selection:bg-indigo-500/30">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 inset-x-0 h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100/40 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-300/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute top-[40%] left-0 w-[400px] h-[400px] bg-indigo-300/20 rounded-full blur-[80px] -translate-x-1/2 pointer-events-none" />

      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-12">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 w-full z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center text-center max-w-4xl mx-auto"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/60 backdrop-blur-md border border-indigo-100/50 text-indigo-700 text-sm font-semibold mb-10 shadow-sm ring-1 ring-indigo-50/50"
            >
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="tracking-wide uppercase text-xs">The ultimate talent ecosystem</span>
            </motion.div>
            
            <h1 className="text-6xl sm:text-8xl font-extrabold text-slate-900 leading-[1.1] tracking-tight mb-8">
              Where opportunity <br className="hidden sm:block" />
              <span className="relative whitespace-nowrap">
                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600">finds talent</span>
                <svg className="absolute -bottom-2 left-0 w-full h-4 text-indigo-200/60 -z-10" viewBox="0 0 100 20" preserveAspectRatio="none">
                  <path d="M0,10 Q50,20 100,10" fill="currentColor" />
                </svg>
              </span>
            </h1>
            
            <p className="text-lg sm:text-2xl text-slate-500 max-w-2xl leading-relaxed mb-12 font-medium">
              An exclusive, dynamic marketplace seamlessly connecting visionary professionals with industry-defining organizations.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto">
              <Button 
                onClick={handleFindJobs} 
                disabled={loading} 
                size="lg" 
                className="w-full sm:w-auto gap-3 h-14 px-10 text-lg rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/25 transition-all hover:-translate-y-1"
              >
                <Briefcase className="w-5 h-5" /> 
                {loading ? 'Initializing...' : 'Explore Roles'}
                <ArrowRight className="w-5 h-5 ml-1 opacity-70" />
              </Button>
              
              {(!user || user.role !== 'candidate') && (
                <Button 
                  onClick={handleFindTalent} 
                  variant="outline" 
                  size="lg" 
                  disabled={loading} 
                  className="w-full sm:w-auto gap-3 h-14 px-10 text-lg rounded-2xl bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 shadow-sm transition-all hover:-translate-y-1"
                >
                  <Users className="w-5 h-5 text-indigo-500" /> 
                  {loading ? 'Initializing...' : 'Hire Top Talent'}
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-20 -mt-10 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 rounded-3xl bg-white/80 backdrop-blur-xl border border-white shadow-xl shadow-slate-200/40"
          >
            {stats.map((stat, i) => (
              <div key={stat.label} className="text-center p-4">
                <p className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-slate-900 to-slate-600 mb-2">
                  {stat.value}
                </p>
                <p className="text-sm font-semibold text-slate-500 tracking-wide uppercase">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6 tracking-tight">Engineered for excellence</h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">
              A comprehensive suite of tools designed to accelerate your career or scale your team with precision.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="group relative bg-white/60 backdrop-blur-lg rounded-3xl p-8 border border-white shadow-lg shadow-slate-200/20 hover:shadow-2xl hover:shadow-indigo-500/10 hover:bg-white transition-all duration-500"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl -z-10" />
                <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                  <f.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
                <p className="text-slate-500 leading-relaxed group-hover:text-slate-600 transition-colors">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative z-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative rounded-[2.5rem] bg-slate-900 overflow-hidden shadow-2xl"
          >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/30 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-500/30 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3" />
            
            <div className="relative p-12 sm:p-20 flex flex-col md:flex-row items-center justify-between gap-12 text-center md:text-left">
              <div className="max-w-2xl">
                <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">Accelerate your journey.</h2>
                <p className="text-indigo-200 text-xl leading-relaxed">
                  Join a curated network of professionals and leading enterprises. Your next big leap forward starts right here.
                </p>
              </div>
              <div className="shrink-0 relative z-20">
                <Link to="/RoleSelect">
                  <Button size="lg" className="bg-white text-slate-900 hover:bg-indigo-50 hover:scale-105 h-16 px-10 text-lg rounded-2xl shadow-xl transition-all font-semibold gap-3">
                    Start Now <ArrowRight className="w-5 h-5 text-indigo-600" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200 bg-white relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-xl font-bold text-slate-900 tracking-tight">TalentHub<span className="text-indigo-600">.</span></div>
          <p className="text-sm font-medium text-slate-400">© 2026 TalentHub Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import {
  Briefcase, FileText, Bookmark, MessageSquare, User, Edit, ArrowRight,
  LayoutDashboard, Search, ClipboardList, CheckSquare, FileCheck
} from 'lucide-react';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import StatusBadge from '../components/shared/StatusBadge';

const SIDEBAR_LINKS = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'browse', label: 'Browse Jobs', icon: Search, href: '/Jobs' },
  { key: 'saved', label: 'Saved Jobs', icon: Bookmark, href: '/Jobs' },
  { key: 'applied', label: 'Applied Jobs', icon: ClipboardList, href: '/Jobs' },
  { key: 'messages', label: 'Messages', icon: MessageSquare, href: '/Messages' },
  { key: 'profile', label: 'Profile', icon: User, href: '/EditCandidateProfile' },
];

const STATUS_STEPS = ['applied', 'shortlisted', 'interview', 'hired'];
const statusColors = {
  applied: 'bg-blue-50 text-blue-700',
  shortlisted: 'bg-yellow-50 text-yellow-700',
  screening: 'bg-yellow-50 text-yellow-700',
  interview: 'bg-purple-50 text-purple-700',
  offer: 'bg-green-50 text-green-700',
  rejected: 'bg-red-50 text-red-700',
  hired: 'bg-emerald-50 text-emerald-700',
};

function calcProfileCompleteness(profile) {
  if (!profile) return 0;
  const fields = ['full_name', 'phone', 'location', 'job_title', 'years_of_experience', 'bio', 'resume_url', 'skills', 'education_degree'];
  const filled = fields.filter(f => {
    const v = profile[f];
    return v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && v.length === 0);
  });
  return Math.round((filled.length / fields.length) * 100);
}

function calcResumeScore(profile) {
  if (!profile) return { score: 0, breakdown: [] };

  const checks = [
    { label: 'Name & Contact',     weight: 15, pass: !!(profile.candidate_name || profile.full_name) && !!(profile.candidate_phone || profile.phone) },
    { label: 'Job Title',          weight: 10, pass: !!(profile.candidate_job_title || profile.job_title) },
    { label: 'Skills listed',      weight: 20, pass: (() => { const s = profile.candidate_skills || profile.skills; return Array.isArray(s) ? s.length > 0 : (typeof s === 'string' && s.trim().length > 0); })() },
    { label: 'Experience',         weight: 15, pass: Number(profile.candidate_years_of_experience || profile.years_of_experience || 0) > 0 },
    { label: 'Education',          weight: 10, pass: !!(profile.candidate_educational_degree || profile.education_degree) },
    { label: 'LinkedIn profile',   weight: 10, pass: !!(profile.candidate_linkedin || profile.linkedin) },
    { label: 'Portfolio / GitHub', weight: 10, pass: !!(profile.candidate_portfolio_link || profile.portfolio_link) },
    { label: 'Resume uploaded',    weight: 10, pass: !!(profile.candidate_resume || profile.resume_url) },
  ];

  const score = checks.reduce((sum, c) => sum + (c.pass ? c.weight : 0), 0);
  return { score, breakdown: checks };
}

export default function CandidateDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });

  const { data: profile, isLoading } = useQuery({
    queryKey: ['my-candidate-profile', user?.email],
    queryFn: async () => { const p = await base44.entities.CandidateProfile.filter({ user_email: user.email }); return p[0] || null; },
    enabled: !!user?.email,
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['my-applications', user?.email],
    queryFn: () => base44.entities.Application.filter({ candidate_email: user.email }, '-created_date'),
    enabled: !!user?.email,
  });

  const { data: savedJobs = [] } = useQuery({
    queryKey: ['my-saved-jobs', user?.email],
    queryFn: () => base44.entities.SavedItem.filter({ user_email: user.email, item_type: 'job' }),
    enabled: !!user?.email,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['my-unread', user?.email],
    queryFn: () => base44.entities.Message.filter({ receiver_email: user.email, read: false }),
    enabled: !!user?.email,
  });

  if (isLoading) return <LoadingSpinner />;

  const completion = calcProfileCompleteness(profile);
  const { score: resumeScore, breakdown: resumeBreakdown } = calcResumeScore(profile);

  const scoreColor = resumeScore >= 80 ? 'text-emerald-400' : resumeScore >= 50 ? 'text-amber-400' : 'text-red-400';
  const scoreRingColor = resumeScore >= 80 ? '#34d399' : resumeScore >= 50 ? '#fbbf24' : '#f87171';

  const stats = [
    { icon: FileText,  label: 'Total Applications', value: applications.length, color: 'bg-blue-50 text-blue-600' },
    { icon: Bookmark,  label: 'Saved Jobs',          value: savedJobs.length,   color: 'bg-amber-50 text-amber-600' },
    { icon: MessageSquare, label: 'Messages',        value: messages.length,    color: 'bg-emerald-50 text-emerald-600' },
    { icon: User,      label: 'Profile Completion',  value: `${completion}%`,   color: 'bg-indigo-50 text-indigo-600' },
    { icon: FileCheck, label: 'Resume Score',        value: `${resumeScore}/100`, color: resumeScore >= 80 ? 'bg-emerald-50 text-emerald-600' : resumeScore >= 50 ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-500' },
  ];

  return (
    <div className="flex h-screen bg-transparent">
      {/* Sidebar */}
      <div className="w-60 flex-shrink-0 bg-black/20 backdrop-blur-xl border-r border-white/10 flex flex-col">
        {/* Avatar */}
        <div className="p-5 border-b border-white/10 flex flex-col items-center text-center">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow mb-2" />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center mb-2">
              <User className="w-7 h-7 text-indigo-500" />
            </div>
          )}
          <p className="font-bold text-white text-sm">{profile?.full_name || user?.full_name || 'Your Name'}</p>
          <p className="text-xs text-slate-400 mt-0.5">{profile?.job_title || 'No title set'}</p>
          {profile?.open_to_work && (
            <Badge variant="default" className="mt-2 bg-green-50 text-green-700 border-green-200 text-xs">Open to Work</Badge>
          )}
          {/* Completion bar */}
          <div className="w-full mt-3">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Profile</span><span>{completion}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${completion}%` }} />
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {SIDEBAR_LINKS.map(item => {
            const isLink = !!item.href;
            const Component = isLink ? Link : 'button';
            const props = isLink ? { to: item.href } : { onClick: () => setActiveTab(item.key) };

            return (
              <Component
                key={item.key}
                {...props}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === item.key ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </Component>
            );
          })}
        </nav>
      </div>

      {/* Main */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Welcome back, {profile?.full_name?.split(' ')[0] || user?.full_name?.split(' ')[0] || 'there'}!</h1>
              <p className="text-sm text-slate-400 mt-0.5">Here's your job search overview</p>
            </div>
            <div className="flex gap-2">
              <Link to="/Jobs">
                <Button variant="outline" size="sm" className="gap-2"><Search className="w-4 h-4" /> Find Jobs</Button>
              </Link>
              <Link to="/EditCandidateProfile">
                <Button size="sm" className="gap-2 bg-indigo-600 hover:bg-indigo-700"><Edit className="w-4 h-4" /> Edit Profile</Button>
              </Link>
            </div>
          </div>

          {/* Profile completion warning */}
          {!profile && (
            <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-800">Complete your profile</p>
                <p className="text-xs text-amber-600 mt-0.5">A complete profile helps companies find you.</p>
              </div>
              <Link to="/EditCandidateProfile">
                <Button size="sm" className="bg-amber-500 hover:bg-amber-600">Complete Now</Button>
              </Link>
            </div>
          )}

          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {stats.map(s => (
              <Card key={s.label} className="p-4 bg-white/5 border-white/10 backdrop-blur-md">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color} bg-opacity-10`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
              </Card>
            ))}
          </div>

          {/* Resume Score Panel */}
          <Card className="mb-8 p-5 bg-white/5 border-white/10 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base font-semibold text-white">Resume Score</h2>
              </div>
              <span className={`text-2xl font-bold ${scoreColor}`}>{resumeScore}<span className="text-sm font-medium text-slate-500">/100</span></span>
            </div>

            {/* Score bar */}
            <div className="h-2.5 bg-white/10 rounded-full overflow-hidden mb-5">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${resumeScore}%`, backgroundColor: scoreRingColor }}
              />
            </div>

            {/* Breakdown checklist */}
            <div className="grid sm:grid-cols-2 gap-2">
              {resumeBreakdown.map(item => (
                <div key={item.label} className="flex items-center gap-2.5">
                  <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    item.pass ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-500'
                  }`}>
                    {item.pass ? '✓' : '·'}
                  </span>
                  <span className={`text-sm ${item.pass ? 'text-slate-300' : 'text-slate-500'}`}>{item.label}</span>
                  <span className="ml-auto text-xs text-slate-600">+{item.weight}</span>
                </div>
              ))}
            </div>

            {resumeScore < 80 && (
              <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                <p className="text-xs text-slate-400">Complete your profile to boost your resume score.</p>
                <a href="/EditCandidateProfile" className="text-xs text-indigo-400 hover:underline font-medium">Improve now →</a>
              </div>
            )}
          </Card>

          {/* Recent Applications */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-white">Recent Applications</h2>
            </div>
            {applications.length === 0 ? (
              <Card className="p-8 text-center bg-white/5 border-white/10 backdrop-blur-md">
                <Briefcase className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No applications yet.</p>
                <Link to="/Jobs"><Button size="sm" className="mt-3 bg-indigo-600 hover:bg-indigo-700">Start Applying</Button></Link>
              </Card>
            ) : (
              <Card className="overflow-hidden bg-white/5 border-white/10 backdrop-blur-md">
                {applications.slice(0, 6).map((app, i) => (
                  <Link key={app.id} to={`/Jobs?tab=applied&jobId=${app.job_id}`} className={`block hover:bg-white/5 transition-colors ${i < Math.min(applications.length, 6) - 1 ? 'border-b border-white/5' : ''}`}>
                    <div className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="font-medium text-white text-sm">{app.job_title}</p>
                        <p className="text-xs text-slate-500">{app.company_name}</p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[app.status] || 'bg-white/10 text-slate-400'}`}>
                        {app.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </Card>
            )}
          </div>

          {/* Saved Jobs */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-white">Saved Jobs</h2>
            </div>
            {savedJobs.length === 0 ? (
              <Card className="p-8 text-center bg-white/5 border-white/10 backdrop-blur-md">
                <Bookmark className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No saved jobs yet.</p>
              </Card>
            ) : (
              <Card className="overflow-hidden bg-white/5 border-white/10 backdrop-blur-md">
                {savedJobs.slice(0, 5).map((item, i) => (
                  <Link key={item.id} to={`/Jobs?tab=saved&jobId=${item.item_id}`}
                    className={`flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors ${i < Math.min(savedJobs.length, 5) - 1 ? 'border-b border-white/5' : ''}`}>
                    <div>
                      <p className="font-medium text-white text-sm">{item.item_title}</p>
                      <p className="text-xs text-slate-500">{item.item_subtitle}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500" />
                  </Link>
                ))}
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
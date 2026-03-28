import React, { useState, useMemo, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Briefcase, MapPin, Clock, Building2, Bookmark } from 'lucide-react';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import EmptyState from '../components/shared/EmptyState';
import JobDetailPanel from '../components/jobs/JobDetailPanel';
import { formatDistanceToNow } from 'date-fns';

const typeLabels = { full_time: 'Full-time', part_time: 'Part-time', contract: 'Contract', freelance: 'Freelance', internship: 'Internship' };
const modeLabels = { remote: 'Remote', hybrid: 'Hybrid', onsite: 'Onsite' };

const workModes = ['onsite', 'hybrid', 'remote'];
const workModeLabels = { onsite: 'Onsite', hybrid: 'Hybrid', remote: 'Remote' };

export default function Jobs() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('jobs'); // jobs | saved | applied
  const [modeFilter, setModeFilter] = useState([]);
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me().catch(() => null),
  });

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => base44.entities.Job.filter({ status: 'open' }, '-created_date'),
  });

  const { data: savedItems = [] } = useQuery({
    queryKey: ['saved-jobs', user?.email],
    queryFn: () => base44.entities.SavedItem.filter({ user_email: user.email, item_type: 'job' }, '-created_date'),
    enabled: !!user?.email,
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['my-applications', user?.email],
    queryFn: () => base44.entities.Application.filter({ candidate_email: user.email }, '-created_date'),
    enabled: !!user?.email,
  });

  const savedJobIds = new Set(savedItems.map(s => s.item_id));
  const appliedJobIds = new Set(applications.map(a => a.job_id));

  const filteredJobs = useMemo(() => {
    let list = jobs;
    if (activeTab === 'saved') list = jobs.filter(j => savedJobIds.has(j.id));
    if (activeTab === 'applied') list = jobs.filter(j => appliedJobIds.has(j.id));

    return list.filter(j => {
      const q = search.toLowerCase();
      const matchSearch = !q || j.title?.toLowerCase().includes(q) || j.company_name?.toLowerCase().includes(q) || j.skills_required?.some(s => s.toLowerCase().includes(q));
      const matchMode = modeFilter.length === 0 || modeFilter.includes(j.work_mode);
      const matchType = typeFilter === 'all' || j.employment_type === typeFilter;
      return matchSearch && matchMode && matchType;
    });
  }, [jobs, search, activeTab, modeFilter, typeFilter, savedJobIds, appliedJobIds]);

  // Select first job when list changes
  useEffect(() => {
    if (filteredJobs.length > 0 && !selectedJob) {
      setSelectedJob(filteredJobs[0]);
    }
    if (filteredJobs.length > 0 && selectedJob && !filteredJobs.find(j => j.id === selectedJob.id)) {
      setSelectedJob(filteredJobs[0]);
    }
  }, [filteredJobs]);

  const toggleMode = (m) => {
    setModeFilter(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Top bar */}
      <div className="bg-white border-b px-4 sm:px-6 py-3 flex-shrink-0">
        <div className="max-w-7xl mx-auto">
          {/* Tabs */}
          <div className="flex items-center gap-6 mb-3">
            {[
              { key: 'jobs', label: 'Jobs' },
              { key: 'saved', label: 'Saved Jobs' },
              { key: 'applied', label: 'Applied Jobs' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setSelectedJob(null); }}
                className={`text-sm font-medium pb-1 border-b-2 transition-colors ${activeTab === tab.key ? 'border-yellow-400 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search + Work mode filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search Opportunities"
                className="pl-9 h-9 rounded-lg text-sm"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {workModes.map(m => (
                <button
                  key={m}
                  onClick={() => toggleMode(m)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${modeFilter.includes(m) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}
                >
                  {workModeLabels[m]}
                </button>
              ))}
              {/* Job type filter */}
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="px-3 py-1.5 rounded-full text-xs font-medium border border-slate-200 bg-white text-slate-600 hover:border-indigo-300 cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="full_time">Full-time</option>
                <option value="part_time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="freelance">Freelance</option>
                <option value="internship">Internship</option>
              </select>
              {(modeFilter.length > 0 || typeFilter !== 'all') && (
                <button
                  onClick={() => { setModeFilter([]); setTypeFilter('all'); }}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  Clear Filter
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main split pane */}
      <div className="flex flex-1 overflow-hidden max-w-7xl mx-auto w-full">
        {/* Left: Job List */}
        <div className="w-80 flex-shrink-0 border-r bg-white overflow-y-auto">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800 text-sm">
                {activeTab === 'jobs' ? 'All Jobs' : activeTab === 'saved' ? 'Saved Jobs' : 'Applied Jobs'}
              </span>
            </div>
            <span className="text-xs text-slate-400">Showing {filteredJobs.length} Result{filteredJobs.length !== 1 ? 's' : ''}</span>
          </div>

          {isLoading ? (
            <LoadingSpinner />
          ) : filteredJobs.length === 0 ? (
            <EmptyState icon={Briefcase} title="No jobs found" description="Try adjusting your filters" />
          ) : (
            <div>
              {filteredJobs.map(job => (
                <button
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className={`w-full text-left p-4 border-b transition-colors hover:bg-slate-50 ${selectedJob?.id === job.id ? 'bg-indigo-50 border-l-2 border-l-indigo-500' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    {job.company_logo ? (
                      <img src={job.company_logo} alt="" className="w-9 h-9 rounded-lg object-cover border flex-shrink-0" />
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-4 h-4 text-indigo-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <p className="text-sm font-semibold text-slate-900 truncate leading-snug">{job.title}</p>
                        {savedJobIds.has(job.id) && <Bookmark className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0 mt-0.5 fill-indigo-500" />}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{job.company_name}</p>
                      <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-400">
                        <span className="inline-flex items-center gap-0.5"><MapPin className="w-3 h-3" />{job.location || job.work_mode && modeLabels[job.work_mode]}</span>
                      </div>
                      {job.skills_required?.length > 0 && (
                        <p className="text-xs text-slate-400 mt-1 truncate">
                          Skills: {job.skills_required.slice(0, 4).join(' · ')}
                          {job.skills_required.length > 4 ? ' ...' : ''}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Job Detail */}
        <div className="flex-1 overflow-hidden bg-white">
          {selectedJob ? (
            <JobDetailPanel key={selectedJob.id} job={selectedJob} />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400">
              <div className="text-center">
                <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Select a job to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
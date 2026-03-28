import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Briefcase } from 'lucide-react';
import JobCard from '../components/jobs/JobCard';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import EmptyState from '../components/shared/EmptyState';

export default function Jobs() {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [mode, setMode] = useState('all');

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => base44.entities.Job.filter({ status: 'open' }, '-created_date'),
  });

  const filtered = useMemo(() => {
    return jobs.filter(j => {
      const q = search.toLowerCase();
      const matchSearch = !q || j.title?.toLowerCase().includes(q) || j.company_name?.toLowerCase().includes(q) || j.location?.toLowerCase().includes(q) || j.skills_required?.some(s => s.toLowerCase().includes(q));
      const matchType = type === 'all' || j.employment_type === type;
      const matchMode = mode === 'all' || j.work_mode === mode;
      return matchSearch && matchType && matchMode;
    });
  }, [jobs, search, type, mode]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <h1 className="text-3xl font-bold text-slate-900">Job Marketplace</h1>
          <p className="text-slate-500 mt-1">Discover your next opportunity</p>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search jobs, skills, companies..."
                className="pl-10 h-11 rounded-xl"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-full sm:w-40 h-11 rounded-xl">
                <SelectValue placeholder="Job Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="full_time">Full-time</SelectItem>
                <SelectItem value="part_time">Part-time</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="freelance">Freelance</SelectItem>
                <SelectItem value="internship">Internship</SelectItem>
              </SelectContent>
            </Select>
            <Select value={mode} onValueChange={setMode}>
              <SelectTrigger className="w-full sm:w-40 h-11 rounded-xl">
                <SelectValue placeholder="Work Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modes</SelectItem>
                <SelectItem value="remote">Remote</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
                <SelectItem value="onsite">Onsite</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <p className="text-sm text-slate-500 mb-4">{filtered.length} job{filtered.length !== 1 ? 's' : ''} found</p>
        {isLoading ? (
          <LoadingSpinner />
        ) : filtered.length === 0 ? (
          <EmptyState icon={Briefcase} title="No jobs found" description="Try adjusting your search or filters" />
        ) : (
          <div className="space-y-3">
            {filtered.map(job => <JobCard key={job.id} job={job} />)}
          </div>
        )}
      </div>
    </div>
  );
}
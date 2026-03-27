import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Search, Briefcase } from 'lucide-react';
import JobCard from '../components/jobs/JobCard';
import JobFilters from '../components/jobs/JobFilters';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import EmptyState from '../components/shared/EmptyState';

export default function Jobs() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => base44.entities.Job.filter({ status: 'open' }, '-created_date'),
  });

  const filtered = useMemo(() => {
    return jobs.filter(j => {
      const q = search.toLowerCase();
      const matchSearch = !q || j.title?.toLowerCase().includes(q) || j.company_name?.toLowerCase().includes(q) || j.location?.toLowerCase().includes(q) || j.skills_required?.some(s => s.toLowerCase().includes(q));
      const matchWorkMode = !filters.workModes?.length || filters.workModes.some(m => j.work_mode?.toLowerCase() === m.toLowerCase());
      const matchExperience = !filters.experience?.length || filters.experience.some(exp => {
        if (exp === '0-2 years') return j.experience_required <= 2;
        if (exp === '3-5 years') return j.experience_required >= 3 && j.experience_required <= 5;
        if (exp === '6-10 years') return j.experience_required >= 6 && j.experience_required <= 10;
        if (exp === '10+ years') return j.experience_required >= 10;
      });
      const matchTeamSize = !filters.teamSizes?.length || true; // Team size not in Job entity
      const matchRole = !filters.roles?.length || filters.roles.some(r => j.title?.toLowerCase().includes(r.toLowerCase()));
      const matchIndustry = !filters.industries?.length || j.industry && filters.industries.some(ind => j.industry?.toLowerCase() === ind.toLowerCase());
      const matchSkills = !filters.skills?.length || filters.skills.some(s => j.skills_required?.some(js => js.toLowerCase() === s.toLowerCase()));
      const matchSalary = (!filters.salaryMin && !filters.salaryMax) || ((!filters.salaryMin || j.salary_min >= filters.salaryMin * 1000) && (!filters.salaryMax || j.salary_max <= filters.salaryMax * 1000));
      return matchSearch && matchWorkMode && matchExperience && matchTeamSize && matchRole && matchIndustry && matchSkills && matchSalary;
    });
  }, [jobs, search, filters]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <h1 className="text-3xl font-bold text-slate-900">Job Marketplace</h1>
          <p className="text-slate-500 mt-1">Discover your next opportunity</p>

          <div className="mt-6">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search jobs, skills, companies..."
                className="pl-10 h-11 rounded-xl"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <JobFilters onFilterChange={setFilters} />
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
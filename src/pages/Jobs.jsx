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
  const [selectedJobId, setSelectedJobId] = useState(null);

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
      const matchTeamSize = !filters.teamSizes?.length || true;
      const matchRole = !filters.roles?.length || filters.roles.some(r => j.title?.toLowerCase().includes(r.toLowerCase()));
      const matchIndustry = !filters.industries?.length || j.industry && filters.industries.some(ind => j.industry?.toLowerCase() === ind.toLowerCase());
      const matchSkills = !filters.skills?.length || filters.skills.some(s => j.skills_required?.some(js => js.toLowerCase() === s.toLowerCase()));
      const matchSalary = (!filters.salaryMin && !filters.salaryMax) || ((!filters.salaryMin || j.salary_min >= filters.salaryMin * 1000) && (!filters.salaryMax || j.salary_max <= filters.salaryMax * 1000));
      return matchSearch && matchWorkMode && matchExperience && matchTeamSize && matchRole && matchIndustry && matchSkills && matchSalary;
    });
  }, [jobs, search, filters]);

  const selectedJob = filtered.find(j => j.id === selectedJobId) || filtered[0];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-full px-4 sm:px-6 py-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Job Marketplace</h1>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search jobs, skills, companies..."
              className="pl-10 h-11 rounded-xl max-w-md"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <JobFilters onFilterChange={setFilters} />
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="flex gap-6 max-w-7xl mx-auto px-4 sm:px-6 py-8 min-h-[calc(100vh-250px)]">
        {/* Left Column - Job List */}
        <div className="w-80 flex-shrink-0">
          <p className="text-sm text-slate-500 mb-4">{filtered.length} job{filtered.length !== 1 ? 's' : ''} found</p>
          {isLoading ? (
            <LoadingSpinner />
          ) : filtered.length === 0 ? (
            <EmptyState icon={Briefcase} title="No jobs found" description="Try adjusting your search or filters" />
          ) : (
            <div className="space-y-2 pr-2 max-h-[calc(100vh-300px)] overflow-y-auto">
              {filtered.map(job => (
                <div
                  key={job.id}
                  onClick={() => setSelectedJobId(job.id)}
                  className={`p-4 rounded-lg cursor-pointer transition-all ${
                    selectedJobId === job.id
                      ? 'bg-indigo-50 border-2 border-indigo-500 shadow-md'
                      : 'bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-sm'
                  }`}
                >
                  <h3 className="font-semibold text-slate-900 text-sm mb-1">{job.title}</h3>
                  <p className="text-xs text-slate-500 mb-2">{job.company_name}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>📍 {job.location}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column - Job Details */}
        <div className="flex-1">
          {selectedJob ? (
            <div className="bg-white rounded-lg p-8 shadow-sm border border-slate-200">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">{selectedJob.title}</h1>
                <p className="text-lg text-slate-600">{selectedJob.company_name}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8 pb-8 border-b">
                {selectedJob.location && <div><p className="text-xs text-slate-500 uppercase">Location</p><p className="text-sm font-medium text-slate-900">{selectedJob.location}</p></div>}
                {selectedJob.work_mode && <div><p className="text-xs text-slate-500 uppercase">Work Mode</p><p className="text-sm font-medium text-slate-900 capitalize">{selectedJob.work_mode}</p></div>}
                {selectedJob.employment_type && <div><p className="text-xs text-slate-500 uppercase">Type</p><p className="text-sm font-medium text-slate-900 capitalize">{selectedJob.employment_type.replace('_', ' ')}</p></div>}
                {selectedJob.experience_required != null && <div><p className="text-xs text-slate-500 uppercase">Experience</p><p className="text-sm font-medium text-slate-900">{selectedJob.experience_required} years</p></div>}
              </div>

              {selectedJob.description && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-slate-900 mb-2">About This Role</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{selectedJob.description}</p>
                </div>
              )}

              {selectedJob.responsibilities && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-slate-900 mb-2">Responsibilities</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{selectedJob.responsibilities}</p>
                </div>
              )}

              {selectedJob.requirements && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-slate-900 mb-2">Requirements</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{selectedJob.requirements}</p>
                </div>
              )}

              {selectedJob.skills_required?.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.skills_required.map(skill => (
                      <span key={skill} className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {(selectedJob.salary_min || selectedJob.salary_max) && (
                <div className="mb-8 pb-8 border-b">
                  <p className="text-xs text-slate-500 uppercase">Salary Range</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    ${selectedJob.salary_min ? (selectedJob.salary_min / 1000).toFixed(0) : '0'}K - ${selectedJob.salary_max ? (selectedJob.salary_max / 1000).toFixed(0) : '0'}K
                  </p>
                </div>
              )}

              <button className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
                Apply Now
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center h-96 text-center">
              <p className="text-slate-500">Select a job to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
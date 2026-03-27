import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Users, ChevronLeft, ChevronRight, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CandidateCard from '../components/candidates/CandidateCard';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import EmptyState from '../components/shared/EmptyState';
import CandidateFilters from '../components/candidates/CandidateFilters';

export default function Candidates() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    search: '',
    titles: [],
    locations: [],
    industries: [],
    skills: [],
    experience: []
  });
  const [page, setPage] = useState(0);
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const pageSize = 12;

  const { data: result = { candidates: [], total: 0 }, isLoading, error } = useQuery({
    queryKey: ['candidates-db', filters, page],
    queryFn: async () => {
      const query = {};

      if (filters.search) {
        query.$or = [
        { full_name: { $regex: filters.search, $options: 'i' } },
        { job_title: { $regex: filters.search, $options: 'i' } },
        { location: { $regex: filters.search, $options: 'i' } },
        { industry: { $regex: filters.search, $options: 'i' } },
        { skills: { $in: [filters.search] } }];

      }

      if (filters.titles.length > 0) {
        query.job_title = { $in: filters.titles };
      }

      if (filters.locations.length > 0) {
        query.location = { $in: filters.locations };
      }

      if (filters.industries.length > 0) {
        query.industry = { $in: filters.industries };
      }

      if (filters.skills.length > 0) {
        query.skills = { $in: filters.skills };
      }

      if (filters.experience.length > 0) {
        const expRanges = filters.experience.map((exp) => {
          if (exp === '0-2 years') return { years_of_experience: { $lte: 2 } };
          if (exp === '3-5 years') return { years_of_experience: { $gte: 3, $lte: 5 } };
          if (exp === '6-10 years') return { years_of_experience: { $gte: 6, $lte: 10 } };
          if (exp === '10+ years') return { years_of_experience: { $gte: 10 } };
        }).filter(Boolean);
        if (expRanges.length > 0) {
          query.$or = query.$or ? [...query.$or, ...expRanges] : expRanges;
        }
      }

      const candidates = await base44.entities.CandidateProfile.filter(query, '-created_date', pageSize, page * pageSize);
      return { candidates, total: candidates.length };
    }
  });

  const candidates = result.candidates || [];
  const selectedCandidate = candidates.find(c => c.id === selectedCandidateId) || candidates[0];
  const availabilityLabels = {
    immediate: 'Immediate', '2_weeks': '2 weeks', '1_month': '1 month',
    '2_months': '2 months', '3_months_plus': '3+ months'
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-full px-4 sm:px-6 py-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-slate-900">Find Candidates</h1>
            <Button onClick={() => navigate('/SavedCandidates')} variant="outline" className="gap-2">
              <Bookmark className="w-4 h-4" /> View Saved
            </Button>
          </div>
          <CandidateFilters onFilterChange={(newFilters) => {
            setFilters(newFilters);
            setPage(0);
            setSelectedCandidateId(null);
          }} />
        </div>
      </div>

      <div className="flex gap-6 max-w-7xl mx-auto px-4 sm:px-6 py-8 min-h-[calc(100vh-250px)]">
        <div className="w-80 flex-shrink-0">
          <p className="text-sm text-slate-500 mb-4">{candidates.length} candidate{candidates.length !== 1 ? 's' : ''} found</p>
          {isLoading ? (
            <LoadingSpinner />
          ) : error ? (
            <div className="text-center py-12 text-red-500">
              <p className="font-medium">Failed to load candidates</p>
              <p className="text-sm mt-1">{error.message}</p>
            </div>
          ) : candidates.length === 0 ? (
            <EmptyState icon={Users} title="No candidates found" description="Try adjusting your search or filters" />
          ) : (
            <div className="space-y-2 pr-2 max-h-[calc(100vh-300px)] overflow-y-auto">
              {candidates.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedCandidateId(c.id)}
                  className={`p-4 rounded-lg cursor-pointer transition-all ${
                    selectedCandidateId === c.id
                      ? 'bg-indigo-50 border-2 border-indigo-500 shadow-md'
                      : 'bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-sm'
                  }`}
                >
                  <h3 className="font-semibold text-slate-900 text-sm mb-1">{c.full_name}</h3>
                  <p className="text-xs text-slate-500 mb-2">{c.job_title}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>📍 {c.location}</span>
                  </div>
                </div>
              ))}
              {candidates.length >= pageSize && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-xs text-slate-600">Page {page + 1}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={candidates.length < pageSize}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex-1">
          {selectedCandidate ? (
            <div className="bg-white rounded-lg p-8 shadow-sm border border-slate-200">
              <div className="flex items-start gap-6 mb-8 pb-8 border-b">
                {selectedCandidate.avatar_url ? (
                  <img src={selectedCandidate.avatar_url} alt="" className="w-24 h-24 rounded-xl object-cover border-2 border-white shadow" />
                ) : (
                  <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center flex-shrink-0">
                    <Users className="w-12 h-12 text-indigo-500" />
                  </div>
                )}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-slate-900 mb-1">{selectedCandidate.full_name}</h1>
                  <p className="text-lg text-slate-600 mb-4">{selectedCandidate.job_title}</p>
                  <div className="flex flex-wrap gap-4">
                    {selectedCandidate.location && <span className="text-sm text-slate-600">📍 {selectedCandidate.location}</span>}
                    {selectedCandidate.years_of_experience != null && <span className="text-sm text-slate-600">💼 {selectedCandidate.years_of_experience} years exp</span>}
                    {selectedCandidate.expected_salary && <span className="text-sm text-slate-600">💰 ${(selectedCandidate.expected_salary/1000).toFixed(0)}k</span>}
                  </div>
                </div>
              </div>

              {selectedCandidate.bio && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-slate-900 mb-2">About</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{selectedCandidate.bio}</p>
                </div>
              )}

              {selectedCandidate.skills?.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCandidate.skills.map(s => (
                      <span key={s} className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {selectedCandidate.tech_stack?.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">Tech Stack</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCandidate.tech_stack.map(s => (
                      <span key={s} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-6 mb-8 pb-8 border-t pt-8">
                {selectedCandidate.education_degree && (
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold">Education</p>
                    <p className="text-sm font-medium text-slate-900 mt-1">{selectedCandidate.education_degree}</p>
                    {selectedCandidate.education_university && <p className="text-xs text-slate-500 mt-1">{selectedCandidate.education_university}</p>}
                  </div>
                )}
                {selectedCandidate.availability && (
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold">Availability</p>
                    <p className="text-sm font-medium text-slate-900 mt-1">{availabilityLabels[selectedCandidate.availability]}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
                  Contact Candidate
                </button>
                <button className="px-4 py-3 border border-slate-300 rounded-lg font-semibold hover:bg-slate-50 transition-colors">
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-96 text-center">
              <p className="text-slate-500">Select a candidate to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
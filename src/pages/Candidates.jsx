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

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-slate-900">Find Candidates</h1>
            <Button onClick={() => navigate('/SavedCandidates')} variant="outline" className="gap-2">
              <Bookmark className="w-4 h-4" /> View Saved
            </Button>
          </div>
          <div className="mt-6">
            <CandidateFilters onFilterChange={(newFilters) => {
              setFilters(newFilters);
              setPage(0);
            }} />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <p className="text-sm text-slate-500 mb-4">{candidates.length} candidate{candidates.length !== 1 ? 's' : ''} found</p>
        {isLoading ?
        <LoadingSpinner /> :
        error ?
        <div className="text-center py-12 text-red-500">
            <p className="font-medium">Failed to load candidates</p>
            <p className="text-sm mt-1">{error.message}</p>
          </div> :
        candidates.length === 0 ?
        <EmptyState icon={Users} title="No candidates found" description="Try adjusting your search or filters" /> :

        <>
            <div className="space-y-3 mb-6">
              {candidates.map((c) => <CandidateCard key={c.id} candidate={c} />)}
            </div>
            <div className="flex items-center justify-center gap-2">
              <Button
              variant="outline"
              size="icon"
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}>
              
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-slate-600">Page {page + 1}</span>
              <Button
              variant="outline"
              size="icon"
              onClick={() => setPage(page + 1)}
              disabled={candidates.length < pageSize}>
              
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </>
        }
      </div>
    </div>);

}
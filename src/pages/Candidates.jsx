import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CandidateCard from '../components/candidates/CandidateCard';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import EmptyState from '../components/shared/EmptyState';

export default function Candidates() {
  const [search, setSearch] = useState('');
  const [availability, setAvailability] = useState('all');
  const [experience, setExperience] = useState('all');
  const [page, setPage] = useState(0);
  const pageSize = 12;

  const { data: result = { candidates: [], total: 0 }, isLoading, error } = useQuery({
    queryKey: ['candidates-db', search, availability, experience, page],
    queryFn: async () => {
      const query = {};

      if (search) {
        const q = search.toLowerCase();
        query.$or = [
          { full_name: { $regex: search, $options: 'i' } },
          { job_title: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } },
          { industry: { $regex: search, $options: 'i' } },
          { skills: { $in: [search] } }
        ];
      }

      if (availability !== 'all') {
        query.availability = availability;
      }

      if (experience !== 'all') {
        if (experience === '0-2') query.years_of_experience = { $lte: 2 };
        else if (experience === '3-5') query.years_of_experience = { $gte: 3, $lte: 5 };
        else if (experience === '6-10') query.years_of_experience = { $gte: 6, $lte: 10 };
        else if (experience === '10+') query.years_of_experience = { $gte: 10 };
      }

      const candidates = await base44.entities.CandidateProfile.filter(query, '-created_date', pageSize, page * pageSize);
      return { candidates, total: candidates.length };
    },
  });

  const candidates = result.candidates || [];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <h1 className="text-3xl font-bold text-slate-900">Talent Marketplace</h1>
          <p className="text-slate-500 mt-1">Discover exceptional candidates</p>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by name, title, skills, location..."
                className="pl-10 h-11 rounded-xl"
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
              />
            </div>
            <Select value={availability} onValueChange={(val) => {
              setAvailability(val);
              setPage(0);
            }}>
              <SelectTrigger className="w-full sm:w-44 h-11 rounded-xl">
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Availability</SelectItem>
                <SelectItem value="immediate">Immediate</SelectItem>
                <SelectItem value="2_weeks">2 weeks</SelectItem>
                <SelectItem value="1_month">1 month</SelectItem>
                <SelectItem value="2_months">2 months</SelectItem>
                <SelectItem value="3_months_plus">3+ months</SelectItem>
              </SelectContent>
            </Select>
            <Select value={experience} onValueChange={(val) => {
              setExperience(val);
              setPage(0);
            }}>
              <SelectTrigger className="w-full sm:w-44 h-11 rounded-xl">
                <SelectValue placeholder="Experience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Experience</SelectItem>
                <SelectItem value="0-2">0-2 years</SelectItem>
                <SelectItem value="3-5">3-5 years</SelectItem>
                <SelectItem value="6-10">6-10 years</SelectItem>
                <SelectItem value="10+">10+ years</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
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
          <>
            <div className="space-y-3 mb-6">
              {candidates.map(c => <CandidateCard key={c.id} candidate={c} />)}
            </div>
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-slate-600">Page {page + 1}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage(page + 1)}
                disabled={candidates.length < pageSize}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
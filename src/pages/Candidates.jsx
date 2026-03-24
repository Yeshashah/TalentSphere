import React, { useState, useMemo } from 'react';
import { fetchCrustCandidates } from '@/lib/crustdata-api';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Users } from 'lucide-react';
import CandidateCard from '../components/candidates/CandidateCard';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import EmptyState from '../components/shared/EmptyState';

export default function Candidates() {
  const [search, setSearch] = useState('');
  const [availability, setAvailability] = useState('all');
  const [experience, setExperience] = useState('all');

  const { data: candidates = [], isLoading, error } = useQuery({
    queryKey: ['candidates-public'],
    queryFn: () => fetchCrustCandidates(),
  });

  const visible = useMemo(() => {
    return candidates.filter(c => c.visibility !== 'private');
  }, [candidates]);

  const filtered = useMemo(() => {
    return visible.filter(c => {
      const q = search.toLowerCase();
      const matchSearch = !q || c.full_name?.toLowerCase().includes(q) || c.job_title?.toLowerCase().includes(q) || c.location?.toLowerCase().includes(q) || c.skills?.some(s => s.toLowerCase().includes(q));
      const matchAvail = availability === 'all' || c.availability === availability;
      const matchExp = experience === 'all' || 
        (experience === '0-2' && (c.years_of_experience || 0) <= 2) ||
        (experience === '3-5' && c.years_of_experience >= 3 && c.years_of_experience <= 5) ||
        (experience === '6-10' && c.years_of_experience >= 6 && c.years_of_experience <= 10) ||
        (experience === '10+' && c.years_of_experience > 10);
      return matchSearch && matchAvail && matchExp;
    });
  }, [visible, search, availability, experience]);

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
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <Select value={availability} onValueChange={setAvailability}>
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
            <Select value={experience} onValueChange={setExperience}>
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
        <p className="text-sm text-slate-500 mb-4">{filtered.length} candidate{filtered.length !== 1 ? 's' : ''} found</p>
        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="text-center py-12 text-red-500">
            <p className="font-medium">Failed to load candidates</p>
            <p className="text-sm mt-1">{error.message}</p>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Users} title="No candidates found" description="Try adjusting your search or filters" />
        ) : (
          <div className="space-y-3">
            {filtered.map(c => <CandidateCard key={c.id} candidate={c} />)}
          </div>
        )}
      </div>
    </div>
  );
}
import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Users, Search, MapPin, Briefcase, User, ChevronLeft, ChevronRight, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CandidateDetailPanel from '../components/candidates/CandidateDetailPanel';
import CandidateFilters from '../components/candidates/CandidateFilters';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import EmptyState from '../components/shared/EmptyState';



export default function Candidates() {
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(0);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const pageSize = 20;

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me().catch(() => null),
  });

  const { data: savedItems = [] } = useQuery({
    queryKey: ['saved-candidates', user?.email],
    queryFn: () => base44.entities.SavedItem.filter({ user_email: user.email, item_type: 'candidate' }, '-created_date'),
    enabled: !!user?.email,
  });
  const savedCandidateIds = new Set(savedItems.map(s => s.item_id));

  const { data: candidates = [], isLoading } = useQuery({
    queryKey: ['candidates-db', page],
    queryFn: () => base44.entities.CandidateProfile.filter({}, '-created_date', pageSize, page * pageSize),
  });

  const filtered = useMemo(() => {
    let list = Array.isArray(candidates) ? candidates : [];
    if (activeTab === 'saved') list = list.filter(c => savedCandidateIds.has(c.id));

    // Name filter
    if (filters.name) {
      const q = filters.name.toLowerCase();
      list = list.filter(c => c.full_name?.toLowerCase().includes(q));
    }
    // Designation filter
    if (filters.designation) {
      const q = filters.designation.toLowerCase();
      list = list.filter(c => c.job_title?.toLowerCase().includes(q));
    }
    // General search
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.full_name?.toLowerCase().includes(q) ||
        c.job_title?.toLowerCase().includes(q) ||
        c.location?.toLowerCase().includes(q) ||
        c.skills?.some(s => s.toLowerCase().includes(q))
      );
    }
    // Experience filter
    if (filters.expRanges?.length > 0) {
      list = list.filter(c => filters.expRanges.some(r => {
        const exp = c.years_of_experience;
        if (r === '10+') return exp > 10;
        const [lo, hi] = r.split('-').map(Number);
        return exp >= lo && exp <= hi;
      }));
    }
    // Company (bio/resume search approximation)
    if (filters.company) {
      const q = filters.company.toLowerCase();
      list = list.filter(c => c.resume_parsed_data?.toLowerCase().includes(q) || c.bio?.toLowerCase().includes(q));
    }
    // Skills filter
    if (filters.skills) {
      const skillList = filters.skills.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
      list = list.filter(c => skillList.some(sk => c.skills?.some(cs => cs.toLowerCase().includes(sk)) || c.tech_stack?.some(cs => cs.toLowerCase().includes(sk))));
    }
    // Education filter
    if (filters.education?.length > 0) {
      list = list.filter(c => filters.education.some(e => c.education_degree?.toLowerCase().includes(e.toLowerCase())));
    }
    // Open to Work filter
    if (filters.openToWork) {
      list = list.filter(c => c.open_to_work === true);
    }
    // Location filter
    if (filters.location) {
      const q = filters.location.toLowerCase();
      list = list.filter(c => c.location?.toLowerCase().includes(q));
    }
    return list;
  }, [candidates, search, activeTab, filters, savedCandidateIds]);

  useEffect(() => {
    if (filtered.length > 0 && !selectedCandidate) {
      setSelectedCandidate(filtered[0]);
    } else if (filtered.length > 0 && selectedCandidate && !filtered.find(c => c.id === selectedCandidate.id)) {
      setSelectedCandidate(filtered[0]);
    }
  }, [filtered, selectedCandidate]);



  return (
    <div className="flex flex-col h-screen bg-transparent">
      {/* Top bar */}
      <div className="bg-white/5 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 py-3 flex-shrink-0">
        <div className="max-w-7xl mx-auto">
          {/* Tabs */}
          <div className="flex items-center gap-6 mb-3">
            {[
              { key: 'all', label: 'All Candidates' },
              { key: 'saved', label: 'Saved Candidates' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setSelectedCandidate(null); }}
                className={`text-sm font-medium pb-1 border-b-2 transition-colors ${activeTab === tab.key ? 'border-indigo-400 text-white' : 'border-transparent text-slate-400 hover:text-white'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search + Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by name, title, skills..."
                className="pl-9 h-9 rounded-lg text-sm bg-white/5 border-white/10 text-white"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

          </div>
        </div>
      </div>

      {/* Split pane */}
      <div className="flex flex-1 overflow-hidden max-w-7xl mx-auto w-full">
        {/* Filter sidebar */}
        <CandidateFilters filters={filters} onChange={setFilters} />
        {/* Left: Candidate List */}
        <div className="w-80 flex-shrink-0 border-r border-white/10 bg-white/5 backdrop-blur-md overflow-y-auto flex flex-col">
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between flex-shrink-0">
            <span className="font-semibold text-white text-sm">
              {activeTab === 'saved' ? 'Saved Candidates' : 'All Candidates'}
            </span>
            <span className="text-xs text-slate-400">{filtered.length} Result{filtered.length !== 1 ? 's' : ''}</span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <LoadingSpinner />
            ) : filtered.length === 0 ? (
              <EmptyState icon={Users} title="No candidates found" description="Try adjusting your filters" />
            ) : (
              filtered.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCandidate(c)}
                  className={`w-full text-left p-4 border-b border-white/5 transition-colors hover:bg-white/5 ${selectedCandidate?.id === c.id ? 'bg-white/10' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    {c.avatar_url ? (
                      <img src={c.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover border flex-shrink-0" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-indigo-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <p className="text-sm font-semibold text-white truncate leading-snug">{c.full_name}</p>
                        {savedCandidateIds.has(c.id) && <Bookmark className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5 fill-indigo-400" />}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{c.job_title}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                        {c.location && <span className="inline-flex items-center gap-0.5"><MapPin className="w-3 h-3" />{c.location}</span>}
                        {c.years_of_experience != null && <span className="inline-flex items-center gap-0.5"><Briefcase className="w-3 h-3" />{c.years_of_experience}y</span>}
                      </div>
                      {c.skills?.length > 0 && (
                        <p className="text-xs text-slate-400 mt-1 truncate">
                          Skills: {c.skills.slice(0, 3).join(' · ')}{c.skills.length > 3 ? ' ...' : ''}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Pagination */}
          {!isLoading && filtered.length > 0 && activeTab === 'all' && (
            <div className="flex items-center justify-center gap-2 p-3 border-t border-white/10 flex-shrink-0">
              <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-white" onClick={() => { setPage(Math.max(0, page - 1)); setSelectedCandidate(null); }} disabled={page === 0}>
                <ChevronLeft className="w-3 h-3" />
              </Button>
              <span className="text-xs text-slate-500">Page {page + 1}</span>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-white" onClick={() => { setPage(page + 1); setSelectedCandidate(null); }} disabled={candidates.length < pageSize}>
                <ChevronRight className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>

        {/* Right: Detail */}
        <div className="flex-1 overflow-hidden bg-white/5 backdrop-blur-md">
          {selectedCandidate ? (
            <CandidateDetailPanel key={selectedCandidate.id} candidate={selectedCandidate} />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500">
              <div className="text-center">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Select a candidate to view profile</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
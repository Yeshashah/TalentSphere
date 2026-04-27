import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Users, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CandidateCard from '../components/candidates/CandidateCard';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import EmptyState from '../components/shared/EmptyState';

export default function SavedCandidates() {
  const navigate = useNavigate();

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me().catch(() => null),
  });

  const { data: savedItems = [], isLoading } = useQuery({
    queryKey: ['saved-candidates', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.SavedItem.filter({
        user_email: user.email,
        item_type: 'candidate',
      }, '-created_date');
    },
    enabled: !!user?.email,
  });

  const { data: candidates = [] } = useQuery({
    queryKey: ['saved-candidates-data', savedItems],
    queryFn: async () => {
      if (savedItems.length === 0) return [];
      const candidateIds = savedItems.map(item => item.item_id);
      const allCandidates = await Promise.all(
        candidateIds.map(id =>
          base44.entities.CandidateProfile.filter({ id }).then(c => c[0])
        )
      );
      const filtered = allCandidates.filter(Boolean);
      const seen = new Set();
      return filtered.filter(c => {
        if (seen.has(c.id)) return false;
        seen.add(c.id);
        return true;
      });
    },
    enabled: savedItems.length > 0,
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-transparent">
      <div className="bg-white/5 backdrop-blur-md border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <Button variant="ghost" size="sm" className="mb-4 gap-2 text-slate-400 hover:text-white" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <h1 className="text-3xl font-bold text-white">Saved Candidates</h1>
          <p className="text-slate-400 mt-1">Your collection of favorite candidates</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <p className="text-sm text-slate-400 mb-4">{candidates.length} candidate{candidates.length !== 1 ? 's' : ''} saved</p>
        {candidates.length === 0 ? (
          <EmptyState icon={Users} title="No saved candidates yet" description="Save candidates to view them here" />
        ) : (
          <div className="space-y-3">
            {candidates.map(c => <CandidateCard key={c.id} candidate={c} />)}
          </div>
        )}
      </div>
    </div>
  );
}
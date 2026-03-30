import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Lock, ArrowLeft } from 'lucide-react';

export default function Forbidden() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">403</h1>
        <h2 className="text-xl font-semibold text-slate-700 mb-2">Access Denied</h2>
        <p className="text-slate-500 mb-6">You don't have permission to access this resource.</p>
        <Button onClick={() => navigate(-1)} variant="outline" className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Go Back
        </Button>
      </div>
    </div>
  );
}
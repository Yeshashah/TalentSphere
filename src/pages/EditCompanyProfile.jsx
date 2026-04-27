import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { Save, Upload } from 'lucide-react';
import LoadingSpinner from '../components/shared/LoadingSpinner';

export default function EditCompanyProfile() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({});

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const { data: existing, isLoading } = useQuery({
    queryKey: ['my-company-profile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.CompanyProfile.filter({ user_email: user.email });
      return profiles[0] || null;
    },
    enabled: !!user?.email,
  });

  useEffect(() => {
    if (existing) setForm(existing);
    else if (user) setForm({ user_email: user.email, recruiter_name: user.full_name || '', recruiter_email: user.email, subscription_plan: 'free' });
  }, [existing, user]);

  const mutation = useMutation({
    mutationFn: async (data) => {
      if (existing) return base44.entities.CompanyProfile.update(existing.id, data);
      return base44.entities.CompanyProfile.create(data);
    },
    onSuccess: () => {
      toast({ title: 'Company profile saved!' });
      queryClient.invalidateQueries({ queryKey: ['my-company-profile'] });
      navigate('/CompanyDashboard');
    },
  });

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, logo_url: file_url }));
    toast({ title: 'Logo uploaded!' });
  };

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }));

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-transparent py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <h1 className="text-2xl font-bold text-white mb-6">Company Profile</h1>

        <div className="space-y-6">
          <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-md">
            <h2 className="text-lg font-semibold text-white mb-4">Company Info</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label className="text-slate-300">Company Name</Label><Input className="bg-white/5 border-white/10 text-white" value={form.company_name || ''} onChange={e => update('company_name', e.target.value)} /></div>
              <div><Label className="text-slate-300">Industry</Label><Input className="bg-white/5 border-white/10 text-white" value={form.industry || ''} onChange={e => update('industry', e.target.value)} /></div>
              <div>
                <Label className="text-slate-300">Company Size</Label>
                <Select value={form.company_size || ''} onValueChange={v => update('company_size', v)}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10 text-white">
                    <SelectItem value="1-10">1-10</SelectItem>
                    <SelectItem value="11-50">11-50</SelectItem>
                    <SelectItem value="51-200">51-200</SelectItem>
                    <SelectItem value="201-500">201-500</SelectItem>
                    <SelectItem value="501-1000">501-1000</SelectItem>
                    <SelectItem value="1000+">1000+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label className="text-slate-300">Website</Label><Input className="bg-white/5 border-white/10 text-white" value={form.website || ''} onChange={e => update('website', e.target.value)} placeholder="https://..." /></div>
              <div className="sm:col-span-2"><Label className="text-slate-300">Headquarters</Label><Input className="bg-white/5 border-white/10 text-white" value={form.headquarters || ''} onChange={e => update('headquarters', e.target.value)} /></div>
              <div className="sm:col-span-2"><Label className="text-slate-300">Description</Label><Textarea className="bg-white/5 border-white/10 text-white" value={form.description || ''} onChange={e => update('description', e.target.value)} /></div>
              <div>
                <Label className="text-slate-300">Logo</Label>
                <div className="flex items-center gap-3 mt-1">
                  {form.logo_url && <img src={form.logo_url} alt="" className="w-12 h-12 rounded-xl object-cover border border-white/10" />}
                  <label className="cursor-pointer">
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                    <Button variant="outline" size="sm" className="gap-2 border-white/10 text-white hover:bg-white/10" asChild><span><Upload className="w-4 h-4" /> Upload</span></Button>
                  </label>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-md">
            <h2 className="text-lg font-semibold text-white mb-4">Recruiter Info</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label className="text-slate-300">Recruiter Name</Label><Input className="bg-white/5 border-white/10 text-white" value={form.recruiter_name || ''} onChange={e => update('recruiter_name', e.target.value)} /></div>
              <div><Label className="text-slate-300">Recruiter Email</Label><Input className="bg-white/5 border-white/10 text-white" value={form.recruiter_email || ''} onChange={e => update('recruiter_email', e.target.value)} /></div>
              <div><Label className="text-slate-300">Recruiter Role</Label><Input className="bg-white/5 border-white/10 text-white" value={form.recruiter_role || ''} onChange={e => update('recruiter_role', e.target.value)} placeholder="e.g., Head of Talent" /></div>
            </div>
          </Card>

          <Button onClick={() => mutation.mutate(form)} disabled={mutation.isPending} className="w-full h-12 rounded-xl gap-2">
            <Save className="w-4 h-4" /> {mutation.isPending ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </div>
    </div>
  );
}
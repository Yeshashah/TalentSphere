import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { Save } from 'lucide-react';

export default function PostJob() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ skills_required: [], status: 'open' });
  const [skillInput, setSkillInput] = useState('');

  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });

  const { data: company } = useQuery({
    queryKey: ['my-company-profile', user?.email],
    queryFn: async () => {
      const c = await base44.entities.CompanyProfile.filter({ user_email: user.email });
      return c[0] || null;
    },
    enabled: !!user?.email,
  });

  // Check if editing
  const jobId = new URLSearchParams(window.location.search).get('id');

  const { data: existingJob } = useQuery({
    queryKey: ['edit-job', jobId],
    queryFn: async () => {
      const jobs = await base44.entities.Job.filter({ id: jobId });
      return jobs[0] || null;
    },
    enabled: !!jobId,
  });

  useEffect(() => {
    if (existingJob) setForm(existingJob);
  }, [existingJob]);

  const mutation = useMutation({
    mutationFn: async (data) => {
      const payload = {
        ...data,
        company_email: user.email,
        company_name: company?.company_name || '',
        company_logo: company?.logo_url || '',
      };
      if (jobId && existingJob) return base44.entities.Job.update(existingJob.id, payload);
      return base44.entities.Job.create(payload);
    },
    onSuccess: () => {
      toast({ title: jobId ? 'Job updated!' : 'Job posted!' });
      navigate('/ManageJobs');
    },
  });

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const addSkill = () => {
    if (skillInput.trim() && !form.skills_required?.includes(skillInput.trim())) {
      setForm(f => ({ ...f, skills_required: [...(f.skills_required || []), skillInput.trim()] }));
      setSkillInput('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">{jobId ? 'Edit Job' : 'Post a Job'}</h1>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Basic Info</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2"><Label>Job Title</Label><Input value={form.title || ''} onChange={e => update('title', e.target.value)} placeholder="e.g., Senior Frontend Engineer" /></div>
              <div><Label>Department</Label><Input value={form.department || ''} onChange={e => update('department', e.target.value)} /></div>
              <div>
                <Label>Employment Type</Label>
                <Select value={form.employment_type || ''} onValueChange={v => update('employment_type', v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full_time">Full-time</SelectItem>
                    <SelectItem value="part_time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Location</Label><Input value={form.location || ''} onChange={e => update('location', e.target.value)} /></div>
              <div>
                <Label>Work Mode</Label>
                <Select value={form.work_mode || ''} onValueChange={v => update('work_mode', v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="onsite">Onsite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Job Details</h2>
            <div className="space-y-4">
              <div><Label>Description</Label><Textarea value={form.description || ''} onChange={e => update('description', e.target.value)} className="min-h-[100px]" /></div>
              <div><Label>Responsibilities</Label><Textarea value={form.responsibilities || ''} onChange={e => update('responsibilities', e.target.value)} className="min-h-[100px]" /></div>
              <div><Label>Requirements</Label><Textarea value={form.requirements || ''} onChange={e => update('requirements', e.target.value)} className="min-h-[100px]" /></div>
              <div><Label>Experience Required (years)</Label><Input type="number" value={form.experience_required || ''} onChange={e => update('experience_required', Number(e.target.value))} /></div>
              <div>
                <Label>Skills Required</Label>
                <div className="flex gap-2 mt-1">
                  <Input value={skillInput} onChange={e => setSkillInput(e.target.value)} placeholder="Add a skill" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())} />
                  <Button type="button" variant="outline" onClick={addSkill}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {form.skills_required?.map(s => (
                    <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-medium">
                      {s}
                      <button onClick={() => setForm(f => ({ ...f, skills_required: f.skills_required.filter(x => x !== s) }))} className="hover:text-indigo-900">×</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Compensation</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Salary Min ($)</Label><Input type="number" value={form.salary_min || ''} onChange={e => update('salary_min', Number(e.target.value))} /></div>
              <div><Label>Salary Max ($)</Label><Input type="number" value={form.salary_max || ''} onChange={e => update('salary_max', Number(e.target.value))} /></div>
              <div className="sm:col-span-2"><Label>Benefits</Label><Textarea value={form.benefits || ''} onChange={e => update('benefits', e.target.value)} /></div>
              <div><Label>Application Deadline</Label><Input type="date" value={form.application_deadline || ''} onChange={e => update('application_deadline', e.target.value)} /></div>
            </div>
          </Card>

          <Button onClick={() => mutation.mutate(form)} disabled={mutation.isPending} className="w-full h-12 rounded-xl gap-2">
            <Save className="w-4 h-4" /> {mutation.isPending ? 'Saving...' : jobId ? 'Update Job' : 'Post Job'}
          </Button>
        </div>
      </div>
    </div>
  );
}
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
  const [form, setForm] = useState({ skills_required: [], status: 'open', approval_status: 'pending' });
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
      // New jobs always start as pending approval
      if (!payload.approval_status) payload.approval_status = 'pending';
      if (jobId && existingJob) return base44.entities.Job.update(existingJob.id, payload);
      return base44.entities.Job.create({ ...payload, approval_status: 'pending' });
    },
    onSuccess: (result) => {
      toast({ title: jobId ? 'Job updated!' : 'Job posted! It\'s pending admin approval.' });
      // Notify admins of new job posting (fire-and-forget)
      if (!jobId) {
        base44.functions.invoke('createNotification', {
          user_email: user.email,
          type: 'job_posted',
          title: 'Job submitted for review',
          body: `Your job "${form.title}" has been submitted and is pending approval.`,
          link: '/ManageJobs',
        }).catch(() => {});
      }
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
    <div className="min-h-screen bg-transparent py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <h1 className="text-2xl font-bold text-white mb-6">{jobId ? 'Edit Job' : 'Post a Job'}</h1>

        <div className="space-y-6">
          <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-md">
            <h2 className="text-lg font-semibold text-white mb-4">Basic Info</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2"><Label className="text-slate-300">Job Title</Label><Input className="bg-white/5 border-white/10 text-white" value={form.title || ''} onChange={e => update('title', e.target.value)} placeholder="e.g., Senior Frontend Engineer" /></div>
              <div><Label className="text-slate-300">Department</Label><Input className="bg-white/5 border-white/10 text-white" value={form.department || ''} onChange={e => update('department', e.target.value)} /></div>
              <div>
                <Label className="text-slate-300">Employment Type</Label>
                <Select value={form.employment_type || ''} onValueChange={v => update('employment_type', v)}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10 text-white">
                    <SelectItem value="full_time">Full-time</SelectItem>
                    <SelectItem value="part_time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300">Country</Label>
                <Input className="bg-white/5 border-white/10 text-white" value={form.country || ''} onChange={e => update('country', e.target.value)} placeholder="e.g., United States" />
              </div>
              <div>
                <Label className="text-slate-300">State / Province</Label>
                <Input className="bg-white/5 border-white/10 text-white" value={form.state || ''} onChange={e => update('state', e.target.value)} placeholder="e.g., California" />
              </div>
              <div>
                <Label className="text-slate-300">City</Label>
                <Input className="bg-white/5 border-white/10 text-white" value={form.city || ''} onChange={e => update('city', e.target.value)} placeholder="e.g., San Francisco" />
              </div>
              <div>
                <Label className="text-slate-300">Job Level</Label>
                <Select value={form.job_level || ''} onValueChange={v => update('job_level', v)}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder="Select level..." /></SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10 text-white">
                    <SelectItem value="entry">Entry</SelectItem>
                    <SelectItem value="mid">Mid</SelectItem>
                    <SelectItem value="senior">Senior</SelectItem>
                    <SelectItem value="lead">Lead</SelectItem>
                    <SelectItem value="director">Director</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300">Number of Openings</Label>
                <Input className="bg-white/5 border-white/10 text-white" type="number" min="1" value={form.num_openings || ''} onChange={e => update('num_openings', Number(e.target.value))} placeholder="e.g., 2" />
              </div>
              <div>
                <Label className="text-slate-300">Remote Eligible</Label>
                <Select value={form.remote_eligible != null ? String(form.remote_eligible) : ''} onValueChange={v => update('remote_eligible', v === 'true')}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10 text-white">
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300">Work Mode</Label>
                <Select value={form.work_mode || ''} onValueChange={v => update('work_mode', v)}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10 text-white">
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="onsite">Onsite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-md">
            <h2 className="text-lg font-semibold text-white mb-4">Job Details</h2>
            <div className="space-y-4">
              <div><Label className="text-slate-300">Description</Label><Textarea className="bg-white/5 border-white/10 text-white" value={form.description || ''} onChange={e => update('description', e.target.value)} className="min-h-[100px]" /></div>
              <div><Label className="text-slate-300">Responsibilities</Label><Textarea className="bg-white/5 border-white/10 text-white" value={form.responsibilities || ''} onChange={e => update('responsibilities', e.target.value)} className="min-h-[100px]" /></div>
              <div><Label className="text-slate-300">Requirements</Label><Textarea className="bg-white/5 border-white/10 text-white" value={form.requirements || ''} onChange={e => update('requirements', e.target.value)} className="min-h-[100px]" /></div>
              <div><Label className="text-slate-300">Experience Required (years)</Label><Input className="bg-white/5 border-white/10 text-white" type="number" value={form.experience_required || ''} onChange={e => update('experience_required', Number(e.target.value))} /></div>
              <div><Label className="text-slate-300">Certifications Required (if any)</Label><Input className="bg-white/5 border-white/10 text-white" value={form.certifications_required || ''} onChange={e => update('certifications_required', e.target.value)} placeholder="e.g., AWS Certified, PMP" /></div>
              <div>
                <Label className="text-slate-300">Skills Required</Label>
                <div className="flex gap-2 mt-1">
                  <Input className="bg-white/5 border-white/10 text-white" value={skillInput} onChange={e => setSkillInput(e.target.value)} placeholder="Add a skill" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())} />
                  <Button type="button" variant="outline" className="border-white/10 text-white hover:bg-white/10" onClick={addSkill}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {form.skills_required?.map(s => (
                    <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-slate-300 text-xs font-medium">
                      {s}
                      <button onClick={() => setForm(f => ({ ...f, skills_required: f.skills_required.filter(x => x !== s) }))} className="hover:text-white transition-colors">×</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-md">
            <h2 className="text-lg font-semibold text-white mb-4">Compensation</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label className="text-slate-300">Salary Min ($)</Label><Input className="bg-white/5 border-white/10 text-white" type="number" value={form.salary_min || ''} onChange={e => update('salary_min', Number(e.target.value))} /></div>
              <div><Label className="text-slate-300">Salary Max ($)</Label><Input className="bg-white/5 border-white/10 text-white" type="number" value={form.salary_max || ''} onChange={e => update('salary_max', Number(e.target.value))} /></div>
              <div className="sm:col-span-2"><Label className="text-slate-300">Benefits</Label><Textarea className="bg-white/5 border-white/10 text-white" value={form.benefits || ''} onChange={e => update('benefits', e.target.value)} /></div>
              <div><Label className="text-slate-300">Application Deadline</Label><Input className="bg-white/5 border-white/10 text-white" type="date" value={form.application_deadline || ''} onChange={e => update('application_deadline', e.target.value)} /></div>
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
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { Save, Upload } from 'lucide-react';
import LoadingSpinner from '../components/shared/LoadingSpinner';

export default function EditCandidateProfile() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({});
  const [skillInput, setSkillInput] = useState('');
  const [techInput, setTechInput] = useState('');

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const { data: existing, isLoading } = useQuery({
    queryKey: ['my-candidate-profile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.CandidateProfile.filter({ user_email: user.email });
      return profiles[0] || null;
    },
    enabled: !!user?.email,
  });

  useEffect(() => {
    if (existing) setForm(existing);
    else if (user) setForm({ user_email: user.email, full_name: user.full_name || '', open_to_work: true, visibility: 'public', skills: [], tech_stack: [], employment_type_preference: [] });
  }, [existing, user]);

  const mutation = useMutation({
    mutationFn: async (data) => {
      if (existing) return base44.entities.CandidateProfile.update(existing.id, data);
      return base44.entities.CandidateProfile.create(data);
    },
    onSuccess: () => {
      toast({ title: 'Profile saved!' });
      queryClient.invalidateQueries({ queryKey: ['my-candidate-profile'] });
      navigate('/CandidateDashboard');
    },
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, resume_url: file_url }));
    toast({ title: 'Resume uploaded!' });
  };

  const addSkill = () => {
    if (skillInput.trim() && !form.skills?.includes(skillInput.trim())) {
      setForm(f => ({ ...f, skills: [...(f.skills || []), skillInput.trim()] }));
      setSkillInput('');
    }
  };

  const addTech = () => {
    if (techInput.trim() && !form.tech_stack?.includes(techInput.trim())) {
      setForm(f => ({ ...f, tech_stack: [...(f.tech_stack || []), techInput.trim()] }));
      setTechInput('');
    }
  };

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }));

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Edit Profile</h1>

        <div className="space-y-6">
          {/* Personal */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Personal Info</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Full Name</Label><Input value={form.full_name || ''} onChange={e => update('full_name', e.target.value)} /></div>
              <div><Label>Phone</Label><Input value={form.phone || ''} onChange={e => update('phone', e.target.value)} /></div>
              <div><Label>Location</Label><Input value={form.location || ''} onChange={e => update('location', e.target.value)} placeholder="City, Country" /></div>
              <div><Label>LinkedIn</Label><Input value={form.linkedin || ''} onChange={e => update('linkedin', e.target.value)} placeholder="https://linkedin.com/in/..." /></div>
              <div className="sm:col-span-2"><Label>Portfolio / GitHub</Label><Input value={form.portfolio || ''} onChange={e => update('portfolio', e.target.value)} /></div>
              <div className="sm:col-span-2"><Label>Bio</Label><Textarea value={form.bio || ''} onChange={e => update('bio', e.target.value)} placeholder="Tell us about yourself..." /></div>
            </div>
          </Card>

          {/* Professional */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Professional Info</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Job Title</Label><Input value={form.job_title || ''} onChange={e => update('job_title', e.target.value)} /></div>
              <div><Label>Years of Experience</Label><Input type="number" value={form.years_of_experience || ''} onChange={e => update('years_of_experience', Number(e.target.value))} /></div>
              <div><Label>Industry</Label><Input value={form.industry || ''} onChange={e => update('industry', e.target.value)} /></div>
              <div><Label>Expected Salary ($)</Label><Input type="number" value={form.expected_salary || ''} onChange={e => update('expected_salary', Number(e.target.value))} /></div>
            </div>
            <div className="mt-4">
              <Label>Skills</Label>
              <div className="flex gap-2 mt-1">
                <Input value={skillInput} onChange={e => setSkillInput(e.target.value)} placeholder="Add a skill" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())} />
                <Button type="button" variant="outline" onClick={addSkill}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.skills?.map(s => (
                  <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-medium">
                    {s}
                    <button onClick={() => setForm(f => ({ ...f, skills: f.skills.filter(x => x !== s) }))} className="hover:text-indigo-900">×</button>
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-4">
              <Label>Tech Stack</Label>
              <div className="flex gap-2 mt-1">
                <Input value={techInput} onChange={e => setTechInput(e.target.value)} placeholder="Add technology" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTech())} />
                <Button type="button" variant="outline" onClick={addTech}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.tech_stack?.map(s => (
                  <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                    {s}
                    <button onClick={() => setForm(f => ({ ...f, tech_stack: f.tech_stack.filter(x => x !== s) }))} className="hover:text-slate-900">×</button>
                  </span>
                ))}
              </div>
            </div>
          </Card>

          {/* Education */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Education</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <div><Label>Degree</Label><Input value={form.education_degree || ''} onChange={e => update('education_degree', e.target.value)} /></div>
              <div><Label>University</Label><Input value={form.education_university || ''} onChange={e => update('education_university', e.target.value)} /></div>
              <div><Label>Graduation Year</Label><Input type="number" value={form.graduation_year || ''} onChange={e => update('graduation_year', Number(e.target.value))} /></div>
            </div>
          </Card>

          {/* Settings */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Preferences</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Availability</Label>
                <Select value={form.availability || ''} onValueChange={v => update('availability', v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="2_weeks">2 weeks</SelectItem>
                    <SelectItem value="1_month">1 month</SelectItem>
                    <SelectItem value="2_months">2 months</SelectItem>
                    <SelectItem value="3_months_plus">3+ months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Notice Period</Label>
                <Input value={form.notice_period || ''} onChange={e => update('notice_period', e.target.value)} placeholder="e.g., 2 weeks" />
              </div>
              <div>
                <Label>Profile Visibility</Label>
                <Select value={form.visibility || 'public'} onValueChange={v => update('visibility', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="companies_only">Companies Only</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={form.open_to_work ?? true} onCheckedChange={v => update('open_to_work', v)} />
                <Label>Open to work</Label>
              </div>
            </div>
            <div className="mt-4">
              <Label>Resume</Label>
              <div className="flex items-center gap-3 mt-1">
                <label className="cursor-pointer">
                  <input type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} />
                  <Button variant="outline" size="sm" className="gap-2" asChild><span><Upload className="w-4 h-4" /> Upload PDF</span></Button>
                </label>
                {form.resume_url && <span className="text-xs text-emerald-600">Resume uploaded ✓</span>}
              </div>
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
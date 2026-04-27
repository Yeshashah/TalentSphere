import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 as localClient } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Eye, EyeOff, Upload } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

const EDUCATION_OPTIONS = ['Bachelors', 'Masters', 'PhD', 'Diploma', 'Other'];
const SKILLS_OPTIONS = ['React', 'Node.js', 'Python', 'Java', 'JavaScript', 'TypeScript', 'SQL', 'AWS', 'Docker', 'Kubernetes'];

export default function CandidateRegistration() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    phone: '',
    job_title: '',
    years_of_experience: 0,
    months_of_experience: 0,
    skills: [],
    linkedin: '',
    portfolio_link: '',
    education_degree: '',
    graduation_year: new Date().getFullYear(),
    open_to_work: false,
    external_platform_name: 'TalentSphere',
    data_source: 'Website',
    password: '',
    resume_url: ''
  });

  const [customSkill, setCustomSkill] = useState('');
  const [resumeFile, setResumeFile] = useState(null); // tracks selected file independently of upload URL

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const toggleSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleAddCustomSkill = (e) => {
    if (customSkill && !formData.skills.includes(customSkill)) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, customSkill] }));
      setCustomSkill('');
    }
  };

  // Only save the file object locally — actual upload happens after signUp (user must be authenticated)
  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setResumeFile(file);
    setError('');
    toast({
      title: `"${file.name}" selected ✓`,
      description: 'Your resume will be uploaded when you create your account.',
    });
  };

  const validateForm = () => {
    if (!formData.email || !formData.full_name || !formData.phone) {
      setError('Please fill all required fields');
      return false;
    }
    if (!/^\d{10,15}$/.test(formData.phone.replace(/\D/g, ''))) {
      setError('Phone number must be 10-15 digits');
      return false;
    }
    if (formData.graduation_year > new Date().getFullYear()) {
      setError('Graduation year cannot be in the future');
      return false;
    }
    if (!resumeFile) {
      setError('Please upload your resume before submitting.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      // Step 1: Register the user (creates Supabase Auth account)
      const result = await localClient.auth.register({
        email: formData.email,
        full_name: formData.full_name,
        phone: formData.phone,
        job_title: formData.job_title,
        years_of_experience: Number(formData.years_of_experience),
        months_of_experience: Number(formData.months_of_experience),
        skills: formData.skills,
        linkedin: formData.linkedin,
        portfolio_link: formData.portfolio_link,
        education_degree: formData.education_degree,
        graduation_year: Number(formData.graduation_year),
        open_to_work: formData.open_to_work,
        role: 'candidate',
        password: formData.password,
      });

      // Step 2: Upload resume now that the user is authenticated
      let resumeUrl = '';
      if (resumeFile) {
        try {
          const { file_url } = await localClient.integrations.Core.UploadFile({ file: resumeFile });
          resumeUrl = file_url;
        } catch (uploadErr) {
          console.warn('Resume upload failed after registration:', uploadErr.message);
          // Non-fatal: profile is still created, resume can be uploaded later
        }
      }

      // Step 3: Create the CandidateProfile with the resume URL
      await localClient.entities.CandidateProfile.create({
        userId: result.userid,
        user_email: formData.email,
        full_name: formData.full_name,
        phone: formData.phone,
        job_title: formData.job_title,
        years_of_experience: Number(formData.years_of_experience),
        months_of_experience: Number(formData.months_of_experience),
        skills: formData.skills,
        linkedin: formData.linkedin,
        portfolio_link: formData.portfolio_link,
        education_degree: formData.education_degree,
        graduation_year: Number(formData.graduation_year),
        open_to_work: formData.open_to_work,
        external_platform_name: formData.external_platform_name,
        data_source: formData.data_source,
        candidate_resume: resumeUrl
      });

      toast({
        title: 'Account created successfully! 🎉',
        description: 'Welcome to TalentSphere. Your profile has been saved.',
      });
      navigate('/CandidateDashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <button
          onClick={() => navigate('/Registration')}
          className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <Card className="p-8 bg-white/5 border-white/10 backdrop-blur-xl shadow-2xl shadow-black/50">
          <h1 className="text-3xl font-bold text-white mb-2">Candidate Registration</h1>
          <p className="text-slate-400 mb-6">Create your profile to start finding opportunities</p>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email & Password */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email ID *</label>
                <Input
                  type="email"
                  name="email"
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-600"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Create Password *</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    required
                    className="pr-10 bg-white/5 border-white/10 text-white placeholder:text-slate-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Personal Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Full Name *</label>
                <Input
                  type="text"
                  name="full_name"
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-600"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Phone *</label>
                <Input
                  type="tel"
                  name="phone"
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-600"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+1234567890"
                  required
                />
              </div>
            </div>

            {/* Professional Info */}
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Job Title</label>
                <Input
                  type="text"
                  name="job_title"
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-600"
                  value={formData.job_title}
                  onChange={handleInputChange}
                  placeholder="Senior Developer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Years of Exp.</label>
                <Input
                  type="number"
                  name="years_of_experience"
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-600"
                  value={formData.years_of_experience}
                  onChange={handleInputChange}
                  min="0"
                  max="50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Months of Exp.</label>
                <Input
                  type="number"
                  name="months_of_experience"
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-600"
                  value={formData.months_of_experience}
                  onChange={handleInputChange}
                  min="0"
                  max="11"
                />
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">Skills</label>

              <div className="flex gap-2 mb-4">
                <Input
                  type="text"
                  value={customSkill}
                  onChange={e => setCustomSkill(e.target.value)}
                  placeholder="Type a custom skill..."
                  className="flex-1 bg-white/5 border-white/10 text-white"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomSkill(e);
                    }
                  }}
                />
                <Button type="button" onClick={handleAddCustomSkill} variant="outline" className="px-5">
                  Add Skill
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[...new Set([...SKILLS_OPTIONS, ...formData.skills])].map(skill => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${formData.skills.includes(skill)
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'border-white/10 text-slate-400 hover:border-white/30 hover:bg-white/5'
                      }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            {/* Links */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">LinkedIn</label>
                <Input
                  type="url"
                  name="linkedin"
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-600"
                  value={formData.linkedin}
                  onChange={handleInputChange}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Portfolio Link</label>
                <Input
                  type="url"
                  name="portfolio_link"
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-600"
                  value={formData.portfolio_link}
                  onChange={handleInputChange}
                  placeholder="https://portfolio.com"
                />
              </div>
            </div>

            {/* Education */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Education Degree</label>
                <select
                  name="education_degree"
                  value={formData.education_degree}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 text-white rounded-lg text-sm"
                >
                  <option value="">Select degree</option>
                  {EDUCATION_OPTIONS.map(deg => (
                    <option key={deg} value={deg} className="bg-slate-900">{deg}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Graduation Year</label>
                <Input
                  type="number"
                  name="graduation_year"
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-600"
                  value={formData.graduation_year}
                  onChange={handleInputChange}
                  min="1950"
                  max={new Date().getFullYear()}
                />
              </div>
            </div>

            {/* Open to Work & Metadata */}
            <div className="grid md:grid-cols-2 gap-4 items-center">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="open_to_work"
                  checked={formData.open_to_work}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded border-white/10 text-indigo-600 bg-white/5"
                />
                <label className="text-sm font-medium text-slate-300">I'm open to work</label>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Platform</label>
                  <Input
                    type="text"
                    name="external_platform_name"
                    value={formData.external_platform_name}
                    readOnly
                    className="h-8 text-xs bg-white/5 border-white/10 text-slate-400 cursor-not-allowed opacity-70"
                  />
                </div>
                <div className="hidden">
                  <Input
                    type="text"
                    name="data_source"
                    value={formData.data_source}
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* Resume Upload */}
            <div className="mt-4">
              <Label className="block text-sm font-medium text-slate-300 mb-2">
                Resume <span className="text-red-400">*</span>
              </Label>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".doc,.docx,.pdf,.png"
                    className="hidden"
                    onChange={handleResumeUpload}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={`gap-2 border-white/10 text-white hover:bg-white/10 ${!formData.resume_url ? 'border-red-500/40' : 'border-emerald-500/40'}`}
                    asChild
                  >
                    <span><Upload className="w-4 h-4" /> {formData.resume_url ? 'Change Resume' : 'Upload Resume'}</span>
                  </Button>
                </label>
                {formData.resume_url
                  ? <span className="text-xs text-emerald-400 font-medium">✓ Resume uploaded</span>
                  : <span className="text-xs text-slate-500">Accepted: .doc, .docx, .pdf, .png</span>
                }
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>

            <p className="text-center text-sm text-slate-400 mt-4">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-indigo-400 hover:underline font-medium"
              >
                SignIn
              </button>
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
}
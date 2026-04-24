import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { localClient } from '@/api/localClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

const EDUCATION_OPTIONS = ['Bachelors', 'Masters', 'PhD', 'Diploma', 'Other'];
const SKILLS_OPTIONS = ['React', 'Node.js', 'Python', 'Java', 'JavaScript', 'TypeScript', 'SQL', 'AWS', 'Docker', 'Kubernetes'];

export default function CandidateRegistration() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    phone: '',
    job_title: '',
    years_of_experience: 0,
    skills: [],
    linkedin: '',
    portfolio_link: '',
    education_degree: '',
    graduation_year: new Date().getFullYear(),
    open_to_work: false,
  });

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
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const result = await localClient.auth.register({
        email: formData.email,
        full_name: formData.full_name,
        phone: formData.phone,
        job_title: formData.job_title,
        years_of_experience: Number(formData.years_of_experience),
        skills: formData.skills,
        linkedin: formData.linkedin,
        portfolio_link: formData.portfolio_link,
        education_degree: formData.education_degree,
        graduation_year: Number(formData.graduation_year),
        open_to_work: formData.open_to_work,
        role: 'candidate',
        password: 'changeme123', // temporary default password
      });

      // Also create a CandidateProfile entity
      await localClient.entities.CandidateProfile.create({
        user_email: formData.email,
        full_name: formData.full_name,
        phone: formData.phone,
        job_title: formData.job_title,
        years_of_experience: Number(formData.years_of_experience),
        skills: formData.skills,
        linkedin: formData.linkedin,
        portfolio_link: formData.portfolio_link,
        education_degree: formData.education_degree,
        graduation_year: Number(formData.graduation_year),
        open_to_work: formData.open_to_work,
      });

      alert(`Registration successful! Your temporary password is: changeme123\nPlease sign in and update your password.`);
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <button
          onClick={() => navigate('/Registration')}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <Card className="p-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Candidate Registration</h1>
          <p className="text-slate-500 mb-6">Create your profile to start finding opportunities</p>

          {error && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Email ID *</label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your@email.com"
                required
              />
              <p className="text-xs text-slate-500 mt-1">You'll receive an email invitation to set your password.</p>
            </div>

            {/* Personal Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Full Name *</label>
                <Input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Phone *</label>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+1234567890"
                  required
                />
              </div>
            </div>

            {/* Professional Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Job Title</label>
                <Input
                  type="text"
                  name="job_title"
                  value={formData.job_title}
                  onChange={handleInputChange}
                  placeholder="Senior Developer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Years of Experience</label>
                <Input
                  type="number"
                  name="years_of_experience"
                  value={formData.years_of_experience}
                  onChange={handleInputChange}
                  min="0"
                  max="50"
                />
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-3">Skills</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {SKILLS_OPTIONS.map(skill => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      formData.skills.includes(skill)
                        ? 'bg-indigo-500 text-white border-indigo-500'
                        : 'border-slate-300 text-slate-700 hover:border-indigo-300'
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
                <label className="block text-sm font-medium text-slate-900 mb-2">LinkedIn</label>
                <Input
                  type="url"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleInputChange}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Portfolio Link</label>
                <Input
                  type="url"
                  name="portfolio_link"
                  value={formData.portfolio_link}
                  onChange={handleInputChange}
                  placeholder="https://portfolio.com"
                />
              </div>
            </div>

            {/* Education */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Education Degree</label>
                <select
                  name="education_degree"
                  value={formData.education_degree}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="">Select degree</option>
                  {EDUCATION_OPTIONS.map(deg => (
                    <option key={deg} value={deg}>{deg}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Graduation Year</label>
                <Input
                  type="number"
                  name="graduation_year"
                  value={formData.graduation_year}
                  onChange={handleInputChange}
                  min="1950"
                  max={new Date().getFullYear()}
                />
              </div>
            </div>

            {/* Open to Work */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="open_to_work"
                checked={formData.open_to_work}
                onChange={handleInputChange}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600"
              />
              <label className="text-sm font-medium text-slate-700">I'm open to work</label>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
            
            <p className="text-center text-sm text-slate-500 mt-4">
              Already have an account?{' '}
              <button 
                type="button" 
                onClick={() => navigate('/login')} 
                className="text-indigo-500 hover:underline font-medium"
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
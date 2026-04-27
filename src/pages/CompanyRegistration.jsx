import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 as localClient } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

const COUNTRIES = ['United States', 'United Kingdom', 'Canada', 'India', 'Australia', 'Germany', 'France', 'Japan'];
const COMPANY_TYPES = ['Startup', 'Private', 'Public', 'Government', 'Nonprofit'];
const INDUSTRIES = ['Technology', 'Finance', 'Healthcare', 'Retail', 'Manufacturing', 'Education', 'Energy', 'Telecommunications'];

export default function CompanyRegistration() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    company_name: '',
    hq_country: '',
    year_founded: new Date().getFullYear(),
    company_type: '',
    linkedin_profile_name: '',
    linkedin_profile_url: '',
    linkedin_logo_url: '',
    company_website: '',
    linkedin_industries: [],
    recent_job_openings_title: '',
    recent_job_openings: 0,
    all_office_addresses: '',
    subscription_plan: 'Free',
    external_platform_name: 'TalentSphere',
    data_source: 'Website',
    password: '',
  });

  const [customIndustry, setCustomIndustry] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleIndustry = (industry) => {
    setFormData(prev => ({
      ...prev,
      linkedin_industries: prev.linkedin_industries.includes(industry)
        ? prev.linkedin_industries.filter(i => i !== industry)
        : [...prev.linkedin_industries, industry]
    }));
  };

  const handleAddCustomIndustry = (e) => {
    e.preventDefault();
    if (customIndustry.trim() && !formData.linkedin_industries.includes(customIndustry.trim())) {
      setFormData(prev => ({
        ...prev,
        linkedin_industries: [...prev.linkedin_industries, customIndustry.trim()]
      }));
    }
    setCustomIndustry('');
  };

  const validateForm = () => {
    if (!formData.email || !formData.company_name || !formData.hq_country) {
      setError('Please fill all required fields');
      return false;
    }
    if (formData.year_founded > new Date().getFullYear()) {
      setError('Year founded cannot be in the future');
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
        full_name: formData.company_name,
        role: 'company',
        password: formData.password,
      });

      await localClient.entities.CompanyProfile.create({
        userId: result.userid,
        user_email: formData.email,
        company_name: formData.company_name,
        hq_country: formData.hq_country,
        year_founded: Number(formData.year_founded),
        company_type: formData.company_type,
        linkedin_profile_name: formData.linkedin_profile_name,
        linkedin_profile_url: formData.linkedin_profile_url,
        linkedin_logo_url: formData.linkedin_logo_url,
        company_website: formData.company_website,
        linkedin_industries: formData.linkedin_industries,
        recent_job_openings_title: formData.recent_job_openings_title,
        recent_job_openings: Number(formData.recent_job_openings) || 0,
        all_office_addresses: formData.all_office_addresses,
        subscription_plan: formData.subscription_plan,
        external_platform_name: formData.external_platform_name,
        data_source: formData.data_source,
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
    <div className="min-h-screen bg-transparent py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <button
          onClick={() => navigate('/Registration')}
          className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <Card className="p-8 bg-white/5 border-white/10 backdrop-blur-xl shadow-2xl shadow-black/50">
          <h1 className="text-3xl font-bold text-white mb-2">Company Registration</h1>
          <p className="text-slate-400 mb-6">Set up your company account to start hiring</p>

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
                  placeholder="company@email.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Create Password *</label>
                <Input
                  type="password"
                  name="password"
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-600"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Company Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Company Name *</label>
                <Input
                  type="text"
                  name="company_name"
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-600"
                  value={formData.company_name}
                  onChange={handleInputChange}
                  placeholder="Your Company"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">HQ Country *</label>
                <select
                  name="hq_country"
                  value={formData.hq_country}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 text-white rounded-lg text-sm"
                  required
                >
                  <option value="" className="bg-slate-900">Select country</option>
                  {COUNTRIES.map(country => (
                    <option key={country} value={country} className="bg-slate-900">{country}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Founding & Type */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Year Founded</label>
                <Input
                  type="number"
                  name="year_founded"
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-600"
                  value={formData.year_founded}
                  onChange={handleInputChange}
                  min="1800"
                  max={new Date().getFullYear()}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Company Type</label>
                <select
                  name="company_type"
                  value={formData.company_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 text-white rounded-lg text-sm"
                >
                  <option value="" className="bg-slate-900">Select type</option>
                  {COMPANY_TYPES.map(type => (
                    <option key={type} value={type} className="bg-slate-900">{type}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Website & LinkedIn */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Website</label>
                <Input
                  type="url"
                  name="company_website"
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-600"
                  value={formData.company_website}
                  onChange={handleInputChange}
                  placeholder="https://company.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">LinkedIn Profile Name</label>
                <Input
                  type="text"
                  name="linkedin_profile_name"
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-600"
                  value={formData.linkedin_profile_name}
                  onChange={handleInputChange}
                  placeholder="Company Name"
                />
              </div>
            </div>

            {/* LinkedIn URLs */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">LinkedIn Profile URL</label>
                <Input
                  type="url"
                  name="linkedin_profile_url"
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-600"
                  value={formData.linkedin_profile_url}
                  onChange={handleInputChange}
                  placeholder="https://linkedin.com/company/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">LinkedIn Logo URL</label>
                <Input
                  type="url"
                  name="linkedin_logo_url"
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-600"
                  value={formData.linkedin_logo_url}
                  onChange={handleInputChange}
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* Industries */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">Industries</label>

              <div className="flex gap-2 mb-4">
                <Input
                  type="text"
                  value={customIndustry}
                  onChange={e => setCustomIndustry(e.target.value)}
                  placeholder="Type a custom industry..."
                  className="flex-1 bg-white/5 border-white/10 text-white"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomIndustry(e);
                    }
                  }}
                />
                <Button type="button" onClick={handleAddCustomIndustry} variant="outline" className="px-5">
                  Add Industry
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[...new Set([...INDUSTRIES, ...formData.linkedin_industries])].map(industry => (
                  <button
                    key={industry}
                    type="button"
                    onClick={() => toggleIndustry(industry)}
                    className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${formData.linkedin_industries.includes(industry)
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'border-white/10 text-slate-400 hover:border-white/30 hover:bg-white/5'
                      }`}
                  >
                    {industry}
                  </button>
                ))}
              </div>
            </div>

            {/* Job Openings */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Recent Job Opening Title</label>
                <Input
                  type="text"
                  name="recent_job_openings_title"
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-600"
                  value={formData.recent_job_openings_title}
                  onChange={handleInputChange}
                  placeholder="e.g., Senior Developer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Number of Recent Job Openings</label>
                <Input
                  type="number"
                  name="recent_job_openings"
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-600"
                  value={formData.recent_job_openings}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>
            </div>

            {/* Background Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Office Addresses</label>
                <textarea
                  name="all_office_addresses"
                  value={formData.all_office_addresses}
                  onChange={handleInputChange}
                  placeholder="List all office addresses (one per line)"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 text-white rounded-lg text-sm placeholder:text-slate-600 focus:ring-1 focus:ring-indigo-500"
                  rows={3}
                />
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Subscription Plan</label>
                  <select
                    name="subscription_plan"
                    value={formData.subscription_plan}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 text-white rounded-lg text-sm"
                  >
                    <option value="Free" className="bg-slate-900">Free</option>
                    <option value="Starter" className="bg-slate-900">Starter</option>
                    <option value="Pro" className="bg-slate-900">Pro</option>
                    <option value="Enterprise" className="bg-slate-900">Enterprise</option>
                  </select>
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
                    />
                  </div>
                </div>
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
          </form>
        </Card>
      </div>
    </div>
  );
}
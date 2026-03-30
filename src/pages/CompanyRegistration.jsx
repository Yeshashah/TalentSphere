import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
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
    password: '',
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
  });

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

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.company_name || !formData.hq_country) {
      setError('Please fill all required fields');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
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
      const response = await base44.functions.invoke('registerCompany', {
        email: formData.email,
        password: formData.password,
        company_name: formData.company_name,
        hq_country: formData.hq_country,
        year_founded: parseInt(formData.year_founded),
        company_type: formData.company_type,
        linkedin_profile_name: formData.linkedin_profile_name,
        linkedin_profile_url: formData.linkedin_profile_url,
        linkedin_logo_url: formData.linkedin_logo_url,
        company_website: formData.company_website,
        linkedin_industries: formData.linkedin_industries,
        recent_job_openings_title: formData.recent_job_openings_title,
        recent_job_openings: parseInt(formData.recent_job_openings) || 0,
        all_office_addresses: formData.all_office_addresses,
      });

      if (response.data?.success) {
        navigate('/CompanyDashboard');
      } else {
        setError(response.data?.error || 'Registration failed');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Registration failed');
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Company Registration</h1>
          <p className="text-slate-500 mb-6">Set up your company account to start hiring</p>

          {error && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email & Password */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Email ID *</label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="company@email.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Password *</label>
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Min 8 characters"
                  required
                />
              </div>
            </div>

            {/* Company Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Company Name *</label>
                <Input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleInputChange}
                  placeholder="Your Company"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">HQ Country *</label>
                <select
                  name="hq_country"
                  value={formData.hq_country}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  required
                >
                  <option value="">Select country</option>
                  {COUNTRIES.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Founding & Type */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Year Founded</label>
                <Input
                  type="number"
                  name="year_founded"
                  value={formData.year_founded}
                  onChange={handleInputChange}
                  min="1800"
                  max={new Date().getFullYear()}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Company Type</label>
                <select
                  name="company_type"
                  value={formData.company_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="">Select type</option>
                  {COMPANY_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Website & LinkedIn */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Website</label>
                <Input
                  type="url"
                  name="company_website"
                  value={formData.company_website}
                  onChange={handleInputChange}
                  placeholder="https://company.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">LinkedIn Profile Name</label>
                <Input
                  type="text"
                  name="linkedin_profile_name"
                  value={formData.linkedin_profile_name}
                  onChange={handleInputChange}
                  placeholder="Company Name"
                />
              </div>
            </div>

            {/* LinkedIn URLs */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">LinkedIn Profile URL</label>
                <Input
                  type="url"
                  name="linkedin_profile_url"
                  value={formData.linkedin_profile_url}
                  onChange={handleInputChange}
                  placeholder="https://linkedin.com/company/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">LinkedIn Logo URL</label>
                <Input
                  type="url"
                  name="linkedin_logo_url"
                  value={formData.linkedin_logo_url}
                  onChange={handleInputChange}
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* Industries */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-3">Industries</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {INDUSTRIES.map(industry => (
                  <button
                    key={industry}
                    type="button"
                    onClick={() => toggleIndustry(industry)}
                    className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      formData.linkedin_industries.includes(industry)
                        ? 'bg-indigo-500 text-white border-indigo-500'
                        : 'border-slate-300 text-slate-700 hover:border-indigo-300'
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
                <label className="block text-sm font-medium text-slate-900 mb-2">Recent Job Opening Title</label>
                <Input
                  type="text"
                  name="recent_job_openings_title"
                  value={formData.recent_job_openings_title}
                  onChange={handleInputChange}
                  placeholder="e.g., Senior Developer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Number of Recent Job Openings</label>
                <Input
                  type="number"
                  name="recent_job_openings"
                  value={formData.recent_job_openings}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>
            </div>

            {/* Addresses */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Office Addresses</label>
              <textarea
                name="all_office_addresses"
                value={formData.all_office_addresses}
                onChange={handleInputChange}
                placeholder="List all office addresses (one per line)"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                rows="3"
              />
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
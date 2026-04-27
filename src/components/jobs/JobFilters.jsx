import React from 'react';
import { X } from 'lucide-react';

const industries = ['Technology', 'Finance', 'Healthcare', 'Education', 'Marketing', 'Design', 'Sales', 'Engineering', 'Legal', 'HR'];
const workModes = [{ value: 'remote', label: 'Remote' }, { value: 'hybrid', label: 'Hybrid' }, { value: 'onsite', label: 'Onsite' }];
const empTypes = [
  { value: 'full_time', label: 'Full-time' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'internship', label: 'Internship' },
];
const expRanges = ['0-1', '1-3', '3-5', '5-10', '10+'];
export const salaryRanges = [
  { label: 'Under $50k', min: 0, max: 50000 },
  { label: '$50k - $100k', min: 50000, max: 100000 },
  { label: '$100k - $150k', min: 100000, max: 150000 },
  { label: '$150k+', min: 150000, max: Infinity },
];
const postedRanges = [
  { value: '1', label: 'Last 24 hours' },
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 3 months' },
];
const companySizes = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];

function FilterSection({ title, children }) {
  return (
    <div className="border-b border-white/5 pb-4 mb-4">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{title}</p>
      {children}
    </div>
  );
}

function CheckGroup({ options, selected, onToggle, labelKey = 'label', valueKey = 'value' }) {
  return (
    <div className="space-y-1.5">
      {options.map(opt => {
        const val = typeof opt === 'string' ? opt : opt[valueKey];
        const label = typeof opt === 'string' ? opt : opt[labelKey];
        return (
          <label key={val} className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={selected.includes(val)}
              onChange={() => onToggle(val)}
              className="rounded border-white/20 bg-white/5 accent-indigo-500"
            />
            <span className="text-xs text-slate-400 group-hover:text-slate-200">{label}</span>
          </label>
        );
      })}
    </div>
  );
}

export default function JobFilters({ filters, onChange }) {
  const set = (key, val) => onChange({ ...filters, [key]: val });

  const toggle = (key, val) => {
    const cur = filters[key] || [];
    set(key, cur.includes(val) ? cur.filter(x => x !== val) : [...cur, val]);
  };

  const hasFilters = Object.values(filters).some(v => Array.isArray(v) ? v.length > 0 : !!v);

  return (
    <div className="w-52 flex-shrink-0 border-r border-white/10 bg-black/20 backdrop-blur-xl overflow-y-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <p className="font-semibold text-white text-sm">Filters</p>
        {hasFilters && (
          <button onClick={() => onChange({})} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
            <X className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      <FilterSection title="Posted Date">
        <div className="space-y-1.5">
          {postedRanges.map(p => (
            <label key={p.value} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="postedDate"
                checked={filters.postedDate === p.value}
                onChange={() => set('postedDate', filters.postedDate === p.value ? '' : p.value)}
                className="accent-indigo-500"
              />
              <span className="text-xs text-slate-400 group-hover:text-white transition-colors">{p.label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Work Mode">
        <CheckGroup options={workModes} selected={filters.workModes || []} onToggle={v => toggle('workModes', v)} />
      </FilterSection>

      <FilterSection title="Employment Type">
        <CheckGroup options={empTypes} selected={filters.empTypes || []} onToggle={v => toggle('empTypes', v)} />
      </FilterSection>

      <FilterSection title="Experience (years)">
        <CheckGroup options={expRanges} selected={filters.expRanges || []} onToggle={v => toggle('expRanges', v)} />
      </FilterSection>

      <FilterSection title="Salary Range">
        <div className="space-y-1.5">
          {salaryRanges.map(r => (
            <label key={r.label} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="salaryRange"
                checked={filters.salaryLabel === r.label}
                onChange={() => set('salaryLabel', filters.salaryLabel === r.label ? '' : r.label)}
                className="accent-indigo-500"
              />
              <span className="text-xs text-slate-400 group-hover:text-white transition-colors">{r.label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Industry">
        <CheckGroup options={industries} selected={filters.industries || []} onToggle={v => toggle('industries', v)} />
      </FilterSection>

      <FilterSection title="Company Size">
        <CheckGroup options={companySizes} selected={filters.companySizes || []} onToggle={v => toggle('companySizes', v)} />
      </FilterSection>

      <FilterSection title="Location / HQ">
        <input
          type="text"
          placeholder="e.g. New York, Remote"
          value={filters.location || ''}
          onChange={e => set('location', e.target.value)}
          className="w-full text-xs bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </FilterSection>

      <FilterSection title="Skills">
        <input
          type="text"
          placeholder="e.g. React, Python"
          value={filters.skills || ''}
          onChange={e => set('skills', e.target.value)}
          className="w-full text-xs bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </FilterSection>
    </div>
  );
}
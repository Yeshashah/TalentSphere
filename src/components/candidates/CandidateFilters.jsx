import React from 'react';
import { X } from 'lucide-react';

const expRanges = ['0-2', '3-5', '6-10', '10+'];
const educationLevels = ["Bachelor's", "Master's", "PhD", "Diploma", "High School", "Bootcamp"];
const skillSuggestions = ['React', 'Python', 'Node.js', 'Java', 'SQL', 'AWS', 'TypeScript', 'Go', 'Docker', 'Figma'];

function FilterSection({ title, children }) {
  return (
    <div className="border-b border-white/10 pb-4 mb-4">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{title}</p>
      {children}
    </div>
  );
}

function CheckGroup({ options, selected, onToggle }) {
  return (
    <div className="space-y-1.5">
      {options.map(opt => (
        <label key={opt} className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={selected.includes(opt)}
            onChange={() => onToggle(opt)}
            className="rounded border-white/20 bg-white/5 accent-indigo-500"
          />
          <span className="text-xs text-slate-400 group-hover:text-white transition-colors">{opt}</span>
        </label>
      ))}
    </div>
  );
}

export default function CandidateFilters({ filters, onChange }) {
  const set = (key, val) => onChange({ ...filters, [key]: val });

  const toggle = (key, val) => {
    const cur = filters[key] || [];
    set(key, cur.includes(val) ? cur.filter(x => x !== val) : [...cur, val]);
  };

  const hasFilters = Object.values(filters).some(v => Array.isArray(v) ? v.length > 0 : !!v);

  return (
    <div className="w-52 flex-shrink-0 border-r border-white/10 bg-white/5 backdrop-blur-md overflow-y-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <p className="font-semibold text-white text-sm">Filters</p>
        {hasFilters && (
          <button onClick={() => onChange({})} className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
            <X className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      <FilterSection title="Name">
        <input
          type="text"
          placeholder="Search by name..."
          value={filters.name || ''}
          onChange={e => set('name', e.target.value)}
          className="w-full text-xs border border-white/10 bg-white/5 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-500"
        />
      </FilterSection>

      <FilterSection title="Designation / Role">
        <input
          type="text"
          placeholder="e.g. Frontend Engineer"
          value={filters.designation || ''}
          onChange={e => set('designation', e.target.value)}
          className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-400"
        />
      </FilterSection>

      <FilterSection title="Experience (years)">
        <CheckGroup options={expRanges} selected={filters.expRanges || []} onToggle={v => toggle('expRanges', v)} />
      </FilterSection>

      <FilterSection title="Current / Previous Company">
        <input
          type="text"
          placeholder="e.g. Google, Startup"
          value={filters.company || ''}
          onChange={e => set('company', e.target.value)}
          className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-400"
        />
      </FilterSection>

      <FilterSection title="Skills">
        <input
          type="text"
          placeholder="e.g. React, Python"
          value={filters.skills || ''}
          onChange={e => set('skills', e.target.value)}
          className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-400"
        />
        {skillSuggestions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {skillSuggestions.map(s => (
              <button
                key={s}
                onClick={() => set('skills', filters.skills ? `${filters.skills}, ${s}` : s)}
                className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 text-slate-400 hover:border-indigo-500 hover:text-white transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </FilterSection>

      <FilterSection title="Education">
        <CheckGroup options={educationLevels} selected={filters.education || []} onToggle={v => toggle('education', v)} />
      </FilterSection>

      <FilterSection title="Open to Work">
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={filters.openToWork === true}
            onChange={() => set('openToWork', filters.openToWork ? undefined : true)}
            className="rounded border-white/20 bg-white/5 accent-indigo-500"
          />
          <span className="text-xs text-slate-400 group-hover:text-white transition-colors">Open to Work only</span>
        </label>
      </FilterSection>

      <FilterSection title="Location">
        <input
          type="text"
          placeholder="e.g. New York, Remote"
          value={filters.location || ''}
          onChange={e => set('location', e.target.value)}
          className="w-full text-xs border border-white/10 bg-white/5 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-500"
        />
      </FilterSection>
    </div>
  );
}
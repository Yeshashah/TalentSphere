import React, { useState } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const filterOptions = {
  workModes: ['Remote', 'Hybrid', 'Onsite'],
  experience: ['0-2 years', '3-5 years', '6-10 years', '10+ years'],
  teamSizes: ['1-10', '11-50', '51-200', '201-500', '500+'],
  roles: ['Software Engineer', 'Product Manager', 'Designer', 'Data Scientist', 'DevOps Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'QA Engineer', 'Tech Lead'],
  industries: ['Technology', 'Finance', 'Healthcare', 'E-commerce', 'SaaS', 'Startups', 'Consulting', 'Education', 'Media', 'Manufacturing'],
  skills: ['JavaScript', 'React', 'Python', 'Node.js', 'TypeScript', 'AWS', 'Docker', 'SQL', 'MongoDB', 'Vue.js', 'Angular', 'Java', 'Go', 'Rust', 'Machine Learning'],
};

export default function JobFilters({ onFilterChange }) {
  const [selectedWorkModes, setSelectedWorkModes] = useState([]);
  const [selectedExperience, setSelectedExperience] = useState([]);
  const [selectedTeamSizes, setSelectedTeamSizes] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');

  const handleFilterChange = () => {
    onFilterChange({
      workModes: selectedWorkModes,
      experience: selectedExperience,
      teamSizes: selectedTeamSizes,
      roles: selectedRoles,
      industries: selectedIndustries,
      skills: selectedSkills,
      salaryMin: salaryMin ? parseInt(salaryMin) : null,
      salaryMax: salaryMax ? parseInt(salaryMax) : null,
    });
  };

  const toggleItem = (item, state, setState) => {
    const newState = state.includes(item) ? state.filter(i => i !== item) : [...state, item];
    setState(newState);
  };

  React.useEffect(() => {
    handleFilterChange();
  }, [selectedWorkModes, selectedExperience, selectedTeamSizes, selectedRoles, selectedIndustries, selectedSkills, salaryMin, salaryMax]);

  const allSelectedCount = selectedWorkModes.length + selectedExperience.length + selectedTeamSizes.length + selectedRoles.length + selectedIndustries.length + selectedSkills.length + (salaryMin ? 1 : 0) + (salaryMax ? 1 : 0);

  const FilterSection = ({ title, options, selected, setState }) => (
    <div className="space-y-3">
      <h4 className="font-semibold text-sm text-slate-900">{title}</h4>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {options.map(option => (
          <div key={option} className="flex items-center gap-2">
            <Checkbox
              id={option}
              checked={selected.includes(option)}
              onCheckedChange={() => {
                toggleItem(option, selected, setState);
              }}
            />
            <Label htmlFor={option} className="text-sm cursor-pointer font-normal">
              {option}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {/* Work Mode */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              Work Mode {selectedWorkModes.length > 0 && <Badge variant="secondary">{selectedWorkModes.length}</Badge>}
              <ChevronDown className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56">
            <FilterSection title="Work Mode" options={filterOptions.workModes} selected={selectedWorkModes} setState={setSelectedWorkModes} />
          </PopoverContent>
        </Popover>

        {/* Experience */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              Experience {selectedExperience.length > 0 && <Badge variant="secondary">{selectedExperience.length}</Badge>}
              <ChevronDown className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56">
            <FilterSection title="Experience Required" options={filterOptions.experience} selected={selectedExperience} setState={setSelectedExperience} />
          </PopoverContent>
        </Popover>

        {/* Team Size */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              Team Size {selectedTeamSizes.length > 0 && <Badge variant="secondary">{selectedTeamSizes.length}</Badge>}
              <ChevronDown className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56">
            <FilterSection title="Team Size" options={filterOptions.teamSizes} selected={selectedTeamSizes} setState={setSelectedTeamSizes} />
          </PopoverContent>
        </Popover>

        {/* Role */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              Role {selectedRoles.length > 0 && <Badge variant="secondary">{selectedRoles.length}</Badge>}
              <ChevronDown className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56">
            <FilterSection title="Role" options={filterOptions.roles} selected={selectedRoles} setState={setSelectedRoles} />
          </PopoverContent>
        </Popover>

        {/* Industry */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              Industry {selectedIndustries.length > 0 && <Badge variant="secondary">{selectedIndustries.length}</Badge>}
              <ChevronDown className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56">
            <FilterSection title="Industry" options={filterOptions.industries} selected={selectedIndustries} setState={setSelectedIndustries} />
          </PopoverContent>
        </Popover>

        {/* Skills */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              Skills {selectedSkills.length > 0 && <Badge variant="secondary">{selectedSkills.length}</Badge>}
              <ChevronDown className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56">
            <FilterSection title="Skills" options={filterOptions.skills} selected={selectedSkills} setState={setSelectedSkills} />
          </PopoverContent>
        </Popover>

        {/* Salary Range */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              Salary {(salaryMin || salaryMax) && <Badge variant="secondary">2</Badge>}
              <ChevronDown className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56">
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-slate-900">Salary Range</h4>
              <div className="space-y-2">
                <Input
                  type="number"
                  placeholder="Min salary (K)"
                  value={salaryMin}
                  onChange={e => setSalaryMin(e.target.value)}
                  className="h-9"
                />
                <Input
                  type="number"
                  placeholder="Max salary (K)"
                  value={salaryMax}
                  onChange={e => setSalaryMax(e.target.value)}
                  className="h-9"
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filters */}
      {allSelectedCount > 0 && (
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          {selectedWorkModes.map(mode => (
            <Badge key={`mode-${mode}`} variant="secondary" className="gap-1">
              {mode}
              <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedWorkModes(selectedWorkModes.filter(m => m !== mode))} />
            </Badge>
          ))}
          {selectedExperience.map(exp => (
            <Badge key={`exp-${exp}`} variant="secondary" className="gap-1">
              {exp}
              <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedExperience(selectedExperience.filter(e => e !== exp))} />
            </Badge>
          ))}
          {selectedTeamSizes.map(size => (
            <Badge key={`size-${size}`} variant="secondary" className="gap-1">
              {size}
              <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedTeamSizes(selectedTeamSizes.filter(s => s !== size))} />
            </Badge>
          ))}
          {selectedRoles.map(role => (
            <Badge key={`role-${role}`} variant="secondary" className="gap-1">
              {role}
              <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedRoles(selectedRoles.filter(r => r !== role))} />
            </Badge>
          ))}
          {selectedIndustries.map(ind => (
            <Badge key={`ind-${ind}`} variant="secondary" className="gap-1">
              {ind}
              <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedIndustries(selectedIndustries.filter(i => i !== ind))} />
            </Badge>
          ))}
          {selectedSkills.map(skill => (
            <Badge key={`skill-${skill}`} variant="secondary" className="gap-1">
              {skill}
              <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedSkills(selectedSkills.filter(s => s !== skill))} />
            </Badge>
          ))}
          {salaryMin && (
            <Badge variant="secondary" className="gap-1">
              Min: ${salaryMin}K
              <X className="w-3 h-3 cursor-pointer" onClick={() => setSalaryMin('')} />
            </Badge>
          )}
          {salaryMax && (
            <Badge variant="secondary" className="gap-1">
              Max: ${salaryMax}K
              <X className="w-3 h-3 cursor-pointer" onClick={() => setSalaryMax('')} />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
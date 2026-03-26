import React, { useState } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const filterOptions = {
  titles: ['Software Engineer', 'Product Manager', 'Designer', 'Data Scientist', 'DevOps Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'QA Engineer', 'Tech Lead'],
  locations: ['Remote', 'New York', 'San Francisco', 'London', 'India', 'Toronto', 'Austin', 'Seattle', 'Boston', 'Los Angeles'],
  industries: ['Technology', 'Finance', 'Healthcare', 'E-commerce', 'SaaS', 'Startups', 'Consulting', 'Education', 'Media', 'Manufacturing'],
  skills: ['JavaScript', 'React', 'Python', 'Node.js', 'TypeScript', 'AWS', 'Docker', 'SQL', 'MongoDB', 'Vue.js', 'Angular', 'Java', 'Go', 'Rust', 'Machine Learning'],
  experience: ['0-2 years', '3-5 years', '6-10 years', '10+ years'],
};

export default function CandidateFilters({ onFilterChange }) {
  const [search, setSearch] = useState('');
  const [selectedTitles, setSelectedTitles] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedExperience, setSelectedExperience] = useState([]);

  const handleFilterChange = () => {
    onFilterChange({
      search,
      titles: selectedTitles,
      locations: selectedLocations,
      industries: selectedIndustries,
      skills: selectedSkills,
      experience: selectedExperience,
    });
  };

  const toggleItem = (item, state, setState) => {
    const newState = state.includes(item)
      ? state.filter(i => i !== item)
      : [...state, item];
    setState(newState);
  };

  React.useEffect(() => {
    handleFilterChange();
  }, [search, selectedTitles, selectedLocations, selectedIndustries, selectedSkills, selectedExperience]);

  const allSelectedCount = selectedTitles.length + selectedLocations.length + selectedIndustries.length + selectedSkills.length + selectedExperience.length;

  const FilterSection = ({ title, options, selected, onToggle }) => (
    <div className="space-y-3">
      <h4 className="font-semibold text-sm text-slate-900">{title}</h4>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {options.map(option => (
          <div key={option} className="flex items-center gap-2">
            <Checkbox
              id={option}
              checked={selected.includes(option)}
              onCheckedChange={() => onToggle(option, selected, (newState) => {
                setState(newState);
                handleFilterChange();
              })}
            />
            <Label htmlFor={option} className="text-sm cursor-pointer font-normal">
              {option}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );

  const setState = (value) => {}; // Placeholder for toggle callback

  return (
    <div className="space-y-4">
      {/* Search */}
      <Input
        placeholder="Search by name..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="h-10 rounded-xl"
      />

      {/* Filter Popovers */}
      <div className="flex flex-wrap gap-2">
        {/* Title/Position */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              Title {selectedTitles.length > 0 && <Badge variant="secondary">{selectedTitles.length}</Badge>}
              <ChevronDown className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56">
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Title / Position</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {filterOptions.titles.map(title => (
                  <div key={title} className="flex items-center gap-2">
                    <Checkbox
                      id={`title-${title}`}
                      checked={selectedTitles.includes(title)}
                      onCheckedChange={() => {
                        toggleItem(title, selectedTitles, setSelectedTitles);
                      }}
                    />
                    <Label htmlFor={`title-${title}`} className="text-sm cursor-pointer font-normal">
                      {title}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Location */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              Location {selectedLocations.length > 0 && <Badge variant="secondary">{selectedLocations.length}</Badge>}
              <ChevronDown className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56">
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Location</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {filterOptions.locations.map(location => (
                  <div key={location} className="flex items-center gap-2">
                    <Checkbox
                      id={`location-${location}`}
                      checked={selectedLocations.includes(location)}
                      onCheckedChange={() => {
                        toggleItem(location, selectedLocations, setSelectedLocations);
                      }}
                    />
                    <Label htmlFor={`location-${location}`} className="text-sm cursor-pointer font-normal">
                      {location}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
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
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Skills</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {filterOptions.skills.map(skill => (
                  <div key={skill} className="flex items-center gap-2">
                    <Checkbox
                      id={`skill-${skill}`}
                      checked={selectedSkills.includes(skill)}
                      onCheckedChange={() => {
                        toggleItem(skill, selectedSkills, setSelectedSkills);
                      }}
                    />
                    <Label htmlFor={`skill-${skill}`} className="text-sm cursor-pointer font-normal">
                      {skill}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
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
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Years of Experience</h4>
              <div className="space-y-2">
                {filterOptions.experience.map(exp => (
                  <div key={exp} className="flex items-center gap-2">
                    <Checkbox
                      id={`exp-${exp}`}
                      checked={selectedExperience.includes(exp)}
                      onCheckedChange={() => {
                        toggleItem(exp, selectedExperience, setSelectedExperience);
                      }}
                    />
                    <Label htmlFor={`exp-${exp}`} className="text-sm cursor-pointer font-normal">
                      {exp}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
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
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Industry</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {filterOptions.industries.map(industry => (
                  <div key={industry} className="flex items-center gap-2">
                    <Checkbox
                      id={`industry-${industry}`}
                      checked={selectedIndustries.includes(industry)}
                      onCheckedChange={() => {
                        toggleItem(industry, selectedIndustries, setSelectedIndustries);
                      }}
                    />
                    <Label htmlFor={`industry-${industry}`} className="text-sm cursor-pointer font-normal">
                      {industry}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filters */}
      {allSelectedCount > 0 && (
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          {selectedTitles.map(title => (
            <Badge key={`title-${title}`} variant="secondary" className="gap-1">
              {title}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => setSelectedTitles(selectedTitles.filter(t => t !== title))}
              />
            </Badge>
          ))}
          {selectedLocations.map(location => (
            <Badge key={`location-${location}`} variant="secondary" className="gap-1">
              {location}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => setSelectedLocations(selectedLocations.filter(l => l !== location))}
              />
            </Badge>
          ))}
          {selectedSkills.map(skill => (
            <Badge key={`skill-${skill}`} variant="secondary" className="gap-1">
              {skill}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => setSelectedSkills(selectedSkills.filter(s => s !== skill))}
              />
            </Badge>
          ))}
          {selectedExperience.map(exp => (
            <Badge key={`exp-${exp}`} variant="secondary" className="gap-1">
              {exp}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => setSelectedExperience(selectedExperience.filter(e => e !== exp))}
              />
            </Badge>
          ))}
          {selectedIndustries.map(industry => (
            <Badge key={`industry-${industry}`} variant="secondary" className="gap-1">
              {industry}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => setSelectedIndustries(selectedIndustries.filter(i => i !== industry))}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
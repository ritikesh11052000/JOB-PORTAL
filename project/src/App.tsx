import React, { useState, useEffect, useRef } from 'react';

// Enum for company types and job age
enum CompanyScale {
  STARTUP = "Startup",
  MIDSCALE = "Mid-Scale",
  MNC = "Multinational Corporation",
  SME = "Small & Medium Enterprise"
}

enum JobAge {
  ONE_DAY = "1 Day",
  THREE_DAYS = "3 Days",
  ONE_WEEK = "1 Week",
  TWO_WEEKS = "2 Weeks",
  ONE_MONTH = "1 Month"
}

interface JobPosting {
  id: string;
  title: string;
  company: string;
  companyScale: CompanyScale;
  description: string;
  applyLink: string;
  datePosted: number;
  location: string;
  country: string;
  industry: string;
  salary?: string;
  companyCareerSite?: string;
  sourceUrl?: string;
}

// Custom dropdown component
function CustomDropdown({ 
  options, 
  placeholder, 
  multiple = false, 
  icon, 
  onChange, 
  selectedValues,
  darkMode = false
}: {
  options: { value: string; label: string; icon?: string }[];
  placeholder: string;
  multiple?: boolean;
  icon?: string;
  onChange: (values: string[]) => void;
  selectedValues?: string[];
  darkMode?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(option => 
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOptionClick = (value: string) => {
    if (multiple) {
      const currentValues = selectedValues || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      onChange(newValues);
    } else {
      onChange([value]);
      setIsOpen(false);
    }
  };

  const getDisplayText = () => {
    if (multiple) {
      return selectedValues && selectedValues.length > 0
        ? `${selectedValues.length} selected`
        : placeholder;
    }
    const selectedOption = options.find(opt => 
      selectedValues && selectedValues[0] === opt.value
    );
    return selectedOption ? selectedOption.label : placeholder;
  };

  return (
    <div className="custom-dropdown relative" ref={dropdownRef}>
      <div 
        className={`dropdown-header border p-2 rounded cursor-pointer ${darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-800 border-gray-300'}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {icon && <span className="dropdown-icon mr-2">{icon}</span>}
        <span className="dropdown-text">{getDisplayText()}</span>
        <span className="dropdown-arrow float-right">
          {isOpen ? '▲' : '▼'}
        </span>
      </div>
      {isOpen && (
        <div className={`dropdown-list absolute z-10 border rounded mt-1 w-full shadow-lg ${darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-800 border-gray-300'}`}>
          <input 
            type="text" 
            placeholder="Search..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full p-2 border-b ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-200'}`}
          />
          {filteredOptions.map(option => (
            <div 
              key={option.value} 
              className={`p-2 cursor-pointer ${
                (multiple 
                  ? selectedValues?.includes(option.value) 
                  : selectedValues?.[0] === option.value) 
                  ? (darkMode ? 'bg-gray-600' : 'bg-gray-200')
                  : ''
              } ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              onClick={() => handleOptionClick(option.value)}
            >
              {option.icon && <span className="mr-2">{option.icon}</span>}
              {option.label}
              {multiple && (
                <span className="float-right">
                  {selectedValues?.includes(option.value) ? '✓' : ''}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Utility function to calculate job age
function calculateJobAge(postDateTimestamp: number): string {
  const postDate = new Date(postDateTimestamp);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - postDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 1) return JobAge.ONE_DAY;
  if (diffDays <= 3) return JobAge.THREE_DAYS;
  if (diffDays <= 7) return JobAge.ONE_WEEK;
  if (diffDays <= 14) return JobAge.TWO_WEEKS;
  return JobAge.ONE_MONTH;
}

function JobBoard() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [sortBy, setSortBy] = useState("date");
  const [page, setPage] = useState(1);
  const jobsPerPage = 6;
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);

  const [filters, setFilters] = useState({
    companyScale: [] as CompanyScale[],
    country: '',
    industry: '',
    jobAge: '' as JobAge
  });

  // Apply dark mode to body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
      document.body.style.backgroundColor = '#1a1a1a';
      document.body.style.color = '#ffffff';
    } else {
      document.body.classList.remove('dark-mode');
      document.body.style.backgroundColor = '#ffffff';
      document.body.style.color = '#333333';
    }
  }, [darkMode]);

  // Mock jobs data
  const mockJobs: JobPosting[] = [
    {
      id: '1',
      title: 'Software Engineer',
      company: 'Tech Innovations Inc.',
      companyScale: CompanyScale.STARTUP,
      description: 'Exciting opportunity for a passionate software engineer to join our innovative team.',
      applyLink: 'https://example.com/apply/1',
      datePosted: Date.now() - (24 * 60 * 60 * 1000), // 1 day ago
      location: 'San Francisco, CA',
      country: 'USA',
      industry: 'Tech'
    },
    {
      id: '2',
      title: 'Product Manager',
      company: 'Global Solutions Corp',
      companyScale: CompanyScale.MNC,
      description: 'Lead product strategy and drive innovation in a global environment.',
      applyLink: 'https://example.com/apply/2',
      datePosted: Date.now() - (3 * 24 * 60 * 60 * 1000), // 3 days ago
      location: 'New York, NY',
      country: 'USA',
      industry: 'Finance',
      salary: '$120,000 - $150,000'
    },
    {
      id: '3',
      title: 'Data Scientist',
      company: 'Healthcare Innovations',
      companyScale: CompanyScale.MIDSCALE,
      description: 'Apply advanced analytics to solve complex healthcare challenges.',
      applyLink: 'https://example.com/apply/3',
      datePosted: Date.now() - (7 * 24 * 60 * 60 * 1000), // 1 week ago
      location: 'Boston, MA',
      country: 'USA',
      industry: 'Healthcare'
    },
    {
      id: '4',
      title: 'UX Designer',
      company: 'Creative Solutions Ltd',
      companyScale: CompanyScale.SME,
      description: 'Design intuitive and engaging user experiences for cutting-edge products.',
      applyLink: 'https://example.com/apply/4',
      datePosted: Date.now() - (14 * 24 * 60 * 60 * 1000), // 2 weeks ago
      location: 'Austin, TX',
      country: 'USA',
      industry: 'Tech'
    },
    {
      id: '5',
      title: 'Marketing Specialist',
      company: 'Global Brands Inc.',
      companyScale: CompanyScale.MNC,
      description: 'Drive marketing strategies for international brand expansion.',
      applyLink: 'https://example.com/apply/5',
      datePosted: Date.now() - (30 * 24 * 60 * 60 * 1000), // 1 month ago
      location: 'Chicago, IL',
      country: 'USA',
      industry: 'Marketing'
    }
  ];

  // Enhanced filter options with icons
  const companyScaleOptions = Object.values(CompanyScale).map(scale => ({
    value: scale,
    label: scale,
    icon: scale === CompanyScale.STARTUP ? '🚀' : 
           scale === CompanyScale.MIDSCALE ? '🏢' : 
           scale === CompanyScale.MNC ? '🌐' : '🏭'
  }));

  const countryOptions = [
    { value: 'USA', label: 'United States', icon: '🇺🇸' },
    { value: 'India', label: 'India', icon: '🇮🇳' },
    { value: 'UK', label: 'United Kingdom', icon: '🇬🇧' },
    { value: 'Canada', label: 'Canada', icon: '🇨🇦' },
    { value: 'Australia', label: 'Australia', icon: '🇦🇺' }
  ];

  const industryOptions = [
    { value: 'Tech', label: 'Technology', icon: '💻' },
    { value: 'Finance', label: 'Finance', icon: '💰' },
    { value: 'Healthcare', label: 'Healthcare', icon: '🏥' },
    { value: 'Education', label: 'Education', icon: '📚' }
  ];

  const jobAgeOptions = Object.values(JobAge).map(age => ({
    value: age,
    label: age,
    icon: age === JobAge.ONE_DAY ? '🕐' : 
           age === JobAge.THREE_DAYS ? '📅' : 
           age === JobAge.ONE_WEEK ? '🗓️' : 
           age === JobAge.TWO_WEEKS ? '📆' : '⏳'
  }));

  useEffect(() => {
    // Simulate API call with mock data
    const fetchJobs = () => {
      // Apply filters to mock jobs
      let filteredJobs = mockJobs.filter(job => {
        const matchesCompanyScale = filters.companyScale.length === 0 || 
          filters.companyScale.includes(job.companyScale);
        
        const matchesCountry = !filters.country || job.country === filters.country;
        
        const matchesIndustry = !filters.industry || job.industry === filters.industry;
        
        const matchesJobAge = !filters.jobAge || 
          calculateJobAge(job.datePosted) === filters.jobAge;
        
        const matchesSearch = !searchQuery || 
          job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.company.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesCompanyScale && 
               matchesCountry && 
               matchesIndustry && 
               matchesJobAge && 
               matchesSearch;
      });

      // Sort jobs
      if (sortBy === 'date') {
        filteredJobs.sort((a, b) => b.datePosted - a.datePosted);
      }

      // Paginate jobs
      const startIndex = (page - 1) * jobsPerPage;
      const paginatedJobs = filteredJobs.slice(startIndex, startIndex + jobsPerPage);

      setJobs(paginatedJobs);
      setLoading(false);
    };

    fetchJobs();
  }, [filters, searchQuery, sortBy, page]);

  const handleFilterChange = (filterType: string, value: string | CompanyScale[]) => {
    setFilters(prev => {
      if (filterType === 'companyScale') {
        return {
          ...prev,
          [filterType]: Array.isArray(value) ? value : [value]
        };
      }
      return {
        ...prev,
        [filterType]: value
      };
    });
  };

  const handleFavorite = (jobId: string) => {
    setFavorites(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId) 
        : [...prev, jobId]
    );
  };

  const handleJobDetails = (job: JobPosting) => {
    setSelectedJob(job);
  };

  const closeJobDetails = () => {
    setSelectedJob(null);
  };

  const handlePagination = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <div className={`min-h-screen w-full ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <header className={`border-b-4 ${darkMode ? 'border-gray-700' : 'border-black'} mb-6 pb-4`}>
          <h1 className="text-3xl md:text-4xl font-bold text-center tracking-wider uppercase">
            Job Chronicle
          </h1>
          <p className="text-center italic text-sm">
            Your Daily Digest of Professional Opportunities
          </p>
        </header>

        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className={`px-4 py-2 rounded mb-4 sm:mb-0 ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'}`}
          >
            {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
          <div className={`text-sm italic ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {new Date().toLocaleDateString()}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
          <div className="md:col-span-8">
            <input 
              type="text" 
              placeholder="Search job listings..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full px-4 py-2 border rounded ${darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-800 border-gray-300'}`}
            />
          </div>
          <div className="md:col-span-4">
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className={`w-full px-4 py-2 border rounded ${darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-800 border-gray-300'}`}
            >
              <option value="date">Sort by Date</option>
              <option value="relevance">Sort by Relevance</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <CustomDropdown 
            options={companyScaleOptions}
            placeholder="Company Scale"
            multiple
            onChange={(values) => handleFilterChange('companyScale', values)}
            selectedValues={filters.companyScale}
            darkMode={darkMode}
          />
          <CustomDropdown 
            options={countryOptions}
            placeholder="Country"
            onChange={(values) => handleFilterChange('country', values[0])}
            selectedValues={filters.country ? [filters.country] : []}
            darkMode={darkMode}
          />
          <CustomDropdown 
            options={industryOptions}
            placeholder="Industry"
            onChange={(values) => handleFilterChange('industry', values[0])}
            selectedValues={filters.industry ? [filters.industry] : []}
            darkMode={darkMode}
          />
          <CustomDropdown 
            options={jobAgeOptions}
            placeholder="Job Age"
            onChange={(values) => handleFilterChange('jobAge', values[0] as JobAge)}
            selectedValues={filters.jobAge ? [filters.jobAge] : []}
            darkMode={darkMode}
          />
        </div>

        {loading ? (
          <div className="text-center py-8">Loading jobs...</div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-8">No jobs found</div>
        ) : (
          <>
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobs.map(job => (
                <div 
                  key={job.id} 
                  className={`border rounded p-4 hover:shadow-lg transition cursor-pointer ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}
                  onClick={() => handleJobDetails(job)}
                >
                  <div className="flex justify-between items-start">
                    <h2 className="text-lg font-semibold">{job.title}</h2>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFavorite(job.id);
                      }}
                      className={`${favorites.includes(job.id) ? 'text-red-500' : darkMode ? 'text-gray-400' : 'text-gray-500'}`}
                    >
                      ❤️
                    </button>
                  </div>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{job.company}</p>
                  <div className="mt-2 flex justify-between text-xs text-gray-500">
                    <span className={darkMode ? 'text-gray-400' : ''}>{job.location}</span>
                    <span className={darkMode ? 'text-gray-400' : ''}>{calculateJobAge(job.datePosted)}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-6 space-x-2 flex-wrap">
              {[...Array(Math.ceil(mockJobs.length / jobsPerPage)).keys()].map(pageNum => (
                <button 
                  key={pageNum} 
                  onClick={() => handlePagination(pageNum + 1)}
                  className={`px-3 py-1 m-1 rounded ${
                    page === pageNum + 1 
                      ? 'bg-blue-500 text-white' 
                      : darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {pageNum + 1}
                </button>
              ))}
            </div>
          </>
        )}

        {selectedJob && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`p-6 rounded-lg max-w-lg w-full ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">{selectedJob.title}</h2>
                <button onClick={closeJobDetails} className={darkMode ? 'text-gray-300' : 'text-gray-500'}>✖️</button>
              </div>
              <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{selectedJob.description}</p>
              <div className="mt-4 space-y-2">
                <p><strong>Company:</strong> {selectedJob.company}</p>
                <p><strong>Location:</strong> {selectedJob.location}</p>
                {selectedJob.salary && <p><strong>Salary:</strong> {selectedJob.salary}</p>}
                <a 
                  href={selectedJob.applyLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block mt-4 px-4 py-2 bg-blue-500 text-white rounded text-center"
                >
                  Apply Now
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  return <JobBoard />;
}

export default App;
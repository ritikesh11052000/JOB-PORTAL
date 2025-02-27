import { useState, useEffect, useRef } from 'react'

// Custom dropdown component
const CustomDropdown: React.FC<{
  options: { value: string; label: string; icon?: string }[];
  placeholder: string;
  multiple?: boolean;
  icon?: string;
  onChange: (values: string[]) => void;
  selectedValues?: string[];
}> = ({ options, placeholder, multiple = false, icon, onChange, selectedValues }) => {
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
        className="dropdown-header bg-white border p-2 rounded cursor-pointer" 
        onClick={() => setIsOpen(!isOpen)}
      >
        {icon && <span className="dropdown-icon mr-2">{icon}</span>}
        <span className="dropdown-text">{getDisplayText()}</span>
        <span className="dropdown-arrow float-right">
          {isOpen ? '▲' : '▼'}
        </span>
      </div>
      {isOpen && (
        <div className="dropdown-list absolute z-10 bg-white border rounded mt-1 w-full shadow-lg">
          <input 
            type="text" 
            placeholder="Search..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border-b"
          />
          {filteredOptions.map(option => (
            <div 
              key={option.value} 
              className={`p-2 hover:bg-gray-100 cursor-pointer ${
                (multiple 
                  ? selectedValues?.includes(option.value) 
                  : selectedValues?.[0] === option.value) 
                  ? 'bg-gray-200' 
                  : ''
              }`}
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
};

export default CustomDropdown;
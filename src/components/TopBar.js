import React, { useState } from 'react';
import { Filter, Check, Search, X } from 'lucide-react';

const filterOptions = [
    { label: 'All Status', value: '' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' }
];

const TopBar = ({ title, searchText, setSearchText, selectedFilter, setSelectedFilter }) => {
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);

    const handleFilterSelect = (value) => {
        setSelectedFilter(value);
        setShowFilterDropdown(false);
    };

    const getLabel = (value) => {
        return filterOptions.find(opt => opt.value === value)?.label || 'All Status';
    };

    const clearSearch = () => {
        setSearchText('');
    };

    return (
        <div className="page-header">
            <div>
                <h1 className="page-title">{title}</h1>
                <p className="text-gray-600 text-sm mt-1">Manage and configure your {title.toLowerCase()}</p>
            </div>
            
            <div className="flex items-center gap-3">
                {/* Search Input */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        className="pl-10 pr-10 py-2.5 w-80 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                        placeholder={`Search ${title.toLowerCase()}...`}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                    {searchText && (
                        <button
                            onClick={clearSearch}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Filter Dropdown */}
                <div className="relative">
                    <button
                        className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                        onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                    >
                        <Filter className="w-4 h-4" />
                        <span>{getLabel(selectedFilter)}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${showFilterDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {showFilterDropdown && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
                            {filterOptions.map(({ label, value }) => (
                                <button
                                    key={value}
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center justify-between ${
                                        selectedFilter === value ? 'bg-orange-50 text-orange-600' : 'text-gray-700'
                                    }`}
                                    onClick={() => handleFilterSelect(value)}
                                >
                                    {label}
                                    {selectedFilter === value && <Check className="w-4 h-4" />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TopBar;
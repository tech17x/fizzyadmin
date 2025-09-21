import React, { useState } from 'react';
import { Filter, Check, Search } from 'lucide-react';

const filterOptions = [
    { label: 'All', value: '' },
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

    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <div className="flex items-center gap-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors w-64"
                        placeholder="Search..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                </div>

                <div className="relative">
                    <button
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                    >
                        <Filter size={14} />
                        <span className="text-sm">{getLabel(selectedFilter)}</span>
                    </button>

                    {showFilterDropdown && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                            {filterOptions.map(({ label, value }) => (
                                <button
                                    key={value}
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center justify-between ${
                                        selectedFilter === value ? 'bg-orange-50 text-orange-600' : 'text-gray-700'
                                    }`}
                                    onClick={() => handleFilterSelect(value)}
                                >
                                    {label}
                                    {selectedFilter === value && <Check size={16} />}
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

                    </div>

                    {showFilterDropdown && (
                        <div className="filter-dropdown">
                            {filterOptions.map(({ label, value }) => (
                                <div
                                    key={value}
                                    className={`filter-option ${selectedFilter === value ? 'selected' : ''}`}
                                    onClick={() => handleFilterSelect(value)}
                                >
                                    {label}
                                    {selectedFilter === value && <Check className="check-icon" size={16} />}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TopBar;

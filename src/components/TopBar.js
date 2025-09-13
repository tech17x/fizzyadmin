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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Manage your {title.toLowerCase()} efficiently with our comprehensive tools
                    </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            className="pl-10 pr-4 py-2 w-full sm:w-80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
                            placeholder={`Search ${title.toLowerCase()}...`}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                    </div>

                    {/* Filter Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors duration-200"
                        >
                            <Filter className="h-4 w-4 mr-2" />
                            {getLabel(selectedFilter)}
                        </button>

                        {showFilterDropdown && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                <div className="py-1">
                                    {filterOptions.map(({ label, value }) => (
                                        <button
                                            key={value}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${
                                                selectedFilter === value ? 'text-orange-600 bg-orange-50' : 'text-gray-700'
                                            }`}
                                            onClick={() => handleFilterSelect(value)}
                                        >
                                            {label}
                                            {selectedFilter === value && <Check className="h-4 w-4" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopBar;
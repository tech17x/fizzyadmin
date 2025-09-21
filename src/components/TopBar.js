import React, { useState } from 'react';
import { Filter, Check, Search, X, ChevronDown } from 'lucide-react';

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
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">{title}</h1>
                    <p className="text-slate-600">Manage and configure your {title.toLowerCase()}</p>
                </div>
                
                <div className="flex items-center gap-4">
                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                            type="text"
                            className="pl-12 pr-12 py-3 w-80 border-2 border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            placeholder={`Search ${title.toLowerCase()}...`}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                        {searchText && (
                            <button
                                onClick={clearSearch}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    {/* Filter Dropdown */}
                    <div className="relative">
                        <button
                            className="flex items-center gap-3 px-4 py-3 border-2 border-slate-200 rounded-xl hover:bg-slate-50 transition-all duration-200 text-sm font-medium min-w-[140px]"
                            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                        >
                            <Filter className="w-4 h-4 text-slate-500" />
                            <span className="text-slate-700">{getLabel(selectedFilter)}</span>
                            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showFilterDropdown ? 'rotate-180' : ''}`} />
                        </button>

                        {showFilterDropdown && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border-2 border-slate-200 rounded-xl shadow-lg z-50 py-2">
                                {filterOptions.map(({ label, value }) => (
                                    <button
                                        key={value}
                                        className={`w-full text-left px-4 py-3 text-sm hover:bg-slate-50 transition-colors flex items-center justify-between ${
                                            selectedFilter === value ? 'bg-blue-50 text-blue-600 font-medium' : 'text-slate-700'
                                        }`}
                                        onClick={() => handleFilterSelect(value)}
                                    >
                                        {label}
                                        {selectedFilter === value && <Check className="w-4 h-4 text-blue-600" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopBar;
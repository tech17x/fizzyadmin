import React, { useState } from 'react';
import { Filter, Check } from 'lucide-react';
import './TopBar.css';

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
        <div className="topbar">
            <div className="page-heading">{title}</div>
            <div className="toolbar">

                <input
                    type="text"
                    className="search-input"
                    placeholder="Search..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                />

                <div className="filter-container">
                    <div className="filter-wrapper" onClick={() => setShowFilterDropdown(!showFilterDropdown)}>
                        <Filter className="icon" size={14} />
                        <span className="filter-name">{getLabel(selectedFilter)}</span>
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

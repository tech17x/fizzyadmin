import React from 'react';
import './SearchFilterBar.css';

const SearchFilterBar = ({
  placeholder,
  searchValue,
  onSearchChange,
  statusValue,
  onStatusChange,
}) => {
  return (
    <div className="search-filter-bar">
      <input
        type="text"
        placeholder={placeholder}
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        className="search-input"
      />

      <select
        value={statusValue}
        onChange={(e) => onStatusChange(e.target.value)}
        className="filter-select"
      >
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
    </div>
  );
};

export default SearchFilterBar;

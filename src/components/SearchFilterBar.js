import React from 'react';
import './SearchFilterBar.css';
import InputField from './InputField';
import SelectInput from './SelectInput';

const SearchFilterBar = ({
  searchValue,
  onSearchChange,
  statusValue,
  onStatusChange,
}) => {
  return (
    <div className="search-filter-bar">
      <h2>Brand</h2>
      <div>
        <InputField
          type={'text'}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={"Find what you're looking for..."}
        />

        <SelectInput
          selectedOption={statusValue}
          onChange={(value) => console.log(value)}
          options={[
            { label: "All Status", value: "" },
            { label: "Active", value: "active" },
            { label: "Inactive", value: "inactive" }
          ]}
        />
      </div>
    </div>
  );
};

export default SearchFilterBar;

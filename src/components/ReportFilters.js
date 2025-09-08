import React from 'react';
import SelectInput from '../components/SelectInput.js';
import DateRangeFilter from './DateRangeFilter.js';

export default function ReportFilters({
    brands,
    outlets,
    filteredOutlets,
    selectedBrand,
    selectedOutlet,
    dateRange,
    onBrandChange,
    onOutletChange,
    onDateRangeChange,
    loading = false,
}) {
    return (
        <div className="card p-6 space-y-4 flex flex-wrap items-center gap-4">
            <SelectInput
                label="Select Brand"
                selectedOption={selectedBrand}
                onChange={onBrandChange}
                options={brands.map(b => ({ label: b.full_name, value: b._id }))}
                disabled={loading}
            />
            <SelectInput
                label="Select Outlet"
                selectedOption={selectedOutlet}
                onChange={onOutletChange}
                options={filteredOutlets.map(o => ({ label: o.name, value: o._id }))}
                disabled={loading || !selectedBrand}
            />
            <DateRangeFilter value={dateRange} onChange={onDateRangeChange} />
        </div>
    );
}

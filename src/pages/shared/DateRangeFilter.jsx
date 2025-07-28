import React from 'react';
import { Calendar } from 'lucide-react';

export default function DateRangeFilter({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center">
        <Calendar size={16} className="mr-2 text-gray-500" />
        <span className="text-sm text-gray-600 mr-2">From:</span>
        <input
          type="date"
          value={value.start}
          onChange={(e) => onChange({ ...value, start: e.target.value })}
          className="input"
        />
      </div>
      <span className="text-gray-500">to</span>
      <input
        type="date"
        value={value.end}
        onChange={(e) => onChange({ ...value, end: e.target.value })}
        className="input"
      />
    </div>
  );
}
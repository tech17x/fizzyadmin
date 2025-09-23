import React from "react";
import { Calendar } from "lucide-react";

export default function DateRangeFilter({ value, onChange }) {
  return (
    <div className="w-full flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">Select Date Range</label>

      <div className="flex items-center justify-between gap-3">
        {/* From Input */}
        <div className="flex items-center flex-1 px-4 py-2.5 bg-white border border-gray-300 rounded-full shadow-sm focus-within:ring-2 focus-within:ring-[rgba(255,232,225,0.85)] transition">
          <Calendar size={16} className="mr-2 text-gray-500" />
          <input
            type="date"
            value={value.start}
            onChange={(e) => onChange({ ...value, start: e.target.value })}
            className="w-full text-sm text-gray-700 bg-transparent outline-none"
          />
        </div>

        <span className="text-gray-500 font-medium">to</span>

        {/* To Input */}
        <div className="flex items-center flex-1 px-4 py-2.5 bg-white border border-gray-300 rounded-full shadow-sm focus-within:ring-2 focus-within:ring-[rgba(255,232,225,0.85)] transition">
          <Calendar size={16} className="mr-2 text-gray-500" />
          <input
            type="date"
            value={value.end}
            onChange={(e) => onChange({ ...value, end: e.target.value })}
            className="w-full text-sm text-gray-700 bg-transparent outline-none"
          />
        </div>
      </div>
    </div>
  );
}

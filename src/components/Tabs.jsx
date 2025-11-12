import React from "react";

/**
 * Fizzy Admin — Reusable Tabs Component
 *
 * Props:
 * - tabs: Array of { label: string, value: string }
 * - activeTab: string
 * - onChange: (tabValue: string) => void
 * - className (optional): string for custom margins or borders
 */

const Tabs = ({
  tabs = [],
  activeTab,
  onChange,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-wrap gap-8 border-b-2 border-slate-200 mb-10 ${className}`}
    >
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`pb-4 capitalize text-base font-bold tracking-wide transition-all duration-200 ${
            activeTab === tab.value
              ? "text-[#DF6229] border-b-3 border-[#DF6229] -mb-0.5"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default Tabs;

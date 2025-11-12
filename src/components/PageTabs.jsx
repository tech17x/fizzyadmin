import React from "react";

const PageTabs = ({ value, onChange, tabs }) => {
  return (
    <div className="flex gap-6 border-b border-gray-200 mb-6">
      {tabs.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={`pb-2 text-sm font-medium tracking-wide transition-all ${
            value === t.value
              ? "text-[#DF6229] border-b-2 border-[#DF6229]"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
};

export default PageTabs;
